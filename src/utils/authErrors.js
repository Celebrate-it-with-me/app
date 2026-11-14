/**
 * Turns an auth API error into a message for the person: the "too many attempts" 429 (with the wait time from
 * `Retry-After` when it comes) and the expired reset link. Anything else returns the fallback.
 */
export function retryAfterSeconds(error) {
  const raw = error?.response?.headers?.['retry-after']
  const seconds = Number.parseInt(raw, 10)
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null
}

export function authErrorMessage(error, t, fallback) {
  const status = error?.response?.status
  const code = error?.response?.data?.code
  if (status === 429 || code === 'too_many_attempts') {
    const seconds = retryAfterSeconds(error)
    if (!seconds) return t('auth.tooManyAttempts')
    const minutes = Math.ceil(seconds / 60)
    return minutes > 1 ? t('auth.tooManyAttemptsMinutes', { minutes }) : t('auth.tooManyAttemptsSeconds', { seconds })
  }
  if (code === 'invalid_reset_token') return t('auth.resetExpired')
  return fallback ?? error?.response?.data?.message ?? t('common.genericError')
}

/** The reset token travels in the signed link too; used when the response body does not carry it. */
export function tokenFromLink(link) {
  try {
    return new URL(link, 'http://localhost').searchParams.get('token') ?? ''
  } catch {
    return ''
  }
}
