import { startPoller } from '../shared/poller.js'
import { reconcileInProgressTasks } from './monitorService.js'

const POLL_INTERVAL = parseInt(process.env.MONITOR_POLL_INTERVAL || '60000', 10)

const stop = startPoller({
  name: 'Monitor',
  intervalMs: POLL_INTERVAL,
  process: reconcileInProgressTasks,
})

process.on('SIGINT', () => {
  stop()
  process.exit(0)
})
