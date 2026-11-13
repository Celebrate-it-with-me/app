import { reactive } from 'vue'
import { SUSPENDED_SUPPORT_EMAIL } from '@/config/brand'

/** Code the API sends (403) when a suspended account signs in or uses a token. */
export const ACCOUNT_SUSPENDED_CODE = 'account_suspended'

/** Support email for the suspended screen; set when the API sent it, otherwise the brand fallback. */
export const suspendedState = reactive({ supportEmail: '' })

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isAccountSuspended(error) {
  return error?.response?.status === 403 && error.response.data?.code === ACCOUNT_SUSPENDED_CODE
}

/** The email the API sent, if it looks like one; otherwise the fallback. */
export function supportEmailFrom(error) {
  const email = error?.response?.data?.supportEmail
  return typeof email === 'string' && EMAIL.test(email) ? email : SUSPENDED_SUPPORT_EMAIL
}

/** The Google sign-in callback redirects with `?status=error&reason=account_suspended` (no email). */
export function isSuspendedSocialCallback(query = {}) {
  return query.status === 'error' && query.reason === ACCOUNT_SUSPENDED_CODE
}

export function rememberSupportEmail(email) {
  suspendedState.supportEmail = email || SUSPENDED_SUPPORT_EMAIL
}
