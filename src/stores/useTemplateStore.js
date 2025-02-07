import { defineStore } from 'pinia'
import TemplateService from '../services/TemplateService'

export const useTemplateStore = defineStore('templateStore', {
  state: () => ({
    event: {},
    guest: {}
  }),
  actions: {
    async getEventData({ eventId, guestCode }) {
      return await TemplateService.getEventData({ eventId, guestCode })
    }
  }
})
