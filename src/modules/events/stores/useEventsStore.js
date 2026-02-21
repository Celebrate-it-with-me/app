import { defineStore } from 'pinia'
import EventsService from '../services/EventsService'
import { useUserStore } from '@/stores/useUserStore'

export const useEventsStore = defineStore('eventsStore', {
  state: () => ({
    events: [],
    activeEvent: null,
    eventPermissions: null,
    eventPlans: [],
    eventTypes: []
  }),
  actions: {
    /**
     * Load event permissions for a specific event
     * @param {string|number} eventId - The ID of the event
     * @returns {Promise<Object>} API response or error object
     */
    async loadEventPermissions(eventId) {
      try {
        const response = await EventsService.getEventPermissions(eventId)

        if (response.status === 200) {
          const { data } = response
          this.eventPermissions = data.data?.eventPermissions ?? []
        }
        return response
      } catch (error) {
        console.error('Error loading event permissions:', error)
        return {
          status: error.response?.status || 500,
          message: error.message || 'An unexpected error occurred'
        }
      }
    },

    /**
     * Load event plans and types
     * @returns {Promise<boolean>} True if successful, false otherwise
     */
    async loadEventsPlansAndType() {
      try {
        const response = await EventsService.loadEventsPlansAndType()

        if (response.status === 200) {
          const { data } = response

          this.eventPlans = data.data?.eventPlans ?? []
          this.eventTypes = data.data?.eventTypes ?? []
          return true
        }

        return false
      } catch (error) {
        console.error('Error loading event plans and types:', error)
        return false
      }
    },

    /**
     * Set the active event and update it in the user store
     * @param {Object} event - The event to set as active
     * @returns {Promise<Object>} API response
     */
    async setActiveEvent(event) {
      if (!event) return
      const userStore = useUserStore()
      this.activeEvent = event
      userStore.activeEvent = event.id

      await this.updateActiveEvent(event)
    },

    /**
     * Update the active event in the backend
     * @param {Object} event - The event to update
     * @returns {Promise<Object>} API response
     */
    async updateActiveEvent(event) {
      return await EventsService.updateActiveEvent(event)
    },

    /**
     * Initialize user events data from API result
     * @param {Object} result - API result containing events data
     * @param {Array} result.events - List of user events
     * @param {Object} result.last_active_event - Last active event
     * @returns {Promise<void>}
     */
    async initUserEventsData(result) {
      this.events = result?.events ?? []
      this.activeEvent = result?.last_active_event || null
      const userStore = useUserStore()
      userStore.activeEvent = this.activeEvent?.id || null
      if (this.activeEvent) {
        await this.updateActiveEvent(this.activeEvent)
      }
    },

    /**
     * Set events in the store
     * @param {Array} events - List of events
     */
    setEvents(events) {
      this.events = events
    },

    /**
     * Initialize the active event
     * @param {Object} event - The event to set as active
     */
    initActiveEvent(event) {
      this.activeEvent = event
    },

    /**
     * Initialize event permissions
     * @param {Array} permissions - List of event permissions
     */
    initEventPermissions(permissions) {
      this.eventPermissions = permissions
    },

    /**
     * Sets the event types for the current instance.
     *
     * @param {Array<string>} types - An array of event type strings to be assigned.
     * @return {void} Does not return a value.
     */
    setEventTypes(types) {
      this.eventTypes = types
    },

    /**
     * Sets the event plans for the current instance.
     * @param plans
     */
    setEventPlans(plans) {
      this.eventPlans = plans
    },

    /**
     * Select an event by ID and update active event
     * @param {string|number} eventId - The ID of the event to select
     */
    selectEvent(eventId) {
      if (!eventId) return
      const userStore = useUserStore()
      this.activeEvent = this.events.find(event => String(event.id) === String(eventId)) || null
      userStore.activeEvent = eventId
    },

    /**
     * Add a new event to the events list
     * @param {Object} event - The event to add
     */
    addEvent(event) {
      this.events.push(event)
    },

    /**
     * Remove the active event
     * @returns {Promise<Object>} API response
     */
    async removeActiveEvent() {
      try {
        return await EventsService.removeCurrentEvent(this.activeEvent.id)
      } catch (error) {
        console.error('Error removing active event:', error)
        return {
          status: error.response?.status || 500,
          message: error.message || 'An unexpected error occurred'
        }
      }
    },

    /**
     * Edit the active event
     * @param {Object} eventData - The event data to update
     * @returns {Promise<Object>} API response
     */
    async editEvent(eventData) {
      try {
        return await EventsService.edit({
          eventId: this.activeEvent.id,
          ...eventData
        })
      } catch (error) {
        console.error('Error editing event:', error)
        return {
          status: error.response?.status || 500,
          message: error.message || 'An unexpected error occurred'
        }
      }
    },

    /**
     * Create a new event
     * @param {Object} eventData - The event data to create
     * @returns {Promise<Object>} API response
     */
    async createEvent(eventData) {
      try {
        return await EventsService.create(eventData)
      } catch (error) {
        console.error('Error creating event:', error)
        return {
          status: error.response?.status || 500,
          message: error.message || 'An unexpected error occurred'
        }
      }
    },

    /**
     * Filter events based on query
     * @param {Object} query - Query parameters for filtering
     * @returns {Promise<Object>} API response
     */
    async filterEvents(query) {
      try {
        const response = await EventsService.filterEvents(query)

        if (response.status === 200) {
          const { data } = response
          this.setEvents(data.data ?? [])
        }

        return response
      } catch (error) {
        console.error('Error filtering events:', error)
        return {
          status: error.response?.status || 500,
          message: error.message || 'An unexpected error occurred'
        }
      }
    },

    /**
     * Initialize events and optionally select an event
     * @param {string|number|null} eventId - Optional event ID to select
     * @returns {Promise<Object>} API response
     */
    async initEvents(eventId = null) {
      try {
        const response = await EventsService.getMyEvents()

        if (response.status === 200) {
          const { data } = response
          this.setEvents(data.data?.events ?? data.data ?? [])

          // Initialize activeEvent from API response or by eventId
          if (data.data?.last_active_event) {
            this.activeEvent = data.data.last_active_event
            const userStore = useUserStore()
            userStore.activeEvent = this.activeEvent?.id || null
          } else if (eventId) {
            this.selectEvent(eventId)
          }
        }

        return response
      } catch (error) {
        console.error('Error initializing events:', error)
        return {
          status: error.response?.status || 500,
          message: error.message || 'An unexpected error occurred'
        }
      }
    },

    /**
     * Load suggestions for an event
     * @param {Object} params - Parameters
     * @param {string|number} params.eventId - Event ID
     * @returns {Promise<Object>} API response
     */
    async loadSuggestions({ eventId }) {
      try {
        return await EventsService.loadSuggestions({ eventId })
      } catch (error) {
        console.error('Error loading suggestions:', error)
        return {
          status: error.response?.status || 500,
          message: error.message || 'An unexpected error occurred'
        }
      }
    }
  },
  getters: {
    eventsCount: state => state.events.length,

    /**
     * Check if user has any events
     * @returns {boolean} True if user has events
     */
    hasEvents() {
      return this.events.length > 0
    },

    /**
     * Get active events (draft or published)
     * @returns {Array} List of active events
     */
    activeEvents() {
      return this.events.filter(event => ['draft', 'published'].includes(event.status))
    },

    /**
     * Get inactive events (archived or canceled)
     * @returns {Array} List of inactive events
     */
    inactiveEvents() {
      return this.events.filter(event => ['archived', 'canceled'].includes(event.status))
    },

    activeEventHasMenu() {
      return this.activeEvent && this.activeEvent.menu && this.activeEvent.menu.length > 0
    },

    /**
     * Check if user has a specific permission
     * @param {Object} state - Store state
     * @returns {Function} Function that checks for a specific permission
     */
    hasPermission: state => permission => {
      if (state.eventPermissions && state.eventPermissions.length > 0) {
        return state.eventPermissions.some(perm => perm.name === permission)
      }
      return false
    },

    /**
     * Check if user has any of the specified permissions
     * @param {Object} state - Store state
     * @returns {Function} Function that checks for any of the specified permissions
     */
    hasAnyPermission: state => permissions => {
      if (state.eventPermissions && state.eventPermissions.length > 0) {
        return state.eventPermissions.some(perm => permissions.includes(perm.name))
      }
      return false
    },

    activeEventName: state => {
      return state.activeEvent?.eventName || ''
    }
  }
})
