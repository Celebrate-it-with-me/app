import { CWM_API } from './axios'

class EventsService {
  async create({
                 eventName,
                 eventDescription,
                 startDate,
                 endDate,
                 status,
                 visibility,
                 customUrlSlug,
                 saveTheDate,
                 rsvp,
                 sweetMemories,
                 music,
                 backgroundMusic,
                 eventComments,
                 seatsAccommodation,
                 preview,
                 eventBudget,
                 analytics
  }) {
    return CWM_API.post(`event`, {
      eventName,
      eventDescription,
      startDate,
      endDate,
      status,
      visibility,
      customUrlSlug,
      saveTheDate,
      rsvp,
      sweetMemories,
      music,
      backgroundMusic,
      eventComments,
      seatsAccommodation,
      preview,
      eventBudget,
      analytics
    })
  }

  async edit({
               eventId,
               eventName,
               eventDescription,
               startDate,
               endDate,
               status,
               visibility,
               customUrlSlug,
               saveTheDate,
               rsvp,
               sweetMemories,
               music,
               backgroundMusic,
               eventComments,
               seatsAccommodation,
               preview,
               eventBudget,
               analytics
             }) {
    return CWM_API.put(`event/${eventId}`, {
      eventName,
      eventDescription,
      startDate,
      endDate,
      status,
      visibility,
      customUrlSlug,
      saveTheDate,
      rsvp,
      sweetMemories,
      music,
      backgroundMusic,
      eventComments,
      seatsAccommodation,
      preview,
      eventBudget,
      analytics
    })
  }

  async getMyEvents() {
    return CWM_API.get(`event` )
  }

  async filterEvents(query) {
    return CWM_API.get(`event/filters`, {
      params: {
        query
      }
    })
  }

  async removeCurrentEvent(currentEventId) {
    return CWM_API.delete(`event/${currentEventId}`)
  }
}

export default new EventsService()
