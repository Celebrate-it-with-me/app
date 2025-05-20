import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/useUserStore'
import LocationsService from '@/services/LocationsService'


export const useLocationsStore = defineStore('locationsStore', {
  state: () => ({
    locations: [],
    searchValue: '',
    currentLocation: null,
  }),
  actions: {
    async loadLocationsList() {
      try {
        const response = await this.loadLocations()

        if (response.status === 200) {
          this.locations = response?.data?.data ?? []
        } else {
          console.error('Error loading locations:', response)
        }

      } catch (error) {
        console.error('Error loading locations:', error)
      }
    },

    setLocations(locations) {
      this.locations = locations
    },
    async uploadLocationImages(locationId, formData){
      const userStore = useUserStore()
      return await LocationsService.uploadLocationImages(locationId, formData, userStore.activeEvent)
    },

    async getPlaceImages(placeId) {
      const userStore = useUserStore()

      return await LocationsService.getPlaceImages({
        eventId: userStore.activeEvent,
        placeId
      })
    },

    async loadLocations() {
      const userStore = useUserStore()
      return await LocationsService.loadLocations({
        eventId: userStore.activeEvent,
        searchValue: this.searchValue,
      })
    },

    async addLocation(formData) {
      const userStore = useUserStore()
      return await LocationsService.addLocation({
        eventId: userStore.activeEvent,
        formData
      })
    },

    async deleteLocation(locationId) {
      const userStore = useUserStore()
      return await LocationsService.deleteLocation({
        eventId: userStore.activeEvent,
        locationId
      })
    },

    async getLocation(locationId) {
      const userStore = useUserStore()
      return await LocationsService.getLocation({
        eventId: userStore.activeEvent,
        locationId
      })
    },

    async updateLocation(locationId, formData) {
      const userStore = useUserStore()
      return await LocationsService.updateLocation({
        eventId: userStore.activeEvent,
        locationId,
        formData
      })
    }

  },
  getters: {
    hasLocations() {
      return this.locations.length > 0
    }
  }
})
