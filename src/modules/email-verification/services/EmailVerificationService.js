import { CWM_API } from '@/services/axios'

class EmailVerificationService {
  /** Sends the verification email again. `{ verified: false }` after sending, `{ verified: true }` if it was already verified. 429 over the limit. */
  async resend() {
    return (await CWM_API.post('email/resend')).data
  }
}

export default new EmailVerificationService()
