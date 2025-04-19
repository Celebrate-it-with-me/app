import { defineStore } from 'pinia'
import EventsService from '../services/EventsService'
import { useUserStore } from './useUserStore'

export const useEventsStore = defineStore('eventsStore', {
  state: () => ({
    events: [],
    activeEvent: null,
  }),
  actions: {
    async setActiveEvent(event) {
      this.activeEvent = event

      await this.updateActiveEvent(event)
    },

    async updateActiveEvent(event) {
      return await EventsService.updateActiveEvent(event)
    },

    initUserEventsData(result) {
      this.events = result.events
      this.activeEvent = result.activeEvent
    },

    setEvents(events) {
      this.events = events
    },
    selectEvent(eventId) {
      const userStore = useUserStore()
      this.activeEvent = this.events.find((event) => event.id === eventId)
      userStore.activeEventId = eventId
    },
    addEvent(event) {
      this.events.push(event)
    },

    async removeactiveEvent() {
      return await EventsService.removeactiveEvent(this.activeEvent.id)
    },

    async editEvent({
                      eventName,
                      startDate,
                      endDate,
                      eventDescription,
                      status,
                      visibility,
                      customUrlSlug,
                      saveTheDate,
                      rsvp,
                      sweetMemories,
                      music,
                      backgroundMusic,
                      eventComments,
                      seatsAccommodation,
                      preview,
                      eventBudget,
                      analytics
                    }){
      return await EventsService.edit({
        eventId: this.activeEvent.id,
        eventName,
        startDate,
        endDate,
        eventDescription,
        status,
        visibility,
        customUrlSlug,
        saveTheDate,
        rsvp,
        sweetMemories,
        music,
        backgroundMusic,
        eventComments,
        seatsAccommodation,
        preview,
        eventBudget,
        analytics
      })
    },

    async createEvent({
                        eventName,
                        startDate,
                        endDate,
                        eventDescription,
                        status,
                        visibility,
                        customUrlSlug,
                        saveTheDate,
                        rsvp,
                        sweetMemories,
                        music,
                        backgroundMusic,
                        eventComments,
                        seatsAccommodation,
                        preview,
                        eventBudget,
                        analytics
    }) {
      return await EventsService.create({
        eventName,
        startDate,
        endDate,
        eventDescription,
        status,
        visibility,
        customUrlSlug,
        saveTheDate,
        rsvp,
        sweetMemories,
        music,
        backgroundMusic,
        eventComments,
        seatsAccommodation,
        preview,
        eventBudget,
        analytics
      })
    },

    async filterEvents(query) {
      const response = await EventsService.filterEvents(query)

      if (response.status === 200) {
        const { data } = response

        this.setEvents(data.data ?? [])
      }
    },

    async initEvents(eventId = null) {
      const response = await EventsService.getMyEvents()

      if (response.status === 200) {
        const { data } = response

       this.setEvents(data.data ?? [])
        if (eventId) {
          this.selectEvent(eventId)
        }
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
