import { CWM_API } from '@/services/axios'

class PublicEventService {
  async getPublicEventBySlug(slug) {
    const { data } = await CWM_API.get(`/public-events/${slug}`)
    return data
  }
}

export default new PublicEventService()
