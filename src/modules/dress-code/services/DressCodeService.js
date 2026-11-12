import { CWM_API } from '@/services/axios'

class DressCodeService {
  async get(eventId) {
    const { data } = await CWM_API.get(`/event/${eventId}/dress-code`)
    return data.data
  }

  /** Creates or replaces the event's dress code. Multipart because of the uploaded pictures. */
  async save(eventId, formData) {
    const { data } = await CWM_API.post(`/event/${eventId}/dress-code`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data.data
  }

  async remove(eventId) {
    await CWM_API.delete(`/event/${eventId}/dress-code`)
  }
}

export default new DressCodeService()
