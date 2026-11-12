import { CWM_API } from '@/services/axios'

class RsvpService {
  /** Answers of the whole event (people by status), as the dashboard summarizes them. */
  async loadStats({ eventId }) {
    return CWM_API.get(`event/${eventId}/rsvp/stats`)
  }
}

export default new RsvpService()
