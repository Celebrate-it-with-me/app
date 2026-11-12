import { defineStore } from 'pinia'
import RsvpService from '@/modules/rsvp/services/RsvpService'
import { useUserStore } from '@/stores/useUserStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

/** The event's answer counters, for the dashboard. The guest list screen reads its own counters (modules/roster). */
export const useRsvpStore = defineStore('rsvpStore', {
  state: () => ({ stats: {} }),
  actions: {
    async fetchStats() {
      const userStore = useUserStore()

      if (!userStore.activeEvent) {
        this.stats = {}
        return
      }

      const response = await RsvpService.loadStats({ eventId: userStore.activeEvent })

      if (response.status !== 200) {
        useNotificationStore().addNotification({ type: 'error', message: 'Failed to load event stats. Please try again later.' })
        return
      }

      this.stats = response.data
    }
  }
})
