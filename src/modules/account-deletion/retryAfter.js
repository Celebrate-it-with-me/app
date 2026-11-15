/** Seconds to wait from a 429's `Retry-After` header, or null when it is missing. */
export function retryAfterSeconds(error) {
  const seconds = Number.parseInt(error?.response?.headers?.['retry-after'], 10)
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null
}
