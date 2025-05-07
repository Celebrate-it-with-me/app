import { defineStore } from 'pinia'
import EventsService from '../services/EventsService'
import { useUserStore } from './useUserStore'

export const useEventsStore = defineStore('eventsStore', {
  state: () => ({
    events: [],
    activeEvent: null,
    eventPlans: [],
    eventTypes: [],
  }),
  actions: {
    async loadEventsPlansAndType() {
      const response = await EventsService.loanEventsPlansAndType()

      if (response.status === 200) {
        const { data } = response

        this.eventPlans = data.data?.eventPlans ?? []
        this.eventTypes = data.data?.eventTypes ?? []
        return true
      }

      return false
    },

    async setActiveEvent(event) {
      const userStore = useUserStore()
      this.activeEvent = event
      userStore.activeEvent = event.id

      await this.updateActiveEvent(event)
    },

    async updateActiveEvent(event) {
      return await EventsService.updateActiveEvent(event)
    },

    async initUserEventsData(result) {
      this.events = result?.events
      this.activeEvent = result?.last_active_event
      const userStore = useUserStore()
      userStore.activeEvent = this.activeEvent?.id
      await this.updateActiveEvent(this.activeEvent)
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
                      eventType,
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
        eventType,
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
                        eventType,
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
        eventType,
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
