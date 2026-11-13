import { CWM_API } from '@/services/axios'

const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } }

class SweetMemoriesService {
  async loadImages({ eventId }) {
    return await CWM_API.get(`event/${eventId}/sweet-memories-images`)
  }

  /** `formData` comes from buildMemoryFormData (utils/memories.js). */
  async createImage({ eventId, formData }) {
    return await CWM_API.post(`event/${eventId}/sweet-memories-images`, formData, MULTIPART)
  }

  async updateImage({ eventId, id, formData }) {
    formData.append('_method', 'PUT')
    return await CWM_API.post(`event/${eventId}/sweet-memories-images/${id}`, formData, MULTIPART)
  }

  async deleteImage({ eventId, id }) {
    return await CWM_API.delete(`event/${eventId}/sweet-memories-images/${id}`)
  }
}

export default new SweetMemoriesService()
