import { CWM_API } from '@/services/axios'

class SaveTheDateService {
  async getConfig(eventId) {
    return await CWM_API.get(`event/${eventId}/save-the-date`)
  }

  async updateConfig(eventId, data) {
    return await CWM_API.put(`event/${eventId}/save-the-date`, data)
  }

  async deleteConfig(eventId) {
    return await CWM_API.delete(`event/${eventId}/save-the-date`)
  }
}

export default new SaveTheDateService()
