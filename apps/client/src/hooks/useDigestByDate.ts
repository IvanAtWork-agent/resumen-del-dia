import { useState, useEffect } from 'react'
import { getDigestByDate } from '../api/digest'
import type { DailyDigest } from '../types'

export function useDigestByDate(date: string | null) {
  const [data, setData] = useState<DailyDigest | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!date) return
    setLoading(true)
    setError(null)
    getDigestByDate(date)
      .then(setData)
      .catch((err) => {
        setError(String(err))
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [date])

  return { data, loading, error }
}
