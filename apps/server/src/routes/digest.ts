import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

function utcDateFromString(dateStr: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (!m) return null
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
}

// GET /api/digest/today
router.get('/today', async (_req: Request, res: Response) => {
  const now = new Date()
  const todayDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  const digest = await prisma.dailyDigest.findUnique({
    where: { date: todayDate },
    include: { articles: { orderBy: { relevanceScore: 'desc' } } },
  })

  if (!digest) {
    return res.json({
      status: 'pending',
      message: 'El resumen de hoy está siendo generado. Vuelve en unos minutos.',
    })
  }

  return res.json(digest)
})

// GET /api/digest/history
router.get('/history', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page)) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit)) || 30))
  const skip = (page - 1) * limit

  const [digests, total] = await Promise.all([
    prisma.dailyDigest.findMany({
      select: { id: true, date: true, totalArticles: true, status: true },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.dailyDigest.count(),
  ])

  return res.json({ digests, total, page, limit })
})

// GET /api/digest/:date
router.get('/:date', async (req: Request, res: Response) => {
  const date = utcDateFromString(req.params.date)
  if (!date) return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' })

  const digest = await prisma.dailyDigest.findUnique({
    where: { date },
    include: { articles: { orderBy: { relevanceScore: 'desc' } } },
  })

  if (!digest) return res.status(404).json({ error: 'Digest not found for this date.' })

  return res.json(digest)
})

export default router
