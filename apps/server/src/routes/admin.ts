import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { generate, getIsGenerating } from '../services/digestGenerator.js'
import { generateAISummary } from '../services/aiSummaryGenerator.js'

const router = Router()

// POST /api/admin/digest/generate
router.post('/digest/generate', async (req: Request, res: Response) => {
  if (getIsGenerating()) {
    return res.status(409).json({ error: 'La generación ya está en curso. Inténtalo en unos minutos.' })
  }
  try {
    const force = req.query.force === 'true' || req.body?.force === true
    const digest = await generate(force)
    return res.json(digest)
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
})

// GET /api/admin/test-ai
router.get('/test-ai', async (_req: Request, res: Response) => {
  const key = process.env.GEMINI_API_KEY
  if (!key) return res.json({ ok: false, error: 'GEMINI_API_KEY not set' })
  try {
    const result = await generateAISummary([
      {
        sourceId: 0, sourceName: 'Test', sourceCategory: 'economia', sourceWeight: 8,
        title: 'El Banco Central sube los tipos de interés al 4%',
        summary: 'La entidad justifica la medida por la persistente inflación.',
        url: 'https://example.com', imageUrl: null,
        publishedAt: new Date(), relevanceScore: 80, coverageCount: 3,
      },
    ])
    return res.json({ ok: !!result, summary: result, keyPrefix: key.slice(0, 8) + '…' })
  } catch (err) {
    return res.json({ ok: false, error: String(err) })
  }
})

// GET /api/admin/sources
router.get('/sources', async (_req: Request, res: Response) => {
  const sources = await prisma.rssSource.findMany({ orderBy: { name: 'asc' } })
  return res.json(sources)
})

// POST /api/admin/sources
router.post('/sources', async (req: Request, res: Response) => {
  const { name, url, category, authorityWeight } = req.body as {
    name?: string
    url?: string
    category?: string
    authorityWeight?: number
  }

  if (!name || !url || !category) {
    return res.status(400).json({ error: 'name, url y category son obligatorios.' })
  }

  try {
    new URL(url)
  } catch {
    return res.status(400).json({ error: 'URL inválida.' })
  }

  const weight = Number(authorityWeight) || 5
  if (weight < 1 || weight > 10) {
    return res.status(400).json({ error: 'authorityWeight debe estar entre 1 y 10.' })
  }

  try {
    const source = await prisma.rssSource.create({
      data: { name, url, category, authorityWeight: weight },
    })
    return res.status(201).json(source)
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return res.status(409).json({ error: 'Ya existe una fuente con esa URL.' })
    }
    throw err
  }
})

// PATCH /api/admin/sources/:id
router.patch('/sources/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' })

  const { name, url, category, authorityWeight, isActive } = req.body as {
    name?: string
    url?: string
    category?: string
    authorityWeight?: number
    isActive?: boolean
  }

  if (url) {
    try {
      new URL(url)
    } catch {
      return res.status(400).json({ error: 'URL inválida.' })
    }
  }

  const weight = authorityWeight !== undefined ? Number(authorityWeight) : undefined
  if (weight !== undefined && (weight < 1 || weight > 10)) {
    return res.status(400).json({ error: 'authorityWeight debe estar entre 1 y 10.' })
  }

  const source = await prisma.rssSource.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(url !== undefined && { url }),
      ...(category !== undefined && { category }),
      ...(weight !== undefined && { authorityWeight: weight }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  return res.json(source)
})

// DELETE /api/admin/sources/:id — soft delete
router.delete('/sources/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' })

  await prisma.rssSource.update({
    where: { id },
    data: { isActive: false },
  })

  return res.json({ success: true })
})

// GET /api/admin/logs
router.get('/logs', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page)) || 1)
  const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit)) || 50))
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (req.query.sourceId) where.sourceId = parseInt(String(req.query.sourceId))
  if (req.query.status) where.status = req.query.status

  const [logs, total] = await Promise.all([
    prisma.fetchLog.findMany({
      where,
      include: { source: { select: { name: true } } },
      orderBy: { fetchedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.fetchLog.count({ where }),
  ])

  return res.json({ logs, total, page, limit })
})

// GET /api/admin/stats
router.get('/stats', async (_req: Request, res: Response) => {
  const [totalDigests, totalArticles, activeSourceCount, totalSourceCount, lastDigest] =
    await Promise.all([
      prisma.dailyDigest.count(),
      prisma.newsArticle.count(),
      prisma.rssSource.count({ where: { isActive: true } }),
      prisma.rssSource.count(),
      prisma.dailyDigest.findFirst({ orderBy: { date: 'desc' }, select: { date: true, status: true } }),
    ])

  return res.json({
    totalDigests,
    totalArticles,
    sourceCount: { active: activeSourceCount, total: totalSourceCount },
    lastDigestDate: lastDigest?.date ?? null,
    lastDigestStatus: lastDigest?.status ?? null,
  })
})

export default router
