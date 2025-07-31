import { defineStore } from 'pinia'
import { ref } from 'vue'
import HydrationService from '@/services/HydrationService'
import { useEventsStore } from '@/stores/useEventsStore'
import { useMenusStore } from '@/stores/useMenusStore'
import { useRsvpStore } from '@/stores/useRsvpStore'
import { useSaveTheDateStore } from '@/stores/useSaveTheDateStore'
import { useGuestsStore } from '@/stores/useGuestStore'
import { useUserStore } from '@/stores/useUserStore'
import { useLocationsStore } from '@/stores/useLocationsStore'

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
        useEventsStore().initEventPermissions(data.userPermissions)
        useMenusStore().setMenus(data.menus)
        useMenusStore().setMenuGuests(data.menuGuests)
        useGuestsStore().setGuests(data.guests)
        useRsvpStore().setRsvp(data.rsvp)
        useSaveTheDateStore().setSaveTheDate(data.saveTheDate)
        useLocationsStore().setLocations(data.locations)
        useEventsStore().setEventTypes(data.eventTypes)
        useEventsStore().setEventPlans(data.eventPlans)
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

  const reset = () => {
    isHydrated.value = false
    isLoading.value = false
  }

  return {
    isHydrated,
    isLoading,
    hydrateAll,
    reset
  }
})
