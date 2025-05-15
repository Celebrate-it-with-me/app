import { defineStore } from 'pinia'
import TemplateService from '../services/TemplateService'
import templateService from '../services/TemplateService'

export const useTemplateStore = defineStore('templateStore', {
  state: () => ({
    event: {},
    guest: {},
  }),
  actions: {
    updateCompanionMenu(payload) {
      const companionId = payload.guestId

      const companion = this.guest.companions.find((companion) => companion.id === companionId)

      if (!companion) {
        console.log('companion not found')
        return
      }

      companion.menusSelections = payload.selections
    },

    updateGuestMenu(payload) {
      if (payload.guestId !== this.guest.id) {
        console.log('guest id not match')
        return
      }
      this.guest.menusSelections = payload.selections
    },

    async getEventData({ eventId, guestCode }) {
      return await TemplateService.getEventData({ eventId, guestCode })
    },

    initRsvpGuestData(guestData) {
      this.guest.name = guestData.name
      this.guest.email = guestData.email
      this.guest.phone = guestData.phone
      this.guest.rsvpStatus = guestData.rsvpStatus
      this.guest.mealPreference = guestData.mealPreference
    },

    async rsvpSaveUpdate() {
      return await templateService.saveRsvp({
        eventId: this.event.id,
        guest: this.guest
      })
    },

    async refreshGuestData({ eventId, guestCode }) {
      return await templateService.refreshGuestData({
        eventId,
        guestCode,
      })
    }

  },
  getters: {
    meals() {
      return this.event?.mealsAvailable ?? []
    },

    guestFullName() {
      return `${this.guest.name}`
    },

    eventName() {
      return this.event?.eventName ?? ''
    },

    eventOrganizerEmail() {
      return this.event?.organizer?.email ?? ''
    }
  }
})
