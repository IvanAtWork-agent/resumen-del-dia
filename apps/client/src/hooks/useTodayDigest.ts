import { useState, useEffect } from 'react'
import { getTodayDigest } from '../api/digest'
import type { DailyDigest, DigestPending } from '../types'

export function useTodayDigest() {
  const [data, setData] = useState<DailyDigest | DigestPending | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getTodayDigest()
      .then(setData)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
