import { ref, shallowRef } from 'vue'

/** A 403 means "not for you" (a module outside the plan, a role without the permission): the block hides, it is no error. */
export const hiddenByDefault = error => error?.response?.status === 403

/**
 * One Inicio block's request with its own state, so a slow or failed request only touches its block.
 * `status`: loading | ready | error | hidden. `load(eventId)` asks again; an answer that arrives after a newer `load`
 * (another event picked in the meantime, a retry) is dropped, so data of event A never shows under event B.
 * `quiet` refreshes without the skeleton when the same event's data is already on screen (and keeps it on a failure).
 *
 * @param {(eventId: number|string) => Promise<any>} fetcher
 * @param {{ hideOn?: (error: any) => boolean }} [options]
 */
export function useDashboardBlock(fetcher, { hideOn = hiddenByDefault } = {}) {
  const status = ref('loading')
  const data = shallowRef(null)
  let current = 0
  let owner = null

  async function load(eventId, { quiet = false } = {}) {
    const id = ++current
    const keep = quiet && owner === eventId && status.value === 'ready'
    if (!keep) {
      status.value = 'loading'
      if (owner !== eventId) data.value = null
    }
    owner = eventId
    try {
      const value = await fetcher(eventId)
      if (id !== current) return
      data.value = value
      status.value = 'ready'
    } catch (error) {
      if (id !== current || keep) return
      data.value = null
      status.value = hideOn(error) ? 'hidden' : 'error'
    }
  }

  /** Nothing to load (the block does not apply): it stays hidden. */
  function hide() {
    current++
    owner = null
    data.value = null
    status.value = 'hidden'
  }

  return { status, data, load, hide }
}
