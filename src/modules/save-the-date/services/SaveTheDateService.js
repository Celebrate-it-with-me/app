import { CWM_API } from '@/services/axios'

class SaveTheDateService {
  /** `{ message, showCountdown, useAddToCalendar }`; the API answers defaults when nothing was saved. */
  async get(eventId) {
    return (await CWM_API.get(`event/${eventId}/save-the-date`)).data.data
  }

  async save(eventId, settings) {
    return (await CWM_API.put(`event/${eventId}/save-the-date`, settings)).data.data
  }
}

export default new SaveTheDateService()
