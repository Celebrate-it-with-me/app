import { defineStore } from 'pinia'
import ActivityService from '@/services/ActivityService'
import { useUserStore } from '@/stores/useUserStore'

export const useActivityStore = defineStore('activityStore', {
  state: () => ({
    /**
     * List of activities
     * @type {Array}
     */
    activities: [],

    /**
     * Timestamp of last data fetch
     * @type {Date|null}
     */
    lastFetched: null,

    /**
     * Loading state flag
     * @type {boolean}
     */
    isLoading: false
  }),
  actions: {
    /**
     * Load dashboard activities from the API
     * @returns {Promise<Object>} API response with status and data or error message
     */
    async loadDashboardActivities() {
      const userStore = useUserStore()

      // Don't proceed if no active event
      if (!userStore.activeEvent) {
        return { status: 400, message: 'No active event' }
      }

      this.isLoading = true

      try {
        const response = await ActivityService.loadDashboardActivities({
          eventId: userStore.activeEvent
        })

        if (response.status === 200) {
          this.activities = response.data?.data ?? []
          this.lastFetched = new Date()
        }

        return response
      } catch (error) {
        // Log error with more context for debugging
        console.error('Error loading dashboard activities:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        })

        return {
          status: error.response?.status || 500,
          message: error.message || 'An unexpected error occurred'
        }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Clear activities data
     * Resets the activities array and lastFetched timestamp
     */
    clearActivities() {
      this.activities = []
      this.lastFetched = null
    }
  },
  getters: {
    /**
     * Check if activities data is stale (older than 5 minutes)
     * Used to determine if data should be refreshed
     * @param {Object} state - Store state
     * @returns {boolean} True if data is stale or not fetched yet
     */
    isDataStale: state => {
      if (!state.lastFetched) return true

      const staleThreshold = 5 * 60 * 1000 // 5 minutes in milliseconds
      const now = new Date()
      return now - state.lastFetched > staleThreshold
    }
  }
})
