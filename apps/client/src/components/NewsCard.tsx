import type { NewsArticle } from '../types'

const CATEGORY_BADGE: Record<string, string> = {
  politica: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  economia: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  internacional: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  tecnologia: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  sociedad: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  tendencias: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  general: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

const CATEGORY_PLACEHOLDER: Record<string, string> = {
  politica: 'bg-blue-200 dark:bg-blue-800',
  economia: 'bg-emerald-200 dark:bg-emerald-800',
  internacional: 'bg-purple-200 dark:bg-purple-800',
  tecnologia: 'bg-orange-200 dark:bg-orange-800',
  sociedad: 'bg-rose-200 dark:bg-rose-800',
  tendencias: 'bg-yellow-200 dark:bg-yellow-800',
  general: 'bg-gray-200 dark:bg-gray-700',
}

const CATEGORY_LABEL: Record<string, string> = {
  politica: 'Política',
  economia: 'Economía',
  internacional: 'Internacional',
  tecnologia: 'Tecnología',
  sociedad: 'Sociedad',
  tendencias: 'Tendencias',
  general: 'General',
}

function formatTimeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 60) return `hace ${diffMins}min`
  if (diffHours < 24) return `hace ${diffHours}h`
  return `hace ${diffDays}d`
}

interface Props {
  article: NewsArticle
  isFeatured?: boolean
}

export default function NewsCard({ article, isFeatured = false }: Props) {
  const badgeClass = CATEGORY_BADGE[article.category] ?? CATEGORY_BADGE.general
  const placeholderClass = CATEGORY_PLACEHOLDER[article.category] ?? CATEGORY_PLACEHOLDER.general
  const categoryLabel = CATEGORY_LABEL[article.category] ?? article.category

  if (isFeatured) {
    return (
      <article className="bg-[#FFFFFF] dark:bg-[#1E1D1B] border border-[#E5E2DC] dark:border-[#2E2D2A] rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt=""
              className="w-full aspect-video object-cover"
              loading="lazy"
            />
          ) : (
            <div className={`w-full aspect-video flex items-center justify-center ${placeholderClass}`}>
              <span className="text-4xl opacity-30">📰</span>
            </div>
          )}
          <span className="absolute top-3 right-3 bg-[#C41E3A] dark:bg-[#E8304A] text-white text-xs font-bold px-2 py-1 rounded">
            DESTACADO
          </span>
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded ${badgeClass}`}>
            {categoryLabel}
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs text-[#6B6860] dark:text-[#9B9890] mb-2">
            {article.sourceName} · {formatTimeAgo(article.publishedAt)}
          </p>
          <h2 className="font-serif text-xl sm:text-2xl font-bold leading-snug mb-3 text-[#1A1916] dark:text-[#F0EDE8]">
            {article.title}
          </h2>
          <p className="text-sm text-[#6B6860] dark:text-[#9B9890] leading-relaxed mb-3">
            {article.summary}
          </p>
          {article.coverageCount >= 2 && (
            <span className="inline-block text-xs bg-[#E5E2DC] dark:bg-[#2E2D2A] text-[#6B6860] dark:text-[#9B9890] px-2 py-1 rounded-full mb-3">
              Cubierto por {article.coverageCount} medios
            </span>
          )}
          <div>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[#C41E3A] dark:text-[#E8304A] hover:text-[#9B1729] dark:hover:text-[#C41E3A] transition-colors"
            >
              Leer más →
            </a>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="bg-[#FFFFFF] dark:bg-[#1E1D1B] border border-[#E5E2DC] dark:border-[#2E2D2A] rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {article.imageUrl ? (
        <img
          src={article.imageUrl}
          alt=""
          className="w-full aspect-video object-cover"
          loading="lazy"
        />
      ) : (
        <div className={`w-full aspect-video flex items-center justify-center ${placeholderClass}`}>
          <span className="text-3xl opacity-30">📰</span>
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badgeClass}`}>
            {categoryLabel}
          </span>
          {article.coverageCount >= 2 && (
            <span className="text-xs text-[#6B6860] dark:text-[#9B9890] shrink-0">
              {article.coverageCount} medios
            </span>
          )}
        </div>
        <p className="text-xs text-[#6B6860] dark:text-[#9B9890] mb-1">
          {article.sourceName} · {formatTimeAgo(article.publishedAt)}
        </p>
        <h3 className="font-serif font-bold text-base leading-snug mb-2 line-clamp-2 text-[#1A1916] dark:text-[#F0EDE8]">
          {article.title}
        </h3>
        <p className="text-sm text-[#6B6860] dark:text-[#9B9890] leading-relaxed line-clamp-3 flex-1 mb-3">
          {article.summary}
        </p>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-[#C41E3A] dark:text-[#E8304A] hover:text-[#9B1729] dark:hover:text-[#C41E3A] transition-colors"
        >
          Leer más →
        </a>
      </div>
    </article>
  )
}
