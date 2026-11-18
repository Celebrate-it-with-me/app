/**
 * Caps how many live miniature iframes exist at once (each one boots the invitation engine). `acquire()` resolves with
 * a `release` function when a slot is free; waiting callers are served in order. `cancel()` on the returned handle
 * drops a waiting request, or frees the slot if it was already granted. Releasing twice is harmless.
 */
export function createIframeSlots(max = 3) {
  let active = 0
  const queue = []

  function drain() {
    while (active < max && queue.length) {
      const next = queue.shift()
      active++
      next.grant()
    }
  }

  function acquire() {
    let settled = false
    let granted = false
    let resolveFn
    const promise = new Promise(resolve => (resolveFn = resolve))
    const entry = {
      grant: () => {
        granted = true
        resolveFn(release)
      }
    }

    function release() {
      if (settled) return
      settled = true
      if (granted) {
        active--
        drain()
      } else {
        const index = queue.indexOf(entry)
        if (index >= 0) queue.splice(index, 1)
      }
    }

    queue.push(entry)
    drain()
    return { promise, cancel: release }
  }

  return { acquire, stats: () => ({ active, waiting: queue.length, max }) }
}

/** Shared by every miniature on screen. Three is enough for the dashboard hero plus the editor card; the selector (phase 2) reuses it. */
export const iframeSlots = createIframeSlots(3)
