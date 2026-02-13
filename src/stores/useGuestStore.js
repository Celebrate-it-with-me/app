import { defineStore } from 'pinia'
import GuestsService from '../services/GuestsService'
import { useUserStore } from './useUserStore'

export const useGuestsStore = defineStore('guestsStore', {
  state: () => ({
    guests: [],
    totalItems: 0,
    pageSelected: 1,
    perPage: 10,
    currentGuest: null,
    searchValue: '',
    totalAssistant: 0
  }),
  actions: {
    async countTotalAssistant() {
      const userStore = useUserStore()

      if (userStore.activeEvent) {
        const response = await GuestsService.countTotalAssistant({
          eventId: userStore.activeEvent
        })

        this.totalAssistant = response?.data?.total || 0
      } else {
        this.totalAssistant = 0
      }
    },

    async loadGuestData(guestId) {
      const userStore = useUserStore()
      return await GuestsService.getGuestData(guestId, userStore.activeEvent)
    },

    async deleteGuest(guestId) {
      const userStore = useUserStore()
      return await GuestsService.deleteGuest(guestId, userStore.activeEvent)
    },

    async createGuest(guest) {
      const userStore = useUserStore()
      return await GuestsService.createGuest(guest, userStore.activeEvent)
    },

    addGuest(guest) {
      this.guests.push(guest)
    },

    removeGuestById(guestId) {
      this.guests = this.guests.filter(guest => guest.id !== guestId)
    },

    updateGuestById(guestId, updatedGuest) {
      const index = this.guests.findIndex(guest => guest.id === guestId)
      if (index !== -1) {
        this.guests[index] = { ...this.guests[index], ...updatedGuest }
      }
    },

    setCurrentGuest(guestId) {
      this.currentGuest = this.guests.find(guest => guest.id === guestId) || null
    },

    clearCurrentGuest() {
      this.currentGuest = null
    },

    getGuestById(guestId) {
      return this.guests.find(guest => guest.id === guestId) || null
    },

    clearGuests() {
      this.guests = []
    },

    setGuests(guestsData) {
      this.guests = guestsData.data || []
      this.totalItems = guestsData?.meta?.total ?? 10
      this.pageSelected = guestsData?.meta?.current_page ?? 1
    },

    updateCurrentGuest() {
      if (this.currentGuest !== null) {
        const guestToUpdate = this.guests.find(guest => guest.id === this.currentGuest.id)
        if (guestToUpdate) {
          this.currentGuest = { ...guestToUpdate }
        }
      }
    },

    async loadGuests() {
      const userStore = useUserStore()

      console.log('=== FRONTEND PAGINATION DEBUG ===', {
        eventId: userStore.activeEvent,
        perPage: this.perPage,
        pageSelected: this.pageSelected,
        searchValue: this.searchValue
      })

      const response = await GuestsService.getMyEventGuests({
        eventId: userStore.activeEvent,
        perPage: this.perPage,
        pageSelected: this.pageSelected,
        searchValue: this.searchValue
      })

      if (response.status === 200) {
        console.log('=== RESPONSE DEBUG ===', {
          data_length: response.data?.data?.length ?? 0,
          meta: response.data?.meta,
          first_guest: response.data?.data?.[0]?.name ?? 'none',
          last_guest: response.data?.data?.[response.data?.data?.length - 1]?.name ?? 'none'
        })

        this.guests = response.data?.data ?? []
        this.totalItems = response.data?.meta?.total ?? 0
        this.pageSelected = response.data?.meta?.current_page ?? 1
        return true
      }

      return false
    },

    async updateCompanionType(companionType) {
      return await GuestsService.updateCompanionType(this.currentGuest.id, companionType)
    },

    async updateCompanionQty(companionQty) {
      return await GuestsService.updateCompanionQty(this.currentGuest.id, companionQty)
    },

    async createCompanion({ phoneNumber, firstName, lastName, email }) {
      return await GuestsService.createCompanion({
        guestId: this.currentGuest.id,
        phoneNumber,
        firstName,
        lastName,
        email
      })
    },

    async updateCompanion({ companionId, firstName, lastName, phoneNumber, email }) {
      return GuestsService.updateCompanion({ companionId, firstName, lastName, phoneNumber, email })
    }
  },
  getters: {
    hasGuests() {
      return this.guests.length > 0
    }
  }
})
