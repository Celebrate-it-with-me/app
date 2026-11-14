/** Helpers for the admin preview iframe: who may talk to it and what they may send. */

/** Origin (scheme + host + port) of a URL, or null when it is missing or not a URL. */
export function parseOrigin(value) {
  try {
    return value ? new URL(value).origin : null
  } catch {
    return null
  }
}

/** Minimal shape check: an object with a `sections` array and a `theme` object. */
export function isValidPayload(payload) {
  return (
    !!payload &&
    typeof payload === 'object' &&
    Array.isArray(payload.sections) &&
    !!payload.theme &&
    typeof payload.theme === 'object' &&
    !Array.isArray(payload.theme)
  )
}
