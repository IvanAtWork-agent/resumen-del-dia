import { Outlet, NavLink, Link } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/sources', label: 'Fuentes', icon: '📡' },
  { to: '/admin/logs', label: 'Registros', icon: '📋' },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#141412] flex flex-col">
      {/* Top bar */}
      <header className="bg-white dark:bg-[#1E1D1B] border-b border-gray-200 dark:border-[#2E2D2A] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xs text-gray-500 dark:text-gray-400 hover:underline">
            ← Sitio público
          </Link>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
            Backoffice — El Resumen del Día
          </span>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar — desktop */}
        <aside className="hidden sm:flex flex-col w-48 bg-white dark:bg-[#1E1D1B] border-r border-gray-200 dark:border-[#2E2D2A] pt-4">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-100 dark:bg-[#2E2D2A] text-gray-900 dark:text-white font-medium border-r-2 border-gray-800 dark:border-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2E2D2A]'
                }`
              }
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1E1D1B] border-t border-gray-200 dark:border-[#2E2D2A] flex">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs gap-0.5 transition-colors ${
                isActive
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
