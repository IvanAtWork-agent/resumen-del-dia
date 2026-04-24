import type { NewsArticle } from '../types'

interface Props {
  articles?: NewsArticle[]
}

export default function Footer({ articles }: Props) {
  const sources = articles
    ? [...new Set(articles.map((a) => a.sourceName))].sort()
    : []

  return (
    <footer className="mt-20 border-t border-[#E8E4DE] dark:border-[#252320]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">

          <div>
            <p className="font-serif text-sm font-bold text-[#0F0E0D] dark:text-[#F2EFE9] mb-1">
              El Resumen del Día
            </p>
            <p className="text-[12px] text-[#9A9790] leading-relaxed max-w-xs">
              Los artículos enlazan a sus fuentes originales.<br />No producimos contenido propio.
            </p>
          </div>

          {sources.length > 0 && (
            <div className="max-w-sm">
              <p className="text-[10px] font-semibold text-[#9A9790] uppercase tracking-[0.14em] mb-2">
                Fuentes
              </p>
              <p className="text-[12px] text-[#9A9790] leading-relaxed">
                {sources.join(' · ')}
              </p>
            </div>
          )}

        </div>

        <p className="text-[11px] text-[#C8C5C0] dark:text-[#3A3836] mt-8">
          © {new Date().getFullYear()} El Resumen del Día
        </p>
      </div>
    </footer>
  )
}
