export interface PollerOptions {
  name: string
  intervalMs: number
  process: () => Promise<boolean>
}

export function startPoller(options: PollerOptions): () => void {
  const { name, intervalMs, process: processItem } = options
  let running = true
  let timeout: ReturnType<typeof setTimeout> | null = null

  console.log(`[${name}] Starting poller (interval: ${intervalMs}ms)`)

  const poll = async () => {
    if (!running) return

    try {
      console.log(`[${name}] Checking for work...`)
      const processed = await processItem()
      const delay = processed ? 1000 : intervalMs
      timeout = setTimeout(poll, delay)
    } catch (error) {
      console.error(`[${name}] Polling error:`, error)
      timeout = setTimeout(poll, intervalMs)
    }
  }

  poll()

  return () => {
    running = false
    if (timeout) clearTimeout(timeout)
    console.log(`[${name}] Stopped`)
  }
}
