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
      const response = await EventsService.create({ eventName, eventDate, eventDescription, status, visibility, customUrlSlug })

      console.log(response)
    }
  }
})
