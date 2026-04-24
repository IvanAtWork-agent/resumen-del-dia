import { useState } from 'react'
import type { NewsArticle } from '../types'

const CATEGORY_BADGE: Record<string, string> = {
  politica:      'bg-blue-100/90   text-blue-800   dark:bg-blue-900/80   dark:text-blue-200',
  economia:      'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200',
  internacional: 'bg-purple-100/90  text-purple-800  dark:bg-purple-900/80  dark:text-purple-200',
  tecnologia:    'bg-orange-100/90  text-orange-800  dark:bg-orange-900/80  dark:text-orange-200',
  sociedad:      'bg-rose-100/90    text-rose-800    dark:bg-rose-900/80    dark:text-rose-200',
  tendencias:    'bg-yellow-100/90  text-yellow-800  dark:bg-yellow-900/80  dark:text-yellow-200',
  general:       'bg-gray-100/90    text-gray-700    dark:bg-gray-800/80    dark:text-gray-300',
}

const CATEGORY_PLACEHOLDER: Record<string, string> = {
  politica:      'bg-blue-200      dark:bg-blue-900',
  economia:      'bg-emerald-200   dark:bg-emerald-900',
  internacional: 'bg-purple-200    dark:bg-purple-900',
  tecnologia:    'bg-orange-200    dark:bg-orange-900',
  sociedad:      'bg-rose-200      dark:bg-rose-900',
  tendencias:    'bg-yellow-200    dark:bg-yellow-900',
  general:       'bg-neutral-200   dark:bg-neutral-800',
}

const CATEGORY_LABEL: Record<string, string> = {
  politica:      'Política',
  economia:      'Economía',
  internacional: 'Internacional',
  tecnologia:    'Tecnología',
  sociedad:      'Sociedad',
  tendencias:    'Tendencias',
  general:       'General',
}

function formatTimeAgo(dateStr: string): string {
  const diffMs   = Date.now() - new Date(dateStr).getTime()
  const diffMins  = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays  = Math.floor(diffHours / 24)
  if (diffMins  < 60) return `hace ${diffMins}min`
  if (diffHours < 24) return `hace ${diffHours}h`
  return `hace ${diffDays}d`
}

interface Props {
  article: NewsArticle
  isFeatured?: boolean
}

export default function NewsCard({ article, isFeatured = false }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const badgeClass       = CATEGORY_BADGE[article.category]       ?? CATEGORY_BADGE.general
  const placeholderClass = CATEGORY_PLACEHOLDER[article.category] ?? CATEGORY_PLACEHOLDER.general
  const categoryLabel    = CATEGORY_LABEL[article.category]       ?? article.category

  /* ─────────────────────────────────────────────
     FEATURED — cinematic overlay card
  ───────────────────────────────────────────── */
  if (isFeatured) {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={article.title}
        className="group relative block overflow-hidden rounded-xl aspect-[3/2] cursor-pointer"
      >
        {/* Image */}
        {article.imageUrl && !imgFailed ? (
          <img
            src={article.imageUrl}
            alt=""
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className={`absolute inset-0 ${placeholderClass}`} />
        )}

        {/* Gradient overlay — always present so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        {/* Content pinned to bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          {/* Meta row */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/55">
              {categoryLabel}
            </span>
            <span className="text-[10px] text-white/35">
              {article.sourceName} · {formatTimeAgo(article.publishedAt)}
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-serif text-[1.2rem] sm:text-[1.45rem] font-bold text-white leading-tight mb-3.5">
            {article.title}
          </h2>

          {/* Footer row */}
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#C41E3A] group-hover:text-[#E85070] transition-colors duration-200">
              Leer más
              <span className="transition-transform duration-200 group-hover:translate-x-0.5 inline-block" aria-hidden="true">→</span>
            </span>
            {article.coverageCount >= 2 && (
              <span className="text-[10px] text-white/30">
                {article.coverageCount} medios
              </span>
            )}
          </div>
        </div>
      </a>
    )
  }

  /* ─────────────────────────────────────────────
     REGULAR — editorial card
  ───────────────────────────────────────────── */
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={article.title}
      className="group flex flex-col bg-white dark:bg-[#161514] rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.07)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.11)] dark:shadow-none dark:ring-1 dark:ring-[#252320] dark:hover:ring-[#353330] transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#EDEAE5] dark:bg-[#252320] shrink-0">
        {article.imageUrl && !imgFailed ? (
          <img
            src={article.imageUrl}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${placeholderClass}`}>
            <span className="text-3xl opacity-15" aria-hidden="true">📰</span>
          </div>
        )}

        {/* Category badge — glass pill on image */}
        <span className={`absolute top-3 left-3 text-[10px] font-semibold tracking-[0.08em] uppercase px-2 py-1 rounded-md backdrop-blur-sm ${badgeClass}`}>
          {categoryLabel}
        </span>

        {/* Coverage badge */}
        {article.coverageCount >= 2 && (
          <span className="absolute top-3 right-3 text-[10px] font-medium text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
            {article.coverageCount} medios
          </span>
        )}
      </div>

      {/* Text body */}
      <div className="flex flex-col flex-1 p-4 pt-3.5">
        <p className="text-[11px] font-medium text-[#9A9790] mb-2 tracking-wide">
          {article.sourceName} · {formatTimeAgo(article.publishedAt)}
        </p>
        <h3 className="font-serif font-bold text-[15px] leading-snug line-clamp-2 text-[#0F0E0D] dark:text-[#F2EFE9] mb-2 flex-1">
          {article.title}
        </h3>
        <p className="text-[12.5px] text-[#5A5754] dark:text-[#9A9790] leading-relaxed line-clamp-3 mb-3.5">
          {article.summary}
        </p>
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#C41E3A] dark:text-[#E8304A] group-hover:text-[#A01830] dark:group-hover:text-[#C41E3A] transition-colors duration-200">
          Leer más
          <span className="transition-transform duration-200 group-hover:translate-x-0.5 inline-block" aria-hidden="true">→</span>
        </span>
      </div>
    </a>
  )
}
