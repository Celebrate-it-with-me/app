import { CWM_API } from './axios'

class LocationsService {
  async loadLocations ({
                         eventId,
                         perPage,
                         pageSelected,
                         searchValue,
                       }) {
    return CWM_API.get(`event/${eventId}/locations`, {
      params: {
        perPage,
        pageSelected,
        searchValue
      }
    })
  }

  async addLocation({ eventId, formData }) {
    return CWM_API.post(`event/${eventId}/locations`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async deleteLocation({ eventId, locationId }) {
    return CWM_API.delete(`event/${eventId}/locations/${locationId}`)
  }

  async getLocation({ eventId, locationId }) {
    return CWM_API.get(`event/${eventId}/locations/${locationId}`)
  }

  async teLocation({ eventId, locationId, formData }) {
    return CWM_API.post(`event/${eventId}/locations/${locationId}?_method=PUT`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default new LocationsService()
