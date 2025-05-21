import { defineStore } from 'pinia'
import ActivityService from '@/services/ActivityService'
import { useUserStore } from '@/stores/useUserStore'

export const useActivityStore = defineStore('activityStore', {
  state: () => ({
    activities: []
  }),
  actions: {
    async loadDashboardActivities() {
      const userStore = useUserStore()

      return await ActivityService.loadDashboardActivities({
        eventId: userStore.activeEvent
      })
    }
  }
})
