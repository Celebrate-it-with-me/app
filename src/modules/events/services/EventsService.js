import { CWM_API } from '@/services/axios'

class EventsService {
  async create(eventData) {
    return CWM_API.post(`event`, eventData)
  }

  async get(eventId) {
    return CWM_API.get(`event/${eventId}`)
  }

  /** Partial update: only the fields in `patch` change. */
  async update(eventId, patch) {
    return CWM_API.patch(`event/${eventId}`, patch)
  }

  /** `publish` | `unpublish` | `archive` | `restore` */
  async runAction(eventId, action, body = {}) {
    return CWM_API.post(`event/${eventId}/${action}`, body)
  }

  async getMyEvents() {
    return CWM_API.get(`events`)
  }

  async filterEvents(query) {
    return CWM_API.get(`event/filters`, {
      params: {
        query
      }
    })
  }

  async updateActiveEvent(event) {
    return await CWM_API.patch(`event/active-event`, {
      eventId: event.id
    })
  }

  async removeCurrentEvent(currentEventId) {
    return await CWM_API.delete(`event/${currentEventId}`)
  }

  async loadEventsPlansAndType() {
    return await CWM_API.get(`events/load-events-plans-and-types`)
  }

  async loadSuggestions({ eventId }) {
    return await CWM_API.get(`event/${eventId}/suggestions`)
  }

  async getEventPermissions(eventId) {
    return await CWM_API.get(`event/${eventId}/permissions`)
  }
}

export default new EventsService()
