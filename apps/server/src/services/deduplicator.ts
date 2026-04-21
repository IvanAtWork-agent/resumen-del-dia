import natural from 'natural'
import type { RawArticle } from './feedFetcher.js'

const { PorterStemmerEs } = natural

export interface RepresentativeArticle extends RawArticle {
  coverageCount: number
}

const STOPWORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'y', 'a', 'que',
  'con', 'por', 'para', 'es', 'su', 'se', 'al', 'lo', 'le', 'les', 'me', 'te',
  'nos', 'mi', 'tu', 'si', 'no', 'ya', 'hay', 'fue', 'han', 'son', 'más',
  'pero', 'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas',
  'todo', 'toda', 'todos', 'todas', 'como', 'sobre', 'entre', 'hasta',
  'tras', 'ante', 'bajo', 'cada', 'gran', 'ser', 'tiene', 'han', 'sea',
])

function tokenize(text: string): Set<string> {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')

  const words = normalized.split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w))

  return new Set(words.map((w) => PorterStemmerEs.stem(w)))
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1
  let intersection = 0
  for (const word of a) {
    if (b.has(word)) intersection++
  }
  const union = a.size + b.size - intersection
  return union === 0 ? 0 : intersection / union
}

class UnionFind {
  private parent: number[]
  private rank: number[]

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i)
    this.rank = new Array(n).fill(0)
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x])
    }
    return this.parent[x]
  }

  union(x: number, y: number) {
    const px = this.find(x)
    const py = this.find(y)
    if (px === py) return
    if (this.rank[px] < this.rank[py]) {
      this.parent[px] = py
    } else if (this.rank[px] > this.rank[py]) {
      this.parent[py] = px
    } else {
      this.parent[py] = px
      this.rank[px]++
    }
  }
}

export function deduplicate(articles: RawArticle[]): RepresentativeArticle[] {
  const n = articles.length
  if (n === 0) return []

  const tokenSets = articles.map((a) => tokenize(a.title + ' ' + a.summary))
  const uf = new UnionFind(n)

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (jaccard(tokenSets[i], tokenSets[j]) >= 0.35) {
        uf.union(i, j)
      }
    }
  }

  const clusters = new Map<number, number[]>()
  for (let i = 0; i < n; i++) {
    const root = uf.find(i)
    if (!clusters.has(root)) clusters.set(root, [])
    clusters.get(root)!.push(i)
  }

  const representatives: RepresentativeArticle[] = []
  for (const members of clusters.values()) {
    const best = members.reduce((prev, curr) => {
      const pa = articles[prev]
      const ca = articles[curr]
      if (ca.sourceWeight > pa.sourceWeight) return curr
      if (ca.sourceWeight === pa.sourceWeight && ca.summary.length > pa.summary.length)
        return curr
      return prev
    })

    representatives.push({
      ...articles[best],
      coverageCount: members.length,
    })
  }

  return representatives
}
