import { CWM_API } from './axios'

class GuestsService {
  async getMyEventGuests({ eventId, perPage, pageSelected, searchValue }) {
    return CWM_API.get(`event/${eventId}/guests`, {
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

  async createGuest(guestPayload, eventId) {
    return CWM_API.post(`event/${eventId}/guests`, guestPayload)
  }

  async deleteGuest(guestId, eventId) {
    return CWM_API.delete(`event/${eventId}/guests/${guestId}`, {})
  }

  async getGuestData(guestId, eventId) {
    return CWM_API.get(`event/${eventId}/guests/${guestId}`, {})
  }

}

export default new GuestsService()
