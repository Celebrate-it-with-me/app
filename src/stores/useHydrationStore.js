import { defineStore } from 'pinia'
import HydrationService from '@/services/HydrationService'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'
import { useSaveTheDateStore } from '@/stores/useSaveTheDateStore'
import { useUserStore } from '@/stores/useUserStore'
import { useEventCommentsStore } from '@/modules/comments/stores/useEventCommentsStore'
import { useAuthStore } from '@/stores/useAuthStore'

export const useHydrationStore = defineStore('hydration', {
  state: () => ({
    isHydrated: false,
    isLoading: false
  }),
  persist: false,
  actions: {
    async hydrateAll() {
      try {
        this.isLoading = true
        const authStore = useAuthStore()
        await authStore.ensureReady()

        const userStore = useUserStore()
        const userId = userStore.userId

        const { data, status } = await HydrationService.hydrate(userId)
        if (status === 200) {
          useEventsStore().setEvents(data.events)
          useEventsStore().initActiveEvent(data.activeEvent)
          useEventsStore().initEventPermissions(data.userPermissions)

          useMenusStore().setMenus(data.menus)
          useMenusStore().setMenuGuests(data.menuGuests)

          useEventCommentsStore().setEventComments(data.comments)

          useSaveTheDateStore().setSaveTheDate(data.saveTheDate)

          useEventsStore().setEventTypes(data.eventTypes)
          useEventsStore().setEventPlans(data.eventPlans)
        } else {
          // Todo: Handle Error, redirect to error page with support message
        }
      } catch (error) {
        this.isLoading = false
      } finally {
        this.isLoading = false
        this.isHydrated = true
      }
    },

    reset() {
      this.isHydrated = false
      this.isLoading = false
    }
  }
})
