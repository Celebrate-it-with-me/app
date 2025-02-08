import { CWM_API } from './axios'

class TemplateService {
  async getEventData({ eventId, guestCode }) {
    return CWM_API.get(`template/event/${eventId}/guest/${guestCode}`)
  }
}

export default new TemplateService()
