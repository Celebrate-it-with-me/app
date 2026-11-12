import { defineStore } from 'pinia'
import LocationsService from '../services/LocationsService'

/** The places of the active event. */
export const useLocationsStore = defineStore('locationsStore', {
  state: () => ({ locations: [], loading: false }),

  actions: {
    async fetch(eventId) {
      this.loading = true
      try {
        this.locations = await LocationsService.list(eventId)
      } finally {
        this.loading = false
      }
    },
    async remove(eventId, id) {
      await LocationsService.remove(eventId, id)
      this.locations = this.locations.filter(location => location.id !== id)
    }
  }
})
