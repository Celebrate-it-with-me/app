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
    },
    loadRsvpGuestsList({ eventId, currentPage, perPage, status, search }) {
      return RsvpService.loadRsvpGuestsList({
        eventId,
        currentPage,
        perPage,
        status,
        search
      })
    },
    loadRsvpTotals({ eventId }) {
      return RsvpService.loadRsvpTotals({ eventId })
    },
    downloadFile({
      eventId,
      status,
      searchValue,
      exportType,
      perPage,
      currentPage
                 }) {
      return RsvpService.downloadFile({
        eventId,
        status,
        searchValue,
        exportType,
        perPage,
        currentPage
      })
    }

  },
  getters: {
    isLoaded() {
      return this.loaded
    }
  }
})
