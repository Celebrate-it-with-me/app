import { defineStore } from 'pinia'
import RsvpService from '@/modules/rsvp/services/RsvpService'
import { useUserStore } from '@/stores/useUserStore'
import { useToast } from '@/ui'
import i18n from '@/locales/i18n'

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

      const eventId = userStore.activeEvent
      const response = await RsvpService.loadStats({ eventId })
      // A late answer for an event that is no longer the active one is dropped: its names must never show under another.
      if (useUserStore().activeEvent !== eventId) return

      if (response.status !== 200) {
        useToast().error(i18n.global.t('rsvpStatsError'))
        return
      }

      this.stats = response.data
    }
  }
})
