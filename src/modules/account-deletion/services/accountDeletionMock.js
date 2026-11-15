/**
 * In-memory stand-in for the account-deletion endpoints, active when `VITE_ACCOUNT_DELETION_MOCK` is set. It follows
 * docs/plans/account-deletion-contract.md so the screen can be built and photographed before the API exists.
 * Values of the variable (`localStorage['cwm.accountDeletionMock']` overrides it at runtime):
 *   1         normal: has a password ("password"), 2 published, 1 unpublished, 1 collaboration
 *   social    hasPassword=false (social login account)
 *   empty     nothing to archive or delete
 *   staff     delete answers 403 staff_account
 *   pending   delete answers 409 pending_payment (and the preview shows one pending purchase)
 *   toomany   delete answers 429 too_many_attempts (Retry-After: 1800)
 *   error     delete answers 500
 *   previewerror  the preview answers 500
 */
export const MOCK_PASSWORD = 'password'

export function mockMode() {
  try {
    return localStorage.getItem('cwm.accountDeletionMock') || String(import.meta.env.VITE_ACCOUNT_DELETION_MOCK)
  } catch {
    return String(import.meta.env.VITE_ACCOUNT_DELETION_MOCK)
  }
}

function fail(status, data, headers = {}) {
  const error = new Error(`mock ${status}`)
  error.response = { status, data, headers }
  return error
}

function accountEmail() {
  try {
    return JSON.parse(localStorage.getItem('user-store') ?? '{}').email || 'marisol@cwm.test'
  } catch {
    return 'marisol@cwm.test'
  }
}

export function mockPreview() {
  const mode = mockMode()
  if (mode === 'previewerror') throw fail(500, { message: 'Server error.' })
  const events = mode === 'empty' ? { published: 0, unpublished: 0, collaborating: 0 } : { published: 2, unpublished: 1, collaborating: 1 }
  return {
    data: {
      data: {
        email: accountEmail(),
        hasPassword: mode !== 'social',
        events,
        archiveDays: 30,
        pendingPurchases: mode === 'pending' ? 1 : 0
      }
    }
  }
}

export function mockDestroy({ email, current_password: password }) {
  const mode = mockMode()
  if (mode === 'staff') throw fail(403, { message: 'Staff account.', code: 'staff_account' })
  if (mode === 'toomany') throw fail(429, { message: 'Too many attempts.', code: 'too_many_attempts' }, { 'retry-after': '1800' })
  if (mode === 'error') throw fail(500, { message: 'Server error.' })
  if (String(email ?? '').toLowerCase() !== accountEmail().toLowerCase()) {
    throw fail(422, { message: 'The email does not match.', errors: { email: ['email_mismatch'] } })
  }
  if (mode !== 'social' && password !== MOCK_PASSWORD) {
    throw fail(422, { message: 'The password is wrong.', errors: { current_password: ['invalid_current_password'] } })
  }
  if (mode === 'pending') throw fail(409, { message: 'A payment is in progress.', code: 'pending_payment' })
  const empty = mode === 'empty'
  return {
    data: { data: { deletedAt: new Date().toISOString(), archivedEvents: empty ? 0 : 2, deletedEvents: empty ? 0 : 1 } }
  }
}
