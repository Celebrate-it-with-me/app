import { CWM_API } from './axios'

class GuestsService {
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
}

export default new GuestsService()
