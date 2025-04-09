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

  async getMyEventGuests({ eventId, perPage, pageSelected, searchValue }) {
    return CWM_API.get(`event/${eventId}/guest`, {
      params: {
        perPage,
        pageSelected,
        searchValue
      }
    })
  }

  async removeCompanion(companionId) {
    return CWM_API.delete(`companion/${companionId}`, {})
  }

  async updateCompanionType(guestId, companionType) {
    return CWM_API.patch(`guest/${guestId}`, {
      companionType,
    })
  }

  async updateCompanionQty(guestId, companionQty){
    return CWM_API.patch(`guest/${guestId}`, {
      companionQty,
    })
  }

  async createCompanion({ guestId, firstName, lastName, email, phoneNumber }) {
    return CWM_API.post(`guest/${guestId}/companion`, {
      firstName,
      lastName,
      email,
      phoneNumber,
    })
  }

  async updateCompanion({ companionId, firstName, lastName, phoneNumber,email }) {
    return CWM_API.put(`companion/${companionId}`, {
      firstName,
      lastName,
      email,
      phoneNumber,
    })
  }

}

export default new GuestsService()
