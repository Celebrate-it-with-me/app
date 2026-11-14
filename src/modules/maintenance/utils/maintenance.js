/**
 * Maintenance mode. The API answers `GET public/system-status` -> `{ maintenance, message, estimatedEnd }` and, while
 * it is on, 503 `{ code: 'maintenance', message, retryAfter }` to everything else. Nothing here may ever block the app
 * by mistake: anything unexpected reads as "not in maintenance".
 */

export const MAINTENANCE = 'maintenance'
export const POLL_MS = 60_000
export const RETRY_MIN_S = 30
export const RETRY_MAX_S = 300
export const DISMISS_KEY = 'quinvite.maintenance.dismissed'

/** The guest pages of the public invitation: there the notice is informative only. */
const GUEST_PATH = /^\/(i|template)\//
const GUEST_URL = /^\/?(invitation|template)\//

export function isMaintenanceError(error) {
  return error?.response?.status === 503 && error?.response?.data?.code === MAINTENANCE
}

export function isGuestPath(path) {
  return GUEST_PATH.test(String(path || ''))
}

export function isGuestRequestUrl(error) {
  return GUEST_URL.test(String(error?.config?.url || ''))
}

/** Validates the status payload; anything odd means "no maintenance". */
export function parseStatus(data) {
  if (!data || typeof data !== 'object' || data.maintenance !== true) {
    return { maintenance: false, message: null, estimatedEnd: null }
  }
  const message = typeof data.message === 'string' && data.message.trim() ? data.message.trim() : null
  const end = typeof data.estimatedEnd === 'string' ? new Date(data.estimatedEnd) : null
  return {
    maintenance: true,
    message,
    estimatedEnd: end && !Number.isNaN(end.getTime()) ? end.toISOString() : null
  }
}

/** Seconds to wait before asking again: the server hint, never under 30 s, growing by 1.5x per failed attempt, capped. */
export function retryDelaySeconds(retryAfter, attempt = 0) {
  const hint = Number.isFinite(Number(retryAfter)) ? Number(retryAfter) : 0
  const base = Math.max(RETRY_MIN_S, hint)
  return Math.min(RETRY_MAX_S, Math.round(base * 1.5 ** attempt))
}

/** "13 nov, 4:30 p. m." in the person's language; null when there is no valid date. */
export function formatEstimatedEnd(iso, locale = 'es') {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
  } catch {
    return date.toLocaleString()
  }
}

export function readDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

export function writeDismissed(value) {
  try {
    if (value) sessionStorage.setItem(DISMISS_KEY, '1')
    else sessionStorage.removeItem(DISMISS_KEY)
  } catch {
    /* storage unavailable: dismissal lasts until reload */
  }
}
