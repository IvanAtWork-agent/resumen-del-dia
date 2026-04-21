const pad = (n: number) => String(n).padStart(2, '0')

function timestamp() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

export const logger = {
  info: (msg: string, ...args: unknown[]) =>
    console.log(`[${timestamp()}] INFO  ${msg}`, ...args),
  warn: (msg: string, ...args: unknown[]) =>
    console.warn(`[${timestamp()}] WARN  ${msg}`, ...args),
  error: (msg: string, ...args: unknown[]) =>
    console.error(`[${timestamp()}] ERROR ${msg}`, ...args),
  debug: (msg: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${timestamp()}] DEBUG ${msg}`, ...args)
    }
  },
}
