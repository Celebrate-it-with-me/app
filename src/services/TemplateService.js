import { CWM_API } from './axios'

class TemplateService {
  async getEventData({ eventId, guestCode }) {
    return CWM_API.get(`template/event/${eventId}/guest/${guestCode}`)
  }

  async saveRsvp({eventId, guest}) {
    return CWM_API.post(`template/event/${eventId}/save-rsvp`, {
      guest
    })
  }

  async refreshGuestData({ eventId, guestCode }) {
    return CWM_API.get(`template/event/${eventId}/guest/${guestCode}/data`)
  }
}

export default new TemplateService()
