import type { NewsArticle } from '../types'

interface Props {
  articles?: NewsArticle[]
}

export default function Footer({ articles }: Props) {
  const sources = articles
    ? [...new Set(articles.map((a) => a.sourceName))].sort()
    : []

  return (
    <footer className="mt-16 border-t border-[#E5E2DC] dark:border-[#2E2D2A] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {sources.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-[#6B6860] dark:text-[#9B9890] mb-2 uppercase tracking-wide">
              Fuentes utilizadas hoy:
            </p>
            <p className="text-sm text-[#6B6860] dark:text-[#9B9890]">
              {sources.join(' · ')}
            </p>
          </div>
        )}
        <p className="text-xs text-[#6B6860] dark:text-[#9B9890] mb-1">
          Los artículos enlazan a sus fuentes originales. El Resumen del Día no produce contenido
          propio.
        </p>
        <p className="text-xs text-[#6B6860] dark:text-[#9B9890]">
          © {new Date().getFullYear()} El Resumen del Día
        </p>
      </div>
    </footer>
  )
}
