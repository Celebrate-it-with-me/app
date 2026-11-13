/**
 * The event type chosen on the landing (?type=quinceanera|wedding) survives sign up, email confirmation and
 * sign in through localStorage, so the create-event form can preselect it. Storage can be blocked: every
 * access is guarded.
 */
export const PENDING_TYPE_KEY = 'quinvite:pending-event-type'
export const EVENT_TYPES = ['quinceanera', 'wedding']

/** `quinceanera` | `wedding` | null: anything else is ignored. */
export function cleanType(value) {
  const raw = Array.isArray(value) ? value[0] : value
  return EVENT_TYPES.includes(raw) ? raw : null
}

export function storePendingType(value, storage = globalThis.localStorage) {
  const type = cleanType(value)
  if (!type) return false
  try {
    storage.setItem(PENDING_TYPE_KEY, type)
    return true
  } catch {
    return false
  }
}

export function readPendingType(storage = globalThis.localStorage) {
  try {
    return cleanType(storage.getItem(PENDING_TYPE_KEY))
  } catch {
    return null
  }
}

export function clearPendingType(storage = globalThis.localStorage) {
  try {
    storage.removeItem(PENDING_TYPE_KEY)
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
