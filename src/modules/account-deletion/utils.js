import { retryAfterSeconds } from './retryAfter'

/**
 * Maps a failed DELETE /account to what the dialog does:
 *   { field: 'email' | 'current_password' }  -> back to step 2 with a message under that field
 *   { messageKey, params }                   -> an alert on the confirmation step
 *   blocking: true when retrying cannot help (staff account)
 */
export function deletionError(error) {
  const status = error?.response?.status
  const data = error?.response?.data ?? {}
  const code = data.code
  const fields = data.errors ?? {}
  if (status === 422 && fields.email?.[0] === 'email_mismatch') return { field: 'email', messageKey: 'accountDeletion.errors.emailMismatch' }
  if (status === 422 && fields.current_password?.[0] === 'invalid_current_password') {
    return { field: 'current_password', messageKey: 'accountDeletion.errors.invalidPassword' }
  }
  if (status === 403 && code === 'staff_account') return { messageKey: 'accountDeletion.errors.staff', blocking: true }
  if (status === 409 && code === 'pending_payment') return { messageKey: 'accountDeletion.errors.pendingPayment' }
  if (status === 429 || code === 'too_many_attempts') {
    const seconds = retryAfterSeconds(error)
    if (!seconds) return { messageKey: 'accountDeletion.errors.tooMany' }
    const minutes = Math.ceil(seconds / 60)
    return minutes > 1
      ? { messageKey: 'accountDeletion.errors.tooManyMinutes', params: { minutes } }
      : { messageKey: 'accountDeletion.errors.tooManySeconds', params: { seconds } }
  }
  return { messageKey: 'accountDeletion.errors.generic' }
}
