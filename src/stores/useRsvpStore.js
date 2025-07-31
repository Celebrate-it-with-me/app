import { defineStore } from 'pinia'
import RsvpService from '../services/RsvpService'
import { useUserStore } from '@/stores/useUserStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

export const useRsvpStore = defineStore('rsvpStore', {
  state: () => ({
    rsvpGuests: [],
    pageSelected: 1,
    perPage: 10,
    searchValue: '',
    statusSelected: '',
    totalPages: 1,
    title: '',
    description: '',
    customFields: {},
    confirmationDeadline: null,
    loaded: false
  }),
  actions: {
    async loadGuests() {
      const userStore = useUserStore()
      const notifications = useNotificationStore()

      const response = await this.loadRsvpGuestsList({
        eventId: userStore.activeEvent,
        currentPage: this.pageSelected,
        perPage: this.perPage,
        status: this.statusSelected,
        search: this.searchValue
      })

      if (response.status !== 200) {
        notifications.addNotification({
          type: 'error',
          message: 'Failed to load guests. Please try again later.'
        })
        return
      }

      this.rsvpGuests = response.data.data ?? []
      this.pageSelected = response.data.meta?.current_page || 1
      this.totalPages = response.data.meta?.last_page || 1
    },

    setRsvp(rsvpGuests) {
      this.rsvpGuests = rsvpGuests.data
      this.pageSelected = rsvpGuests.meta?.current_page ?? 1
      this.perPage = rsvpGuests.meta?.per_page ?? 10
      this.totalPages = rsvpGuests.meta?.last_page ?? 1
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
    downloadFile({ eventId, status, searchValue, exportType, perPage, currentPage }) {
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
