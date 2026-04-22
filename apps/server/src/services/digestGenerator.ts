import { prisma } from '../lib/prisma.js'
import { logger } from '../lib/logger.js'
import { fetchAllFeeds } from './feedFetcher.js'
import { deduplicate } from './deduplicator.js'
import { detectCategory } from './categoryDetector.js'
import { scoreAndSelect } from './relevanceScorer.js'
import type { DailyDigest, NewsArticle } from '@prisma/client'

let isGenerating = false

export function getIsGenerating() {
  return isGenerating
}

function utcToday(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export async function generate(force = false): Promise<DailyDigest & { articles: NewsArticle[] }> {
  if (isGenerating) throw new Error('Generation already in progress')
  isGenerating = true

  try {
    const todayDate = utcToday()

    const existing = await prisma.dailyDigest.findUnique({
      where: { date: todayDate },
      include: { articles: { orderBy: { relevanceScore: 'desc' } } },
    })

    if (existing?.status === 'complete' && !force) {
      logger.info('Digest for today already complete — skipping generation')
      return existing
    }

    if (existing) {
      await prisma.dailyDigest.delete({ where: { id: existing.id } })
      logger.info(`Deleted previous ${existing.status} digest to regenerate`)
    }

    logger.info('Starting digest generation...')
    let status: 'complete' | 'partial' | 'error' = 'complete'
    let errorMessage: string | undefined

    let rawArticles = await fetchAllFeeds()
    logger.info(`Fetched ${rawArticles.length} raw articles from feeds`)

    if (rawArticles.length === 0) {
      status = 'error'
      errorMessage = 'No articles fetched from any source'
    }

    const deduped = deduplicate(rawArticles)
    logger.info(`After deduplication: ${deduped.length} unique stories`)

    const categorized = deduped.map(detectCategory)
    const scored = scoreAndSelect(categorized)
    logger.info(`After scoring and selection: ${scored.length} articles`)

    if (scored.length < 10) {
      status = status === 'error' ? 'error' : 'partial'
      if (status !== 'error') {
        errorMessage = `Only ${scored.length} articles available (minimum is 10)`
      }
    }

    const digest = await prisma.$transaction(async (tx) => {
      const d = await tx.dailyDigest.create({
        data: {
          date: todayDate,
          totalArticles: scored.length,
          status: status === 'error' && scored.length > 0 ? 'partial' : status,
          errorMessage,
        },
      })

      if (scored.length > 0) {
        await tx.newsArticle.createMany({
          data: scored.map((a) => ({
            digestId: d.id,
            sourceId: a.sourceId,
            title: a.title,
            summary: a.summary,
            url: a.url,
            imageUrl: a.imageUrl,
            sourceName: a.sourceName,
            category: a.sourceCategory,
            publishedAt: a.publishedAt,
            relevanceScore: a.relevanceScore,
            coverageCount: a.coverageCount,
          })),
        })
      }

      return tx.dailyDigest.findUniqueOrThrow({
        where: { id: d.id },
        include: { articles: { orderBy: { relevanceScore: 'desc' } } },
      })
    })

    logger.info(`Digest generation complete: ${digest.totalArticles} articles, status=${digest.status}`)
    return digest
  } catch (err) {
    logger.error('Digest generation failed:', err)

    const todayDate = utcToday()
    try {
      await prisma.dailyDigest.upsert({
        where: { date: todayDate },
        create: {
          date: todayDate,
          totalArticles: 0,
          status: 'error',
          errorMessage: String(err).slice(0, 500),
        },
        update: {
          status: 'error',
          errorMessage: String(err).slice(0, 500),
          generatedAt: new Date(),
        },
      })
    } catch (innerErr) {
      logger.error('Could not write error digest:', innerErr)
    }

    throw err
  } finally {
    isGenerating = false
  }
}
