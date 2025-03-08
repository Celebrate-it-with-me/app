import { defineStore } from 'pinia'
import TemplateService from '../services/TemplateService'
import templateService from '../services/TemplateService'

export const useTemplateStore = defineStore('templateStore', {
  state: () => ({
    event: {},
    guest: {},
  }),
  actions: {
    async getEventData({ eventId, guestCode }) {
      return await TemplateService.getEventData({ eventId, guestCode })
    },

    initRsvpGuestData(guestData) {
      this.guest.firstName = guestData.firstName
      this.guest.lastName = guestData.lastName
      this.guest.email = guestData.email
      this.guest.phoneNumber = guestData.phoneNumber
      this.guest.mealPreference = guestData.mealPreference
      this.guest.confirmed = guestData.confirmed
    },

    async rsvpSaveUpdate() {
      return await templateService.saveRsvp({eventId: this.event.id, guest: this.guest})
    }
  },
  getters: {
    meals() {
      return this.event?.mealsAvailable ?? []
    },

    guestFullName() {
      return `${this.guest.firstName} ${this.guest.lastName}`
    },

    eventName() {
      return this.event?.eventName ?? ''
    },

    eventOrganizerEmail() {
      return this.event?.organizer?.email ?? ''
    }
  }
})
