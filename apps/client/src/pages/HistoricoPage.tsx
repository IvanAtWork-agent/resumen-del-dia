import { useState, useEffect } from 'react'
import Header from '../components/Header'
import NewsCard from '../components/NewsCard'
import SkeletonCard from '../components/SkeletonCard'
import CategoryFilterBar from '../components/CategoryFilterBar'
import AISummaryCard from '../components/AISummaryCard'
import Footer from '../components/Footer'
import { getDigestHistory } from '../api/digest'
import { useDigestByDate } from '../hooks/useDigestByDate'
import type { DigestHistoryItem } from '../types'

function formatDateDisplay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function isoDate(dateStr: string): string {
  return new Date(dateStr).toISOString().slice(0, 10)
}

export default function HistoricoPage() {
  const [history, setHistory]           = useState<DigestHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [menuOpen, setMenuOpen]         = useState(false)

  const { data: digest, loading, error } = useDigestByDate(selectedDate)

  useEffect(() => {
    getDigestHistory(1, 60)
      .then((res) => {
        setHistory(res.digests)
        const today = new Date().toISOString().slice(0, 10)
        const past  = res.digests.find((d) => isoDate(d.date) !== today)
        if (past) setSelectedDate(isoDate(past.date))
        else if (res.digests.length > 0) setSelectedDate(isoDate(res.digests[0].date))
      })
      .catch(console.error)
      .finally(() => setHistoryLoading(false))
  }, [])

  const articles = digest?.articles ?? []
  const filtered =
    activeCategory === 'all' ? articles : articles.filter((a) => a.category === activeCategory)
  const featured = filtered.slice(0, 2)
  const rest     = filtered.slice(2)

  useEffect(() => {
    document.title = `Histórico — El Resumen del Día`
  }, [])

  return (
    <div className="min-h-screen bg-[#F8F6F3] dark:bg-[#0D0C0B]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-9 pb-6">
        <div className="flex gap-6">

          {/* ── Sidebar (desktop only) ── */}
          <aside className="hidden lg:flex flex-col w-48 shrink-0">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9A9790] mb-3 mt-1">
              Ediciones
            </h2>

            {historyLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-9 bg-[#EDEAE5] dark:bg-[#252320] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <nav className="space-y-0.5" aria-label="Ediciones anteriores">
                {history.map((item) => {
                  const iso        = isoDate(item.date)
                  const isSelected = iso === selectedDate
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedDate(iso)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${
                        isSelected
                          ? 'bg-[#0F0E0D] dark:bg-[#F2EFE9] text-white dark:text-[#0F0E0D]'
                          : 'text-[#0F0E0D] dark:text-[#F2EFE9] hover:bg-[#EDEAE5] dark:hover:bg-[#252320]'
                      }`}
                    >
                      <span className="block capitalize font-medium">
                        {new Date(item.date).toLocaleDateString('es-ES', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                      <span className={`text-[11px] ${isSelected ? 'text-white/60 dark:text-[#0F0E0D]/50' : 'text-[#9A9790]'}`}>
                        {item.totalArticles} artículos
                      </span>
                    </button>
                  )
                })}
              </nav>
            )}
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Mobile date picker */}
            <div className="lg:hidden mb-5">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-haspopup="listbox"
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#161514] rounded-xl text-[13px] font-medium shadow-[0_1px_4px_rgba(0,0,0,0.07)] dark:ring-1 dark:ring-[#252320]"
              >
                <span className="text-[#0F0E0D] dark:text-[#F2EFE9]">
                  {selectedDate ? formatDateDisplay(selectedDate) : 'Selecciona una fecha'}
                </span>
                <span
                  className={`text-[#9A9790] transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              {menuOpen && (
                <div
                  role="listbox"
                  aria-label="Ediciones anteriores"
                  className="mt-1.5 bg-white dark:bg-[#161514] rounded-xl overflow-hidden max-h-52 overflow-y-auto shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:ring-1 dark:ring-[#252320]"
                >
                  {history.map((item) => {
                    const iso = isoDate(item.date)
                    return (
                      <button
                        key={item.id}
                        role="option"
                        aria-selected={iso === selectedDate}
                        onClick={() => { setSelectedDate(iso); setMenuOpen(false) }}
                        className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#F8F6F3] dark:hover:bg-[#252320] transition-colors ${
                          iso === selectedDate ? 'text-[#C41E3A] dark:text-[#E8304A] font-semibold' : 'text-[#0F0E0D] dark:text-[#F2EFE9]'
                        }`}
                      >
                        {new Date(item.date).toLocaleDateString('es-ES', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Page heading */}
            {selectedDate && (
              <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-7 capitalize text-[#0F0E0D] dark:text-[#F2EFE9] leading-tight animate-fade-in">
                {formatDateDisplay(selectedDate)}
              </h1>
            )}

            {/* AI Briefing */}
            {!loading && activeCategory === 'all' && digest?.aiSummary && (
              <div className="animate-fade-in">
                <AISummaryCard summary={digest.aiSummary} date={digest.date} />
              </div>
            )}

            {/* Category filter */}
            {articles.length > 0 && (
              <div className="mb-7 animate-fade-in">
                <CategoryFilterBar activeCategory={activeCategory} onChange={setActiveCategory} />
              </div>
            )}

            {/* Skeletons */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Error / empty text */}
            {!loading && error && (
              <p className="py-20 text-center text-[13px] text-[#9A9790]">
                No hay resumen para este día.
              </p>
            )}

            {/* Content */}
            {!loading && !error && filtered.length > 0 && (
              <div key={`${selectedDate}-${activeCategory}`}>
                {featured.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-10">
                    {featured.map((a, i) => (
                      <div
                        key={a.id}
                        className="animate-fade-up"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <NewsCard article={a} isFeatured />
                      </div>
                    ))}
                  </div>
                )}

                {rest.length > 0 && (
                  <>
                    <div className="flex items-center gap-4 mb-7" aria-hidden="true">
                      <div className="h-px flex-1 bg-[#E8E4DE] dark:bg-[#252320]" />
                      <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#C0BDB8] dark:text-[#3A3836]">
                        Más noticias
                      </span>
                      <div className="h-px flex-1 bg-[#E8E4DE] dark:bg-[#252320]" />
                    </div>

                    <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0 lg:snap-none">
                      {rest.map((a, i) => (
                        <div
                          key={a.id}
                          className="shrink-0 w-[76vw] sm:w-[45vw] lg:w-auto snap-start animate-fade-up"
                          style={{ animationDelay: `${(i + featured.length) * 60}ms` }}
                        >
                          <NewsCard article={a} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {!loading && !error && digest && filtered.length === 0 && articles.length > 0 && (
              <p className="py-20 text-center text-[13px] text-[#9A9790]">
                No hay artículos en esta categoría.
              </p>
            )}

            {!historyLoading && history.length === 0 && (
              <p className="py-20 text-center text-[13px] text-[#9A9790]">
                No hay resúmenes anteriores todavía.
              </p>
            )}

          </div>
        </div>
      </main>

      <Footer articles={articles} />
    </div>
  )
}
