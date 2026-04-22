export interface RssSource {
  id: number
  name: string
  url: string
  category: string
  authorityWeight: number
  isActive: boolean
  lastFetchedAt: string | null
  lastFetchStatus: string | null
  createdAt: string
}

export interface NewsArticle {
  id: number
  digestId: number
  sourceId: number
  title: string
  summary: string
  url: string
  imageUrl: string | null
  sourceName: string
  category: string
  publishedAt: string
  relevanceScore: number
  coverageCount: number
  createdAt: string
}

export interface DailyDigest {
  id: number
  date: string
  generatedAt: string
  totalArticles: number
  status: 'complete' | 'partial' | 'error'
  errorMessage: string | null
  aiSummary: string | null
  articles: NewsArticle[]
}

export interface DigestPending {
  status: 'pending'
  message: string
}

export interface DigestHistoryItem {
  id: number
  date: string
  totalArticles: number
  status: string
}

export interface DigestHistory {
  digests: DigestHistoryItem[]
  total: number
  page: number
  limit: number
}

export interface FetchLog {
  id: number
  sourceId: number
  fetchedAt: string
  articlesFound: number
  articlesUsed: number
  status: string
  errorMessage: string | null
  durationMs: number | null
  source: { name: string }
}

export interface FetchLogsResponse {
  logs: FetchLog[]
  total: number
  page: number
  limit: number
}

export interface AdminStats {
  totalDigests: number
  totalArticles: number
  sourceCount: { active: number; total: number }
  lastDigestDate: string | null
  lastDigestStatus: string | null
}
