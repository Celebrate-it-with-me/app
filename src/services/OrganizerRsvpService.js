import { CWM_API } from './axios'

class OrganizerRsvpService {
  async confirmRsvp({ eventId, guestId, payload }) {
    return await CWM_API.put(`event/${eventId}/organizer/rsvp/${guestId}/confirm`, payload)
  }

  async getRsvpStatus({ eventId, guestId }) {
    return await CWM_API.get(`event/${eventId}/organizer/rsvp/${guestId}/status`)
  }

  async bulkApplyToCompanions({ eventId, guestId, payload }) {
    return await CWM_API.put(`event/${eventId}/organizer/rsvp/${guestId}/bulk-companions`, payload)
  }
}

export default new OrganizerRsvpService()
