/** Links from the API are only rendered when they are absolute https URLs; anything else (javascript:, data:, http:, relative) returns null. */
export function safeHttpsUrl(value) {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}
