import { defineStore } from 'pinia'

export const useGuestsStore = defineStore('guests', {
  state: () => ({
    guests: [],
    currentGuest: null
  }),

  actions: {
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
    }
  }
})
