import { useState } from 'react'
import { useAdminStats } from '../../hooks/useAdminStats'
import { generateDigest, getSources } from '../../api/admin'
import type { RssSource } from '../../types'
import { useEffect } from 'react'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-[#1E1D1B] rounded-lg border border-gray-200 dark:border-[#2E2D2A] p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const { data: stats, loading: statsLoading, refresh } = useAdminStats()
  const [generating, setGenerating] = useState(false)
  const [genResult, setGenResult] = useState<string | null>(null)
  const [genError, setGenError] = useState<string | null>(null)
  const [sources, setSources] = useState<RssSource[]>([])

  useEffect(() => {
    getSources().then(setSources).catch(console.error)
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    setGenResult(null)
    setGenError(null)
    try {
      const digest = await generateDigest()
      setGenResult(`✅ Resumen generado: ${digest.totalArticles} artículos (estado: ${digest.status})`)
      refresh()
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'error' in err.response.data
          ? String((err.response.data as { error: unknown }).error)
          : String(err)
      setGenError(`❌ ${msg}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#1E1D1B] rounded-lg border border-gray-200 dark:border-[#2E2D2A] p-4 animate-pulse"
            >
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-2/3" />
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))
        ) : stats ? (
          <>
            <StatCard label="Total resúmenes" value={stats.totalDigests} />
            <StatCard label="Total artículos" value={stats.totalArticles} />
            <StatCard label="Fuentes activas" value={`${stats.sourceCount.active}/${stats.sourceCount.total}`} />
            <StatCard
              label="Último estado"
              value={stats.lastDigestStatus ?? '—'}
            />
          </>
        ) : null}
      </div>

      {/* Digest status */}
      {stats && (
        <div className="bg-white dark:bg-[#1E1D1B] rounded-lg border border-gray-200 dark:border-[#2E2D2A] p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Estado del resumen de hoy
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Último resumen:{' '}
            <strong className="text-gray-900 dark:text-white">
              {stats.lastDigestDate
                ? new Date(stats.lastDigestDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Ninguno todavía'}
            </strong>
          </p>
        </div>
      )}

      {/* Generate button */}
      <div className="bg-white dark:bg-[#1E1D1B] rounded-lg border border-gray-200 dark:border-[#2E2D2A] p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Generar resumen manualmente
        </h2>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
        >
          {generating && (
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
          {generating ? 'Generando…' : 'Regenerar resumen de hoy'}
        </button>
        {genResult && (
          <p className="mt-2 text-sm text-green-700 dark:text-green-400">{genResult}</p>
        )}
        {genError && (
          <p className="mt-2 text-sm text-red-700 dark:text-red-400">{genError}</p>
        )}
      </div>

      {/* Sources status table */}
      <div className="bg-white dark:bg-[#1E1D1B] rounded-lg border border-gray-200 dark:border-[#2E2D2A] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-[#2E2D2A]">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Estado de las fuentes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#2E2D2A]">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Fuente
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Última recogida
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2E2D2A]">
              {sources.map((s) => (
                <tr key={s.id} className={s.isActive ? '' : 'opacity-40'}>
                  <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                    {s.name}
                  </td>
                  <td className="px-4 py-2 text-gray-500 dark:text-gray-400">
                    {s.lastFetchedAt
                      ? new Date(s.lastFetchedAt).toLocaleString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-2">
                    {s.lastFetchStatus === 'ok' && (
                      <span className="text-green-600 dark:text-green-400">✓ ok</span>
                    )}
                    {s.lastFetchStatus === 'error' && (
                      <span className="text-red-600 dark:text-red-400">✗ error</span>
                    )}
                    {s.lastFetchStatus === 'empty' && (
                      <span className="text-yellow-600 dark:text-yellow-400">— vacío</span>
                    )}
                    {!s.lastFetchStatus && (
                      <span className="text-gray-400">sin datos</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
