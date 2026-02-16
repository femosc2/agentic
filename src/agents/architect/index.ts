import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

import { startPoller } from '../shared/poller.js'
import { processNextDraft } from './architectService.js'

const POLL_INTERVAL = parseInt(process.env.ARCHITECT_POLL_INTERVAL || '30000', 10)

console.log('='.repeat(60))
console.log('Architect Agent')
console.log('='.repeat(60))
console.log(`Poll interval: ${POLL_INTERVAL}ms`)
console.log('')

const stop = startPoller({
  name: 'Architect',
  intervalMs: POLL_INTERVAL,
  process: processNextDraft,
})

process.on('SIGINT', () => { stop(); process.exit(0) })
process.on('SIGTERM', () => { stop(); process.exit(0) })
