import cron from 'node-cron'
import { generate, getIsGenerating } from '../services/digestGenerator.js'
import { logger } from '../lib/logger.js'
import { prisma } from '../lib/prisma.js' // used in fallback-08:00 check

function utcToday(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

function getMadridHour(): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Madrid',
    hour: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  return parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10)
}

async function startupCheck() {
  if (getMadridHour() < 7) return
  // Delegate entirely to generate() which already skips if today is complete
  // and now handles Neon cold-start retries internally.
  await runGeneration('startup')
}

async function runGeneration(label: string) {
  if (getIsGenerating()) {
    logger.warn(`[${label}] Generation already running — skipping cron trigger`)
    return
  }
  logger.info(`[${label}] Starting scheduled digest generation`)
  try {
    await generate()
  } catch (err) {
    logger.error(`[${label}] Scheduled generation failed:`, err)
  }
}

export function registerJobs() {
  // Primary: 07:00 Madrid time
  cron.schedule(
    '0 7 * * *',
    () => {
      void runGeneration('primary-07:00')
    },
    { timezone: 'Europe/Madrid' }
  )

  // Fallback: 08:00 Madrid time — only if primary did not produce a complete digest
  cron.schedule(
    '0 8 * * *',
    async () => {
      const todayDate = utcToday()
      const existing = await prisma.dailyDigest.findUnique({
        where: { date: todayDate },
        select: { status: true },
      })
      if (existing?.status === 'complete') {
        logger.info('[fallback-08:00] Primary digest already complete — skipping fallback')
        return
      }
      await runGeneration('fallback-08:00')
    },
    { timezone: 'Europe/Madrid' }
  )

  logger.info('Cron jobs registered: primary at 07:00 Europe/Madrid, fallback at 08:00 Europe/Madrid')

  // If the server restarted after the 07:00 window, catch up immediately
  void startupCheck()
}
