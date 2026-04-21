import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import NewsCard from '../components/NewsCard'
import SkeletonCard from '../components/SkeletonCard'
import CategoryFilterBar from '../components/CategoryFilterBar'
import Footer from '../components/Footer'
import { getDigestHistory } from '../api/digest'
import { useDigestByDate } from '../hooks/useDigestByDate'
import type { DigestHistoryItem } from '../types'

function formatDateDisplay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function isoDate(dateStr: string): string {
  return new Date(dateStr).toISOString().slice(0, 10)
}

export default function HistoricoPage() {
  const [history, setHistory] = useState<DigestHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [menuOpen, setMenuOpen] = useState(false)

  const { data: digest, loading, error } = useDigestByDate(selectedDate)

  useEffect(() => {
    getDigestHistory(1, 60)
      .then((res) => {
        setHistory(res.digests)
        // Default: most recent past digest (not today)
        const today = new Date().toISOString().slice(0, 10)
        const past = res.digests.find((d) => isoDate(d.date) !== today)
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
  const rest = filtered.slice(2)

  useEffect(() => {
    document.title = `Histórico — El Resumen del Día`
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#141412]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <nav className="hidden sm:flex gap-6 mb-6 text-sm font-medium border-b border-[#E5E2DC] dark:border-[#2E2D2A] pb-3">
          <Link
            to="/"
            className="text-[#6B6860] dark:text-[#9B9890] hover:text-[#1A1916] dark:hover:text-[#F0EDE8] transition-colors pb-3 -mb-3"
          >
            Hoy
          </Link>
          <Link
            to="/historico"
            className="text-[#C41E3A] dark:text-[#E8304A] border-b-2 border-[#C41E3A] dark:border-[#E8304A] pb-3 -mb-3"
          >
            Histórico
          </Link>
        </nav>

        <div className="flex gap-6">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-52 shrink-0">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[#6B6860] dark:text-[#9B9890] mb-3">
              Ediciones anteriores
            </h2>
            {historyLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-8 bg-[#E5E2DC] dark:bg-[#2E2D2A] rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <nav className="space-y-1">
                {history.map((item) => {
                  const iso = isoDate(item.date)
                  const isSelected = iso === selectedDate
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedDate(iso)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        isSelected
                          ? 'bg-[#C41E3A] dark:bg-[#E8304A] text-white'
                          : 'hover:bg-[#E5E2DC] dark:hover:bg-[#2E2D2A] text-[#1A1916] dark:text-[#F0EDE8]'
                      }`}
                    >
                      <span className="block capitalize">
                        {new Date(item.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span
                        className={`text-xs ${isSelected ? 'text-white/70' : 'text-[#6B6860] dark:text-[#9B9890]'}`}
                      >
                        {item.totalArticles} artículos
                      </span>
                    </button>
                  )
                })}
              </nav>
            )}
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile date selector */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-full flex items-center justify-between px-4 py-2 bg-[#FFFFFF] dark:bg-[#1E1D1B] border border-[#E5E2DC] dark:border-[#2E2D2A] rounded-lg text-sm"
              >
                <span>
                  {selectedDate
                    ? formatDateDisplay(selectedDate)
                    : 'Selecciona una fecha'}
                </span>
                <span>{menuOpen ? '▲' : '▼'}</span>
              </button>
              {menuOpen && (
                <div className="mt-1 bg-[#FFFFFF] dark:bg-[#1E1D1B] border border-[#E5E2DC] dark:border-[#2E2D2A] rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                  {history.map((item) => {
                    const iso = isoDate(item.date)
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedDate(iso)
                          setMenuOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E5E2DC] dark:hover:bg-[#2E2D2A] ${
                          iso === selectedDate ? 'text-[#C41E3A] dark:text-[#E8304A] font-medium' : ''
                        }`}
                      >
                        {new Date(item.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {selectedDate && (
              <h1 className="font-serif text-xl font-bold mb-4 capitalize text-[#1A1916] dark:text-[#F0EDE8]">
                {formatDateDisplay(selectedDate)}
              </h1>
            )}

            {articles.length > 0 && (
              <div className="mb-5">
                <CategoryFilterBar activeCategory={activeCategory} onChange={setActiveCategory} />
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!loading && error && (
              <p className="py-16 text-center text-[#6B6860] dark:text-[#9B9890]">
                No hay resumen para este día.
              </p>
            )}

            {!loading && !error && filtered.length > 0 && (
              <>
                {featured.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    {featured.map((a) => (
                      <NewsCard key={a.id} article={a} isFeatured />
                    ))}
                  </div>
                )}
                {rest.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {rest.map((a) => (
                      <NewsCard key={a.id} article={a} />
                    ))}
                  </div>
                )}
              </>
            )}

            {!loading && !error && digest && filtered.length === 0 && articles.length > 0 && (
              <p className="py-16 text-center text-[#6B6860] dark:text-[#9B9890]">
                No hay artículos en esta categoría.
              </p>
            )}

            {!historyLoading && history.length === 0 && (
              <p className="py-16 text-center text-[#6B6860] dark:text-[#9B9890]">
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
