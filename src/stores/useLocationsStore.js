import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/useUserStore'
import LocationsService from '@/services/LocationsService'

export const useLocationsStore = defineStore('locationsStore', {
  state: () => ({
    location: {},
    searchValue: '',
    currentLocation: null
  }),
  actions: {
    async fetchLocation() {
      try {
        const response = await this.loadLocation()

        if (response.status === 200) {
          this.location = response?.data?.data ?? []
        } else {
          console.error('Error loading location:', response)
        }
      } catch (error) {
        console.error('Error loading location:', error)
      }
    },

    setLocation(location) {
      this.location = location
    },
    async uploadLocationImages(locationId, formData) {
      const userStore = useUserStore()
      return await LocationsService.uploadLocationImages(
        locationId,
        formData,
        userStore.activeEvent
      )
    },

    async getPlaceImages(placeId) {
      const userStore = useUserStore()

      return await LocationsService.getPlaceImages({
        eventId: userStore.activeEvent,
        placeId
      })
    },

    async loadLocation() {
      const userStore = useUserStore()
      return await LocationsService.loadLocation({
        eventId: userStore.activeEvent,
        searchValue: this.searchValue
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
    hasLocation() {
      if (!this.location) {
        return false
      }

      return Object.keys(this.location).length > 0
    }
  }
})
