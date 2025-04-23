import { defineStore } from 'pinia'
import GuestsService from '../services/GuestsService'
import { useUserStore } from './useUserStore'

export const useGuestsStore = defineStore('guestsStore', {
  state: () => ({
    guests: [],
    totalItems: 0,
    pageSelected: 1,
    perPage: 5,
    currentGuest: null,
    searchValue: '',
  }),
  actions: {
    async createGuest(guest) {
      return await GuestsService.createGuest(guest)
    },

    addGuest(guest) {
      this.guests.push(guest)
    },

    removeGuestById(guestId) {
      this.guests = this.guests.filter((guest) => guest.id !== guestId)
    },

    updateGuestById(guestId, updatedGuest) {
      const index = this.guests.findIndex((guest) => guest.id === guestId)
      if (index !== -1) {
        this.guests[index] = { ...this.guests[index], ...updatedGuest }
      }
    },

    setCurrentGuest(guestId) {
      this.currentGuest = this.guests.find((guest) => guest.id === guestId) || null
    },

    clearCurrentGuest() {
      this.currentGuest = null
    },

    getGuestById(guestId) {
      return this.guests.find((guest) => guest.id === guestId) || null
    },

    clearGuests() {
      this.guests = []
    },

    setGuests(guests) {
      this.guests = guests
    },

    updateCurrentGuest() {
      if (this.currentGuest !== null) {
        const guestToUpdate = this.guests.find((guest) => guest.id === this.currentGuest.id)
        if (guestToUpdate) {
          this.currentGuest = { ...guestToUpdate }
        }
      }
    },

    async loadGuests(){
      const userStore = useUserStore()

      const response =  await GuestsService.getMyEventGuests({
        eventId: userStore.currentEventId,
        perPage: this.perPage,
        pageSelected: this.pageSelected,
        searchValue: this.searchValue
      })

      if (response.status === 200) {
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
        email,
      })
    },

    async updateCompanion({ companionId, firstName, lastName, phoneNumber,email }) {
      return GuestsService.updateCompanion({ companionId, firstName, lastName, phoneNumber,email })
    }
  }
})
