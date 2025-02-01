import { CWM_API } from './axios'

class EventsService {
  async create({ eventName, eventDescription, eventDate, status, visibility, customUrlSlug }) {
    return CWM_API.post(`event`, {
      eventName,
      eventDescription,
      eventDate,
      status,
      visibility,
      customUrlSlug
    })
  }

  async getMyEvents() {
    return CWM_API.get(`event` )
  }
}

export default new EventsService()
