import { defineStore } from 'pinia'
import EventsService from '../services/EventsService'

export const useEventsStore = defineStore('eventsStore', {
  state: () => ({
    events: [],
    currentEvent: null
  }),
  actions: {
    setEvents(events) {
      this.events = events
    },
    selectEvent(eventId) {
      this.currentEvent = this.events.find((event) => event.id === eventId)
    },
    addEvent(event) {
      this.events.push(event)
    },
    async createEvent({ eventName, eventDate, eventDescription, status, visibility, customUrlSlug }) {
      return await EventsService.create({ eventName, eventDate, eventDescription, status, visibility, customUrlSlug })
    },

    async getMyEvents() {
      const response = await EventsService.getMyEvents()

      if (response) {
        const { data } = response

       this.setEvents(data.data ?? [])
      }
    }
  },
  getters: {
    activeEvents() {
      return this.events.filter((event) => ['draft', 'published'].includes(event.status))
    },
    inactiveEvents() {
      return this.events.filter((event) => ['archived', 'canceled'].includes(event.status))
    }
  }
})
