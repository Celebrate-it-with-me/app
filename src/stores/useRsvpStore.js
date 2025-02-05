import { defineStore } from 'pinia'
import RsvpService from '../services/RsvpService'

export const useRsvpStore = defineStore('rsvpStore', {
  state: () => ({
    title: '',
    description: '',
    customFields: {  },
    confirmationDeadline: null,
    loaded: false
  }),
  actions: {
    loadRsvp({ eventId }) {
      return RsvpService.loadRsvp({ eventId })
    }
  },
  getters: {
    isLoaded() {
      return this.loaded
    }
  }
})
