import { ref, computed } from 'vue'
import { useRsvpStore } from '@/modules/rsvp/stores/useRsvpStore'
import { useUserStore } from '@/stores/useUserStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

export function useRsvpTotals() {
  const rsvpStore = useRsvpStore()
  const userStore = useUserStore()
  const notifications = useNotificationStore()

  const totals = ref(null)
  const loading = ref(false)
  const showTotals = ref(false)

  const toggleShowTotals = async () => {
    showTotals.value = !showTotals.value
    if (!totals.value) {
      await loadTotals()
    }
  }

  const loadTotals = async () => {
    try {
      loading.value = true
      const response = await rsvpStore.loadRsvpTotals({
        eventId: userStore.activeEvent
      })

      if (response.status === 200) {
        totals.value = response.data.data ?? []
      } else {
        throw new Error('Failed to fetch RSVP totals')
      }
    } catch (error) {
      notifications.addNotification({
        type: 'error',
        message: 'Could not load RSVP totals. Please try again.'
      })
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const formattedTotals = computed(() => {
    if (!totals.value) return {}
    return {
      Attending: totals.value.totalConfirmed,
      Pending: totals.value.totalPending,
      'Not Attending': totals.value.totalDeclined,
      'Main Guests': totals.value.totalMainGuests,
      Companions: totals.value.totalCompanions,
      'Total Guests': totals.value.totalGuests
    }
  })

  return {
    totals,
    loading,
    showTotals,
    toggleShowTotals,
    loadTotals,
    formattedTotals
  }
}
