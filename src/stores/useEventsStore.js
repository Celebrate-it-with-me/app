import { defineStore } from 'pinia'
import EventsService from '../services/EventsService'
import { useUserStore } from './useUserStore'

export const useEventsStore = defineStore('eventsStore', {
  state: () => ({
    events: [],
    currentEvent: null,
  }),
  actions: {
    setEvents(events) {
      this.events = events
    },
    selectEvent(eventId) {
      const userStore = useUserStore()
      this.currentEvent = this.events.find((event) => event.id === eventId)
      userStore.currentEventId = eventId
    },
    addEvent(event) {
      this.events.push(event)
    },
    async createEvent({ eventName, eventDate, eventDescription, status, visibility, customUrlSlug }) {
      return await EventsService.create({ eventName, eventDate, eventDescription, status, visibility, customUrlSlug })
    },

    async filterEvents(query) {
      const response = await EventsService.filterEvents(query)

      if (response.status === 200) {
        const { data } = response

        this.setEvents(data.data ?? [])
      }
    },

    async initEvents(eventId) {
      const response = await EventsService.getMyEvents()

      if (response.status === 200) {
        const { data } = response

       this.setEvents(data.data ?? [])
       this.selectEvent(eventId)
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
