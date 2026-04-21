import { useState, useEffect, useCallback } from 'react'
import { getLogs, getSources } from '../../api/admin'
import type { FetchLog, RssSource } from '../../types'

export default function AdminLogs() {
  const [logs, setLogs] = useState<FetchLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [sources, setSources] = useState<RssSource[]>([])
  const [filterSourceId, setFilterSourceId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set())

  const LIMIT = 50

  const load = useCallback(() => {
    setLoading(true)
    const params: Record<string, unknown> = { page, limit: LIMIT }
    if (filterSourceId) params.sourceId = Number(filterSourceId)
    if (filterStatus) params.status = filterStatus

    getLogs(params as Parameters<typeof getLogs>[0])
      .then((res) => {
        setLogs(res.logs)
        setTotal(res.total)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, filterSourceId, filterStatus])

  useEffect(() => { load() }, [load])
  useEffect(() => { getSources().then(setSources).catch(console.error) }, [])

  function toggleError(id: number) {
    setExpandedErrors((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalPages = Math.ceil(total / LIMIT)

  const STATUS_CLASS: Record<string, string> = {
    ok: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    empty: 'text-yellow-600 dark:text-yellow-400',
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Registros de recogida</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filterSourceId}
          onChange={(e) => { setFilterSourceId(e.target.value); setPage(1) }}
          className="border border-gray-300 dark:border-[#2E2D2A] rounded px-2 py-1 text-sm bg-white dark:bg-[#1E1D1B] text-gray-900 dark:text-white focus:outline-none"
        >
          <option value="">Todas las fuentes</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
          className="border border-gray-300 dark:border-[#2E2D2A] rounded px-2 py-1 text-sm bg-white dark:bg-[#1E1D1B] text-gray-900 dark:text-white focus:outline-none"
        >
          <option value="">Todos los estados</option>
          <option value="ok">ok</option>
          <option value="error">error</option>
          <option value="empty">vacío</option>
        </select>

        <button onClick={load} className="px-3 py-1 text-sm border border-gray-300 dark:border-[#2E2D2A] rounded hover:bg-gray-50 dark:hover:bg-[#2E2D2A]">
          Actualizar
        </button>

        <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
          {total} registros
        </span>
      </div>

      <div className="bg-white dark:bg-[#1E1D1B] border border-gray-200 dark:border-[#2E2D2A] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#2E2D2A]">
              <tr>
                {['Fecha/hora', 'Fuente', 'Estado', 'Artículos', 'Duración', 'Error'].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2E2D2A]">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-3 py-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full max-w-[100px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-gray-400 dark:text-gray-500">
                    No hay registros
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {new Date(log.fetchedAt).toLocaleString('es-ES', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-900 dark:text-white max-w-[140px] truncate">
                      {log.source.name}
                    </td>
                    <td className={`px-3 py-2 font-medium ${STATUS_CLASS[log.status] ?? ''}`}>
                      {log.status}
                    </td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                      {log.articlesFound} / {log.articlesUsed}
                    </td>
                    <td className="px-3 py-2 text-gray-400 dark:text-gray-500 whitespace-nowrap text-xs">
                      {log.durationMs != null ? `${log.durationMs}ms` : '—'}
                    </td>
                    <td className="px-3 py-2 max-w-[200px]">
                      {log.errorMessage ? (
                        <div>
                          <span className="text-xs text-red-600 dark:text-red-400">
                            {expandedErrors.has(log.id)
                              ? log.errorMessage
                              : log.errorMessage.slice(0, 100) +
                                (log.errorMessage.length > 100 ? '…' : '')}
                          </span>
                          {log.errorMessage.length > 100 && (
                            <button
                              onClick={() => toggleError(log.id)}
                              className="ml-1 text-xs text-gray-400 hover:text-gray-600 underline"
                            >
                              {expandedErrors.has(log.id) ? 'menos' : 'más'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-4 justify-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-[#2E2D2A] rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#2E2D2A]"
          >
            ← Anterior
          </button>
          <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-[#2E2D2A] rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#2E2D2A]"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
