import type { RepresentativeArticle } from './deduplicator.js'

export interface ScoredArticle extends RepresentativeArticle {
  relevanceScore: number
}

const CATEGORY_CAPS: Record<string, number> = {
  politica: 3,
  internacional: 3,
  economia: 3,
  sociedad: 2,
  tecnologia: 3,
  tendencias: 2,
  general: 3,
}

function recencyBonus(publishedAt: Date): number {
  const ageHours = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60)
  if (ageHours < 2) return 10
  if (ageHours < 6) return 7
  if (ageHours < 12) return 4
  if (ageHours < 24) return 1
  return 0
}

function coverageBonus(count: number): number {
  if (count >= 5) return 15
  if (count >= 3) return 10
  if (count >= 2) return 5
  return 0
}

export function scoreAndSelect(articles: RepresentativeArticle[]): ScoredArticle[] {
  const scored: ScoredArticle[] = articles.map((a) => {
    const base = a.sourceWeight * 8
    const coverage = coverageBonus(a.coverageCount)
    const recency = recencyBonus(a.publishedAt)
    const score = Math.min(100, base + coverage + recency)
    return { ...a, relevanceScore: score }
  })

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore)

  const byCat = new Map<string, ScoredArticle[]>()
  for (const a of scored) {
    const cat = a.sourceCategory
    if (!byCat.has(cat)) byCat.set(cat, [])
    byCat.get(cat)!.push(a)
  }

  const capped: ScoredArticle[] = []
  for (const [cat, items] of byCat) {
    const limit = CATEGORY_CAPS[cat] ?? 5
    capped.push(...items.slice(0, limit))
  }

  capped.sort((a, b) => b.relevanceScore - a.relevanceScore)

  return capped
}
