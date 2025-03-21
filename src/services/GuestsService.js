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

  async getMyEventGuests({ eventId, perPage, pageSelected }) {
    return CWM_API.get(`event/${eventId}/guest`, {
      params: {
        perPage,
        pageSelected
      }
    })
  }

  async removeCompanion(companionId) {
    return CWM_API.delete(`companion/${companionId}`, {})
  }

}

export default new GuestsService()
