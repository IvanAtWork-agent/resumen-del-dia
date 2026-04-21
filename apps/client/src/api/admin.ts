import { apiClient } from './client'
import type { RssSource, AdminStats, FetchLogsResponse, DailyDigest } from '../types'

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await apiClient.get<AdminStats>('/api/admin/stats')
  return data
}

export async function generateDigest(): Promise<DailyDigest> {
  const { data } = await apiClient.post<DailyDigest>('/api/admin/digest/generate')
  return data
}

export async function getSources(): Promise<RssSource[]> {
  const { data } = await apiClient.get<RssSource[]>('/api/admin/sources')
  return data
}

export async function createSource(
  payload: Pick<RssSource, 'name' | 'url' | 'category' | 'authorityWeight'>
): Promise<RssSource> {
  const { data } = await apiClient.post<RssSource>('/api/admin/sources', payload)
  return data
}

export async function updateSource(
  id: number,
  payload: Partial<Pick<RssSource, 'name' | 'url' | 'category' | 'authorityWeight' | 'isActive'>>
): Promise<RssSource> {
  const { data } = await apiClient.patch<RssSource>(`/api/admin/sources/${id}`, payload)
  return data
}

export async function deleteSource(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/sources/${id}`)
}

export async function getLogs(params: {
  page?: number
  limit?: number
  sourceId?: number
  status?: string
}): Promise<FetchLogsResponse> {
  const { data } = await apiClient.get<FetchLogsResponse>('/api/admin/logs', { params })
  return data
}
