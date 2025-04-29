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
}

export default new LocationsService()
