import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

import { startPoller } from '../shared/poller.js'
import { processNextItem } from './poService.js'

const POLL_INTERVAL = parseInt(process.env.PO_POLL_INTERVAL || '30000', 10)

console.log('='.repeat(60))
console.log('Product Owner Agent')
console.log('='.repeat(60))
console.log(`Poll interval: ${POLL_INTERVAL}ms`)
console.log('')

const stop = startPoller({
  name: 'ProductOwner',
  intervalMs: POLL_INTERVAL,
  process: processNextItem,
})

process.on('SIGINT', () => { stop(); process.exit(0) })
process.on('SIGTERM', () => { stop(); process.exit(0) })
