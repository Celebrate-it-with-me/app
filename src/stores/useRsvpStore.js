import { defineStore } from 'pinia'
import RsvpService from '../services/RsvpService'
import { useUserStore } from '@/stores/useUserStore'

export const useRsvpStore = defineStore('rsvpStore', {
  state: () => ({
    rsvpGuests: [],
    title: '',
    description: '',
    customFields: {  },
    confirmationDeadline: null,
    loaded: false
  }),
  actions: {
    setRsvp(rsvpGuests) {
      this.rsvpGuests = rsvpGuests
    },

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
    },
    revertConfirmation({ guestId }) {
      const userStore = useUserStore()
      return RsvpService.revertConfirmation({
        guestId,
        eventId: userStore.activeEvent
      })
    },

    async loadDashboardRsvpSummary({ eventId }) {
      return await RsvpService.loadDashboardRsvpSummary({ eventId })
    }

  },
  getters: {
    isLoaded() {
      return this.loaded
    }
  }
})
