import { CWM_API } from '@/services/axios'

class DressCodeService {
  async getDressCode({ eventId }) {
    return CWM_API.get(`/event/${eventId}/dress-code`)
  }

  async createDressCode({ eventId, formData }) {
    return CWM_API.post(`/event/${eventId}/dress-code`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async updateDressCode({ eventId, dressCodeId, formData }) {
    return CWM_API.post(`/event/${eventId}/dress-code/${dressCodeId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async deleteDressCode({ eventId, dressCodeId }) {
    return CWM_API.delete(`/event/${eventId}/dress-code/${dressCodeId}`)
  }

  async generateAIImages({ eventId, dressType }) {
    return CWM_API.post(`/event/${eventId}/dress-code/generate-images`, { dressType })
  }
}

export default new DressCodeService()
