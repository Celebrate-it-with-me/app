/**
 * Pure logic of a support ("impersonation") session in the organizer app.
 * The admin opens `/impersonate#token=…&expires=…`; the token lives only in THIS tab (sessionStorage).
 */

export const STORAGE_KEY = 'cwm-impersonation'
export const BLOCKED_CODE = 'impersonation_blocked'
export const IMPERSONATE_PATH = '/impersonate'

/** `#token=…&expires=…` → { token, expires } (expires is an ISO date or null), or null without a token. */
export function parseFragment(hash) {
  const params = new URLSearchParams(String(hash || '').replace(/^#/, ''))
  const token = (params.get('token') || '').trim()
  if (!token) return null
  const expires = params.get('expires')
  return { token, expires: expires && !Number.isNaN(Date.parse(expires)) ? expires : null }
}

/** Whole seconds left until `expiresAt` (never negative). Without a date there is no deadline: Infinity. */
export function remainingSeconds(expiresAt, now = Date.now()) {
  if (!expiresAt) return Infinity
  const end = Date.parse(expiresAt)
  if (Number.isNaN(end)) return 0
  return Math.max(0, Math.ceil((end - now) / 1000))
}

/** 2712 → "45:12"; over an hour → "1:05:00". */
export function formatCountdown(seconds) {
  if (!Number.isFinite(seconds)) return '--:--'
  const s = Math.max(0, Math.floor(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const pad = n => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`
}

/**
 * A download asks for a Blob, so an error answer arrives as a Blob too: read it as JSON so its `code` can be checked.
 * Leaves the error as it was when the body is not JSON.
 */
export async function readBlobBody(error) {
  const data = error?.response?.data
  if (typeof Blob === 'undefined' || !(data instanceof Blob)) return error
  try {
    error.response.data = JSON.parse(await data.text())
  } catch {
    /* not JSON: nothing to read */
  }
  return error
}

/** 403 `impersonation_blocked`: the server refused the action during a support session. */
export function isBlockedError(error) {
  return error?.response?.status === 403 && error.response.data?.code === BLOCKED_CODE
}

/** A 401 while a support session is active means it expired or was ended: the session cannot continue. */
export function isEndedError(error, active) {
  return Boolean(active) && error?.response?.status === 401
}

export function readSession(storage = globalThis.sessionStorage) {
  try {
    const raw = JSON.parse(storage.getItem(STORAGE_KEY) || 'null')
    return raw && typeof raw.token === 'string' && raw.token ? raw : null
  } catch {
    return null
  }
}

export function writeSession(session, storage = globalThis.sessionStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    /* private mode: the session still works until the page reloads */
  }
}

export function clearSession(storage = globalThis.sessionStorage) {
  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    /* nothing to clear */
  }
}

/** Is this page load a support tab? (the entry path, or a session already saved in this tab) */
export function isSupportTab(location = globalThis.location, storage = globalThis.sessionStorage) {
  const path = String(location?.pathname || '').replace(/\/+$/, '')
  return path === IMPERSONATE_PATH || readSession(storage) !== null
}
