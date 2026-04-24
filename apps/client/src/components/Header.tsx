import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2"  x2="12" y2="4"  />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"   />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2"  y1="12" x2="4"  y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36"  />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
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
  const location = useLocation()
  const isHistorico = location.pathname === '/historico'

  return (
    <header className="sticky top-0 z-50 bg-[#F8F6F3]/90 dark:bg-[#0D0C0B]/90 backdrop-blur-md border-b border-[#E8E4DE] dark:border-[#252320]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Wordmark */}
        <Link
          to="/"
          className="font-serif font-bold text-[1.1rem] tracking-tight text-[#0F0E0D] dark:text-[#F2EFE9] leading-none shrink-0 hover:opacity-80 transition-opacity"
        >
          El Resumen del Día
        </Link>

        {/* Right cluster: nav + toggle */}
        <div className="flex items-center gap-0.5">
          <nav className="flex items-center mr-2" aria-label="Secciones principales">
            <Link
              to="/"
              className={`px-3 h-8 flex items-center text-[13px] font-medium rounded-md transition-all duration-200 ${
                !isHistorico
                  ? 'bg-[#0F0E0D] dark:bg-[#F2EFE9] text-white dark:text-[#0F0E0D]'
                  : 'text-[#5A5754] dark:text-[#9A9790] hover:text-[#0F0E0D] dark:hover:text-[#F2EFE9] hover:bg-[#E8E4DE] dark:hover:bg-[#252320]'
              }`}
            >
              Hoy
            </Link>
            <Link
              to="/historico"
              className={`px-3 h-8 flex items-center text-[13px] font-medium rounded-md transition-all duration-200 ${
                isHistorico
                  ? 'bg-[#0F0E0D] dark:bg-[#F2EFE9] text-white dark:text-[#0F0E0D]'
                  : 'text-[#5A5754] dark:text-[#9A9790] hover:text-[#0F0E0D] dark:hover:text-[#F2EFE9] hover:bg-[#E8E4DE] dark:hover:bg-[#252320]'
              }`}
            >
              Histórico
            </Link>
          </nav>

          {/* Divider */}
          <div className="w-px h-4 bg-[#E8E4DE] dark:bg-[#252320] mx-1" aria-hidden="true" />

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#E8E4DE] dark:hover:bg-[#252320] transition-colors text-[#5A5754] dark:text-[#9A9790]"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

      </div>
    </header>
  )
}
