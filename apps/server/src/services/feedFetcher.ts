import RssParser from 'rss-parser'
import { load as cheerioLoad } from 'cheerio'
import { prisma } from '../lib/prisma.js'
import { logger } from '../lib/logger.js'

type CustomItem = {
  'media:content'?: { $?: { url?: string }; url?: string }
  'media:thumbnail'?: { $?: { url?: string } }
  enclosure?: { url?: string }
}

export interface RawArticle {
  sourceId: number
  sourceName: string
  sourceCategory: string
  sourceWeight: number
  title: string
  summary: string
  url: string
  imageUrl: string | null
  publishedAt: Date
}

const UA = 'ElResumenDelDia/1.0 RSS Aggregator'

const parser = new RssParser<Record<string, unknown>, CustomItem>({
  headers: {
    'User-Agent': UA,
    Accept: 'application/rss+xml,application/atom+xml,text/xml,*/*',
  },
  timeout: 10000,
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['enclosure', 'enclosure'],
    ],
  },
})

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500)
}

function extractImageFromItem(item: CustomItem): string | null {
  if (item.enclosure?.url) return item.enclosure.url
  const mc = item['media:content']
  if (mc) {
    if (typeof mc === 'object' && mc.$?.url) return mc.$.url
    if (typeof mc === 'object' && (mc as { url?: string }).url)
      return (mc as { url?: string }).url!
  }
  const mt = item['media:thumbnail']
  if (mt?.$?.url) return mt.$.url
  return null
}

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const tid = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': UA },
    })
    clearTimeout(tid)
    if (!res.ok) return null
    const html = await res.text()
    const $ = cheerioLoad(html)
    return $('meta[property="og:image"]').attr('content') ?? null
  } catch {
    return null
  }
}

function isValidHttpsUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

export async function fetchAllFeeds(): Promise<RawArticle[]> {
  const sources = await prisma.rssSource.findMany({ where: { isActive: true } })
  const cutoff = new Date(Date.now() - 36 * 60 * 60 * 1000)
  const all: RawArticle[] = []

  await Promise.allSettled(
    sources.map(async (source) => {
      const start = Date.now()
      let articlesFound = 0
      let articlesUsed = 0
      let status: 'ok' | 'error' | 'empty' = 'ok'
      let errorMessage: string | undefined

      try {
        const feed = await parser.parseURL(source.url)
        articlesFound = feed.items.length

        const candidates: RawArticle[] = []
        for (const item of feed.items) {
          const title = (item.title ?? '').trim()
          const url = (item.link ?? item.guid ?? '').trim()
          if (!title || !isValidHttpsUrl(url)) continue

          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date()
          if (pubDate < cutoff) continue

          const rawSummary = item.contentSnippet ?? item.summary ?? item.content ?? ''
          const summary = stripHtml(rawSummary)

          let imageUrl = extractImageFromItem(item as CustomItem)
          if (!imageUrl) {
            imageUrl = await fetchOgImage(url)
          }

          candidates.push({
            sourceId: source.id,
            sourceName: source.name,
            sourceCategory: source.category,
            sourceWeight: source.authorityWeight,
            title,
            summary,
            url,
            imageUrl,
            publishedAt: pubDate,
          })
        }

        articlesUsed = candidates.length
        all.push(...candidates)

        if (candidates.length === 0) status = 'empty'

        await prisma.rssSource.update({
          where: { id: source.id },
          data: { lastFetchedAt: new Date(), lastFetchStatus: status },
        })
      } catch (err) {
        status = 'error'
        const raw = String(err)
        errorMessage = raw.slice(0, 500)
        logger.error(`Feed fetch failed for ${source.name}: ${errorMessage}`)

        await prisma.rssSource.update({
          where: { id: source.id },
          data: { lastFetchedAt: new Date(), lastFetchStatus: 'error' },
        })
      }

      await prisma.fetchLog.create({
        data: {
          sourceId: source.id,
          articlesFound,
          articlesUsed,
          status,
          errorMessage,
          durationMs: Date.now() - start,
        },
      })
    })
  )

  return all
}
