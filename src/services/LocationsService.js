import { CWM_API } from './axios'

class LocationsService {
  async loadLocation({ eventId, perPage, pageSelected, searchValue }) {
    return CWM_API.get(`event/${eventId}/location`, {
      params: {
        perPage,
        pageSelected,
        searchValue
      }
    })
  }

  async addLocation({ eventId, formData }) {
    return CWM_API.post(`event/${eventId}/location`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async deleteLocation({ eventId, locationId }) {
    return CWM_API.delete(`event/${eventId}/location/${locationId}`)
  }

  async getLocation({ eventId, locationId }) {
    return CWM_API.get(`event/${eventId}/location/${locationId}`)
  }

  async teLocation({ eventId, locationId, formData }) {
    return CWM_API.post(`event/${eventId}/location/${locationId}?_method=PUT`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async getPlaceImages({ eventId, placeId }) {
    return CWM_API.get(`event/${eventId}/location/${placeId}/images`)
  }

  uploadLocationImages(locationId, formData, eventId) {
    return CWM_API.post(`event/${eventId}/location/${locationId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default new LocationsService()
