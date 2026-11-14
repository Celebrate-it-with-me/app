/**
 * A discount code that came with the link (?code=LANZAMIENTO79 from the landing) survives sign up, email
 * confirmation (often another tab) and sign in through localStorage, so the payment panel can preload it.
 * It is only a suggestion: the API decides whether it still works. Storage can be blocked: every access
 * is guarded.
 */
export const PENDING_CODE_KEY = 'quinvite:pending-code'
/** The founder code shown on the landing. The API owns the limit; this is only the text we preload. */
export const LAUNCH_CODE = 'LANZAMIENTO79'

/** An upper-cased code made of letters, digits, `-` and `_` (3 to 40), or null: anything else is ignored. */
export function cleanCode(value) {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return null
  const code = raw.trim().toUpperCase()
  return /^[A-Z0-9_-]{3,40}$/.test(code) ? code : null
}

export function storePendingCode(value, storage = globalThis.localStorage) {
  const code = cleanCode(value)
  if (!code) return false
  try {
    storage.setItem(PENDING_CODE_KEY, code)
    return true
  } catch {
    return false
  }
}

export function readPendingCode(storage = globalThis.localStorage) {
  try {
    return cleanCode(storage.getItem(PENDING_CODE_KEY))
  } catch {
    return null
  }
}

export function clearPendingCode(storage = globalThis.localStorage) {
  try {
    storage.removeItem(PENDING_CODE_KEY)
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
