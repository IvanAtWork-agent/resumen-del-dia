import { useState, useEffect } from 'react'
import { getSources, updateSource, createSource, deleteSource } from '../../api/admin'
import type { RssSource } from '../../types'

const CATEGORIES = ['general', 'economia', 'politica', 'tecnologia', 'sociedad', 'internacional', 'tendencias']

interface FormState {
  name: string
  url: string
  category: string
  authorityWeight: number
}

const emptyForm: FormState = { name: '', url: '', category: 'general', authorityWeight: 5 }

export default function AdminSources() {
  const [sources, setSources] = useState<RssSource[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<FormState>(emptyForm)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    getSources()
      .then(setSources)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleToggle(source: RssSource) {
    await updateSource(source.id, { isActive: !source.isActive })
    load()
  }

  async function handleEditSave(id: number) {
    setSaving(true)
    setError(null)
    try {
      await updateSource(id, editForm)
      setEditId(null)
      load()
    } catch (err: unknown) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleAdd() {
    setSaving(true)
    setError(null)
    try {
      await createSource(addForm)
      setShowAdd(false)
      setAddForm(emptyForm)
      load()
    } catch (err: unknown) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Desactivar esta fuente? Podrás reactivarla más tarde.')) return
    await deleteSource(id)
    load()
  }

  function startEdit(source: RssSource) {
    setEditId(source.id)
    setEditForm({
      name: source.name,
      url: source.url,
      category: source.category,
      authorityWeight: source.authorityWeight,
    })
  }

  const inputCls = 'w-full border border-gray-300 dark:border-[#2E2D2A] rounded px-2 py-1 text-sm bg-white dark:bg-[#141412] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400'

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Fuentes RSS</h1>
        <button
          onClick={() => { setShowAdd(true); setError(null) }}
          className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded hover:opacity-90"
        >
          + Añadir fuente
        </button>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded">
          {error}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="mb-4 bg-white dark:bg-[#1E1D1B] border border-gray-200 dark:border-[#2E2D2A] rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">Nueva fuente</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nombre</label>
              <input className={inputCls} value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">URL del feed</label>
              <input className={inputCls} type="url" value={addForm.url} onChange={e => setAddForm(f => ({ ...f, url: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Categoría</label>
              <select className={inputCls} value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Peso (1–10): {addForm.authorityWeight}</label>
              <input type="range" min={1} max={10} value={addForm.authorityWeight} onChange={e => setAddForm(f => ({ ...f, authorityWeight: Number(e.target.value) }))} className="w-full" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAdd} disabled={saving} className="px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm rounded disabled:opacity-50">
              {saving ? 'Guardando…' : 'Añadir'}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-1 border border-gray-300 dark:border-[#2E2D2A] text-sm rounded hover:bg-gray-50 dark:hover:bg-[#2E2D2A]">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-white dark:bg-[#1E1D1B] border border-gray-200 dark:border-[#2E2D2A] rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E1D1B] border border-gray-200 dark:border-[#2E2D2A] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-[#2E2D2A]">
                <tr>
                  {['Nombre', 'Categoría', 'Peso', 'Activa', 'Última recogida', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2E2D2A]">
                {sources.map((source) => (
                  <tr key={source.id} className={source.isActive ? '' : 'opacity-50'}>
                    {editId === source.id ? (
                      <td colSpan={6} className="px-3 py-3">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <input className={inputCls} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre" />
                          <input className={inputCls} type="url" value={editForm.url} onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))} placeholder="URL" />
                          <select className={inputCls} value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 w-6 shrink-0">{editForm.authorityWeight}</span>
                            <input type="range" min={1} max={10} value={editForm.authorityWeight} onChange={e => setEditForm(f => ({ ...f, authorityWeight: Number(e.target.value) }))} className="flex-1" />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleEditSave(source.id)} disabled={saving} className="px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded disabled:opacity-50">
                            {saving ? '…' : 'Guardar'}
                          </button>
                          <button onClick={() => setEditId(null)} className="px-2 py-1 border border-gray-300 dark:border-[#2E2D2A] text-xs rounded hover:bg-gray-50 dark:hover:bg-[#2E2D2A]">
                            Cancelar
                          </button>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-3 py-2 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{source.name}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{source.category}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{source.authorityWeight}</td>
                        <td className="px-3 py-2">
                          <button onClick={() => handleToggle(source)} className={`text-xs px-2 py-0.5 rounded-full font-medium ${source.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                            {source.isActive ? 'Activa' : 'Inactiva'}
                          </button>
                        </td>
                        <td className="px-3 py-2 text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">
                          {source.lastFetchedAt ? new Date(source.lastFetchedAt).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <button onClick={() => startEdit(source)} className="px-2 py-0.5 text-xs border border-gray-300 dark:border-[#2E2D2A] rounded hover:bg-gray-50 dark:hover:bg-[#2E2D2A]">
                              Editar
                            </button>
                            <button onClick={() => handleDelete(source.id)} className="px-2 py-0.5 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-950">
                              Desactivar
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
