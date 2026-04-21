import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import NewsCard from '../components/NewsCard'
import SkeletonCard from '../components/SkeletonCard'
import CategoryFilterBar from '../components/CategoryFilterBar'
import DigestStatusBanner from '../components/DigestStatusBanner'
import Footer from '../components/Footer'
import { useTodayDigest } from '../hooks/useTodayDigest'
import type { NewsArticle } from '../types'

export default function HomePage() {
  const { data, loading, error } = useTodayDigest()
  const [activeCategory, setActiveCategory] = useState('all')

  const digest = data && 'articles' in data ? data : null
  const isPending = data && 'status' in data && data.status === 'pending'

  const articles: NewsArticle[] = digest?.articles ?? []
  const filtered =
    activeCategory === 'all'
      ? articles
      : articles.filter((a) => a.category === activeCategory)

  const featured = filtered.slice(0, 2)
  const rest = filtered.slice(2)

  useEffect(() => {
    const today = new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    document.title = `El Resumen del Día — ${today}`
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#141412]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Nav */}
        <nav className="hidden sm:flex gap-6 mb-6 text-sm font-medium border-b border-[#E5E2DC] dark:border-[#2E2D2A] pb-3">
          <Link
            to="/"
            className="text-[#C41E3A] dark:text-[#E8304A] border-b-2 border-[#C41E3A] dark:border-[#E8304A] pb-3 -mb-3"
          >
            Hoy
          </Link>
          <Link
            to="/historico"
            className="text-[#6B6860] dark:text-[#9B9890] hover:text-[#1A1916] dark:hover:text-[#F0EDE8] transition-colors pb-3 -mb-3"
          >
            Histórico
          </Link>
        </nav>

        {/* Status banners */}
        {isPending && (
          <div className="mb-6">
            <DigestStatusBanner status="pending" message={(data as { message?: string }).message} />
          </div>
        )}
        {digest?.status === 'partial' && (
          <div className="mb-6">
            <DigestStatusBanner status="partial" message={digest.errorMessage ?? undefined} />
          </div>
        )}
        {digest?.status === 'error' && (
          <div className="mb-6">
            <DigestStatusBanner status="error" message={digest.errorMessage ?? undefined} />
          </div>
        )}
        {error && (
          <div className="mb-6">
            <DigestStatusBanner status="error" message={error} />
          </div>
        )}

        {/* Category filter */}
        {(loading || articles.length > 0) && (
          <div className="mb-6">
            <CategoryFilterBar activeCategory={activeCategory} onChange={setActiveCategory} />
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Content */}
        {!loading && filtered.length > 0 && (
          <>
            {/* Featured articles */}
            {featured.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                {featured.map((article) => (
                  <NewsCard key={article.id} article={article} isFeatured />
                ))}
              </div>
            )}

            {/* Regular grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && !isPending && filtered.length === 0 && articles.length > 0 && (
          <p className="text-center py-16 text-[#6B6860] dark:text-[#9B9890]">
            No hay artículos en esta categoría hoy.
          </p>
        )}
      </main>

      <Footer articles={articles} />
    </div>
  )
}
