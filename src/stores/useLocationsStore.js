import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/useUserStore'
import LocationsService from '@/services/LocationsService'


export const useLocationsStore = defineStore('locationsStore', {
  state: () => ({
    locations: [],
    totalItems: 0,
    pageSelected: 1,
    perPage: 5,
    searchValue: '',
    currentLocation: null,
  }),
  actions: {
    async loadLocations() {
      const userStore = useUserStore()
      return await LocationsService.loadLocations({
        eventId: userStore.activeEvent,
        perPage: this.perPage,
        pageSelected: this.pageSelected,
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
    }

  }
})
