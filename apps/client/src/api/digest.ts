import { apiClient } from './client'
import type { DailyDigest, DigestPending, DigestHistory } from '../types'

export async function getTodayDigest(): Promise<DailyDigest | DigestPending> {
  const { data } = await apiClient.get<DailyDigest | DigestPending>('/api/digest/today')
  return data
}

export async function getDigestByDate(date: string): Promise<DailyDigest> {
  const { data } = await apiClient.get<DailyDigest>(`/api/digest/${date}`)
  return data
}

export async function getDigestHistory(page = 1, limit = 30): Promise<DigestHistory> {
  const { data } = await apiClient.get<DigestHistory>('/api/digest/history', {
    params: { page, limit },
  })
  return data
}
