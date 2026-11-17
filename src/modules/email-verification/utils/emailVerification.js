/**
 * The API answers 403 `{ code: 'email_not_verified' }` when the organizer tries to publish the invitation or to buy
 * before verifying her email. It is not a "forbidden" page: a dialog explains it and offers to resend the email.
 */
export const EMAIL_NOT_VERIFIED = 'email_not_verified'

export function isEmailNotVerified(error) {
  return error?.response?.status === 403 && error?.response?.data?.code === EMAIL_NOT_VERIFIED
}

/** The three outcomes of the signed link, as the API redirects to `/email-verified?status=...`. */
export const VERIFY_STATUSES = ['ok', 'expired', 'invalid']

export function normalizeStatus(value) {
  const status = Array.isArray(value) ? value[0] : value
  return VERIFY_STATUSES.includes(status) ? status : 'invalid'
}
