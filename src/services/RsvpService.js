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

  async loadRsvpGuestsList({ eventId, currentPage, perPage, status, search }) {
    return CWM_API.get(`event/${eventId}/rsvp/guests`, {
      params: {
        page: currentPage,
        perPage,
        status,
        search
      }
    })
  }

  async loadRsvpTotals({ eventId }) {
    return CWM_API.get(`event/${eventId}/rsvp/guests/totals`)
  }

  async downloadFile({ eventId, status, searchValue, exportType, perPage, currentPage }) {
    return CWM_API.get(`event/${eventId}/rsvp/guests/download`, {
      params: {
        status,
        searchValue,
        exportType,
        perPage,
        currentPage
      },
      responseType: 'blob'
    })
  }

  async revertConfirmation({ guestId, eventId }) {
    return CWM_API.post(`event/${eventId}/rsvp/guests/${guestId}/revert-confirmation`)
  }

  async loadDashboardRsvpSummary({ eventId }) {
    return CWM_API.get(`event/${eventId}/rsvp/summary`)
  }
}

export default new RsvpService()
