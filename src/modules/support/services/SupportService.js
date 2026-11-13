import { CWM_API } from '@/services/axios'

class SupportService {
  /** Sends a help request. Resolves `{ id }`; rejects with 422 (invalid) or 429 (too many). */
  async send(payload) {
    return (await CWM_API.post('/support', payload)).data
  }

  /** The requests of the signed-in user. */
  async mine() {
    return (await CWM_API.get('/support')).data.data
  }
}

export default new SupportService()
