import { getCurrentScope, onScopeDispose, ref } from 'vue'
import { pollDelay } from '../utils/sendWizard'

const MAX_FAILURES = 3

/**
 * Watches a send batch (contract 3.5): reads it through `fetcher` (returns the batch, merged if the send was chained),
 * then again every 2 s while something is queued, every 5 s for a minute after that, and stops. Pauses while the tab is
 * hidden and looks again as soon as it is visible. Three failed reads in a row stop it with `error` set.
 *
 *   const { batch, error, polling, start, stop } = useBatchPolling(() => WhatsappService.batch(eventId, id))
 *   start()
 */
export function useBatchPolling(fetcher, options = {}) {
  const batch = ref(null)
  const error = ref(null)
  const polling = ref(false)
  let timer = null
  let quietSince = null
  let failures = 0
  let runId = 0

  const clear = () => clearTimeout(timer)

  async function tick(id) {
    try {
      const next = await fetcher()
      if (id !== runId) return
      failures = 0
      error.value = null
      batch.value = next
      if (next && next.queued === 0) quietSince ??= Date.now()
      else quietSince = null
      schedule(id, pollDelay(next, quietSince ? Date.now() - quietSince : 0, options))
    } catch (e) {
      if (id !== runId) return
      failures++
      if (failures >= MAX_FAILURES) {
        error.value = e
        polling.value = false
        return
      }
      schedule(id, options.slow ?? 5000)
    }
  }

  function schedule(id, delay) {
    clear()
    if (delay === null) {
      polling.value = false
      return
    }
    if (typeof document !== 'undefined' && document.hidden) return // resumes on visibilitychange
    timer = setTimeout(() => tick(id), delay)
  }

  function onVisibility() {
    if (!polling.value || document.hidden) return clear()
    clear()
    tick(runId)
  }

  /** Starts (or restarts) watching: reads at once. */
  function start() {
    stop()
    runId++
    failures = 0
    quietSince = null
    error.value = null
    polling.value = true
    document.addEventListener('visibilitychange', onVisibility)
    return tick(runId)
  }

  function stop() {
    runId++
    clear()
    polling.value = false
    document.removeEventListener('visibilitychange', onVisibility)
  }

  if (getCurrentScope()) onScopeDispose(stop)
  return { batch, error, polling, start, stop }
}
