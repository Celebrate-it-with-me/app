import { defineStore } from 'pinia'
import { ref } from 'vue'
import HydrationService from '@/services/HydrationService'
import { useEventsStore } from '@/stores/useEventsStore'
import { useMenusStore } from '@/stores/useMenusStore'
import { useRsvpStore } from '@/stores/useRsvpStore'
import { useSaveTheDateStore } from '@/stores/useSaveTheDateStore'
import { useGuestsStore } from '@/stores/useGuestStore'
import { useUserStore } from '@/stores/useUserStore'

export const useHydrationStore = defineStore('hydration', () => {
  const isHydrated = ref(false)
  const isLoading = ref(false)

  async function hydrateAll() {
    try {
      isLoading.value = true
      const userStore = useUserStore()
      const userId = userStore.userId

      const { data, status } = await HydrationService.hydrate(userId)

      if (status === 200) {

        useEventsStore().setEvents(data.events)
        useEventsStore().initActiveEvent(data.activeEvent)
        useMenusStore().setMenus(data.menus)
        useGuestsStore().setGuests(data.guests)
        useRsvpStore().setRsvp(data.rsvp)
        useSaveTheDateStore().setSaveTheDate(data.saveTheDate)

      } else {
        // Todo: Handle Error, redirect to error page with support message
      }
    } catch (error) {
      isLoading.value = false
    } finally {
      isLoading.value = false
      isHydrated.value = true
    }
  }

  return {
    isHydrated,
    isLoading,
    hydrateAll,
  }
})
