import { useState, useEffect, useCallback } from 'react'
import { getAdminStats } from '../api/admin'
import type { AdminStats } from '../types'

export function useAdminStats() {
  const [data, setData] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setLoading(true)
    getAdminStats()
      .then(setData)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { data, loading, error, refresh }
}
