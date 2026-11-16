import { CWM_API } from '@/services/axios'

/**
 * `VITE_ACCOUNT_DELETION_MOCK` swaps the API for an in-memory copy of the contract (see accountDeletionMock.js). Dev only:
 * `import.meta.env.DEV` is a build-time constant, so production bundles drop the dynamic import and the mock chunk.
 */
const getMock = async () => (import.meta.env.DEV && import.meta.env.VITE_ACCOUNT_DELETION_MOCK ? await import('./accountDeletionMock') : null)

class AccountDeletionService {
  /** What would happen to the account's data: counts, archive days and whether a password is asked. */
  async preview() {
    const mock = await getMock()
    if (mock) return mock.mockPreview()
    return await CWM_API.get('account/deletion-preview')
  }

  /** Deletes the account. The server closes the session on success. */
  async destroy({ email, currentPassword }) {
    const body = { email }
    if (currentPassword) body.current_password = currentPassword
    const mock = await getMock()
    if (mock) return mock.mockDestroy(body)
    return await CWM_API.delete('account', { data: body })
  }
}

export default new AccountDeletionService()
