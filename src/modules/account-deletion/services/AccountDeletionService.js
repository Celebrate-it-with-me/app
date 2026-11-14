import { CWM_API } from '@/services/axios'
import { mockDestroy, mockPreview } from './accountDeletionMock'

/** `VITE_ACCOUNT_DELETION_MOCK` swaps the API for an in-memory copy of the contract (see accountDeletionMock.js). */
const mocked = () => !!import.meta.env.VITE_ACCOUNT_DELETION_MOCK

class AccountDeletionService {
  /** What would happen to the account's data: counts, archive days and whether a password is asked. */
  async preview() {
    if (mocked()) return mockPreview()
    return await CWM_API.get('account/deletion-preview')
  }

  /** Deletes the account. The server closes the session on success. */
  async destroy({ email, currentPassword }) {
    const body = { email }
    if (currentPassword) body.current_password = currentPassword
    if (mocked()) return mockDestroy(body)
    return await CWM_API.delete('account', { data: body })
  }
}

export default new AccountDeletionService()
