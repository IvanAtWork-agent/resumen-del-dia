import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { registerJobs } from './jobs/dailyDigest.job.js'
import { logger } from './lib/logger.js'
import healthRouter from './routes/health.js'
import digestRouter from './routes/digest.js'
import adminRouter from './routes/admin.js'

const app = express()
const PORT = parseInt(process.env.PORT ?? '3001', 10)

// CORS
const corsOrigin =
  process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN ?? false
    : '*'

app.use(cors({ origin: corsOrigin }))

// Middleware
app.use(express.json({ strict: false }))
app.use(morgan('dev'))

// Routes
app.use('/api/health', healthRouter)
app.use('/api/digest', digestRouter)
app.use('/api/admin', adminRouter)

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logger.error('Unhandled error:', err)
    res.status(500).json({ error: 'Error interno del servidor.' })
  }
)

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV ?? 'development'}`)
  registerJobs()
})

export default app
