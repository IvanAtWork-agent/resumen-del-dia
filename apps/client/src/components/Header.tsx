import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function useTheme() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  )

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return { isDark, toggle }
}

export default function Header() {
  const { isDark, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const today = new Date()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <header className="bg-[#FFFFFF] dark:bg-[#1E1D1B] border-b border-[#E5E2DC] dark:border-[#2E2D2A] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex flex-col min-w-0">
          <Link
            to="/"
            className="font-serif text-xl sm:text-2xl font-bold text-[#C41E3A] dark:text-[#E8304A] leading-tight truncate"
          >
            El Resumen del Día
          </Link>
          <span className="text-xs text-[#6B6860] dark:text-[#9B9890] hidden sm:block">
            Lo más importante de hoy, cada mañana
          </span>
          <span className="text-xs text-[#6B6860] dark:text-[#9B9890] capitalize">
            {formatDate(today)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="p-2 rounded-full hover:bg-[#E5E2DC] dark:hover:bg-[#2E2D2A] transition-colors text-lg"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          <button
            className="sm:hidden p-2 rounded hover:bg-[#E5E2DC] dark:hover:bg-[#2E2D2A] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden bg-[#FFFFFF] dark:bg-[#1E1D1B] border-t border-[#E5E2DC] dark:border-[#2E2D2A] px-4 py-2">
          <Link
            to="/"
            className="block py-2 text-sm font-medium hover:text-[#C41E3A] dark:hover:text-[#E8304A]"
          >
            Inicio
          </Link>
          <Link
            to="/historico"
            className="block py-2 text-sm font-medium hover:text-[#C41E3A] dark:hover:text-[#E8304A]"
          >
            Histórico
          </Link>
        </div>
      )}
    </header>
  )
}
