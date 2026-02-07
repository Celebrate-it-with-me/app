import { CWM_API } from './axios'

class HydrationService {
  async   hydrate(userId) {
    return await CWM_API.get(`user/hydrate/${userId}`)
  }
}

export default new HydrationService()
