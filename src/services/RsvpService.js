import { CWM_API } from './axios'

class RsvpService {
  async create({
                 eventId,
                 firstName,
                 lastName,
                 email,
                 phoneNumber,
                 companionType,
                 companionQty,
                 companionList
  }) {
    return CWM_API.post(`event/${eventId}/guest`, {
      firstName,
      lastName,
      email,
      phoneNumber,
      companionType,
      companionQty,
      companionList
    })
  }

  async loadRsvp({ eventId }) {
    return CWM_API.get(`event/${eventId}/rsvp`)
  }
}

export default new RsvpService()
