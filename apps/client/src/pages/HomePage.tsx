import { useState, useEffect } from 'react'
import Header from '../components/Header'
import NewsCard from '../components/NewsCard'
import SkeletonCard from '../components/SkeletonCard'
import CategoryFilterBar from '../components/CategoryFilterBar'
import DigestStatusBanner from '../components/DigestStatusBanner'
import AISummaryCard from '../components/AISummaryCard'
import Footer from '../components/Footer'
import { useTodayDigest } from '../hooks/useTodayDigest'
import type { NewsArticle } from '../types'

export default function HomePage() {
  const { data, loading, error } = useTodayDigest()
  const [activeCategory, setActiveCategory] = useState('all')

  const digest    = data && 'articles' in data ? data : null
  const isPending = data && 'status' in data && data.status === 'pending'

  const articles: NewsArticle[] = digest?.articles ?? []
  const filtered =
    activeCategory === 'all'
      ? articles
      : articles.filter((a) => a.category === activeCategory)

  const featured = filtered.slice(0, 2)
  const rest     = filtered.slice(2)

  const todayLabel = new Date().toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  useEffect(() => {
    document.title = `El Resumen del Día — ${todayLabel}`
  }, [todayLabel])

  return (
    <div className="min-h-screen bg-[#F8F6F3] dark:bg-[#0D0C0B]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-9 pb-6">

        {/* Editorial date heading */}
        <div className="mb-7 animate-fade-in">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F0E0D] dark:text-[#F2EFE9] leading-tight capitalize">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h1>
          <p className="text-[11px] font-medium text-[#9A9790] mt-1.5 tracking-[0.1em] uppercase">
            {new Date().getFullYear()} · El Resumen del Día
          </p>
        </div>

        {/* Status banners */}
        {isPending && (
          <div className="mb-6 animate-fade-in">
            <DigestStatusBanner status="pending" message={(data as { message?: string }).message} />
          </div>
        )}
        {digest?.status === 'partial' && (
          <div className="mb-6 animate-fade-in">
            <DigestStatusBanner status="partial" message={digest.errorMessage ?? undefined} />
          </div>
        )}
        {digest?.status === 'error' && (
          <div className="mb-6 animate-fade-in">
            <DigestStatusBanner status="error" message={digest.errorMessage ?? undefined} />
          </div>
        )}
        {error && (
          <div className="mb-6 animate-fade-in">
            <DigestStatusBanner status="error" message={error} />
          </div>
        )}

        {/* AI Briefing — above filter so it never jumps on category change */}
        {!loading && digest?.aiSummary && (
          <div className="animate-fade-in">
            <AISummaryCard summary={digest.aiSummary} date={digest.date} />
          </div>
        )}

        {/* Category filter */}
        {(loading || articles.length > 0) && (
          <div className="mb-7 animate-fade-in">
            <CategoryFilterBar activeCategory={activeCategory} onChange={setActiveCategory} />
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Content — re-keyed on category so animations replay */}
        {!loading && filtered.length > 0 && (
          <div key={activeCategory}>

            {/* Featured — 2-col cinematic cards */}
            {featured.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-10">
                {featured.map((article, i) => (
                  <div
                    key={article.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <NewsCard article={article} isFeatured />
                  </div>
                ))}
              </div>
            )}

            {/* Section divider */}
            {rest.length > 0 && (
              <div className="flex items-center gap-4 mb-7" aria-hidden="true">
                <div className="h-px flex-1 bg-[#E8E4DE] dark:bg-[#252320]" />
                <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#C0BDB8] dark:text-[#3A3836]">
                  Más noticias
                </span>
                <div className="h-px flex-1 bg-[#E8E4DE] dark:bg-[#252320]" />
              </div>
            )}

            {/* Rest articles — horizontal carousel on mobile, 3-col grid on desktop */}
            {rest.length > 0 && (
              <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0 lg:snap-none">
                {rest.map((article, i) => (
                  <div
                    key={article.id}
                    className="shrink-0 w-[76vw] sm:w-[45vw] lg:w-auto snap-start animate-fade-up"
                    style={{ animationDelay: `${(i + featured.length) * 60}ms` }}
                  >
                    <NewsCard article={article} />
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* Empty state */}
        {!loading && !isPending && filtered.length === 0 && articles.length > 0 && (
          <p className="text-center py-20 text-[13px] text-[#9A9790]">
            No hay artículos en esta categoría hoy.
          </p>
        )}

      </main>

      <Footer articles={articles} />
    </div>
  )
}
