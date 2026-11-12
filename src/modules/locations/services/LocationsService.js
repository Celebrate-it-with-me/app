import { CWM_API } from '@/services/axios'

const base = eventId => `/event/${eventId}/location`

class LocationsService {
  async list(eventId) {
    return (await CWM_API.get(base(eventId))).data.data
  }

  async create(eventId, place) {
    return (await CWM_API.post(base(eventId), place)).data.data
  }

  async update(eventId, id, place) {
    return (await CWM_API.put(`${base(eventId)}/${id}`, place)).data.data
  }

  async remove(eventId, id) {
    await CWM_API.delete(`${base(eventId)}/${id}`)
  }

  /** Own pictures (files) and/or Google photos (urls the API already holds). */
  async addImages(eventId, id, { files = [], googlePhotos = [] }) {
    const body = new FormData()
    files.forEach(file => body.append('images[]', file))
    googlePhotos.forEach(url => body.append('googlePhotos[]', url))
    return (await CWM_API.post(`${base(eventId)}/${id}/images`, body, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data
  }

  async removeImage(eventId, id, imageId) {
    await CWM_API.delete(`${base(eventId)}/${id}/images/${imageId}`)
  }

  /** The photos Google has for a place, fetched by the API. */
  async googlePhotos(eventId, placeId) {
    return (await CWM_API.get(`${base(eventId)}/${encodeURIComponent(placeId)}/images`)).data
  }
}

export default new LocationsService()
