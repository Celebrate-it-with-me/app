import { CWM_API } from './axios'
import { format } from 'date-fns'

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
      startDate: format(new Date(startDate), 'MM/dd/yyyy HH:mm'),
      endDate: format(new Date(endDate), 'MM/dd/yyyy HH:mm'),
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

  async updateActiveEvent(event) {
    return CWM_API.patch(`event/activeEvent`, {
      eventId: event.id
    })
  }

  async removeCurrentEvent(currentEventId) {
    return CWM_API.delete(`event/${currentEventId}`)
  }
}

export default new EventsService()
