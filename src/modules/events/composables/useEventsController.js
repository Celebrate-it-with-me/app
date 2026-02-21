import { ref, computed, onMounted } from 'vue'
import { useEventsStore } from '../stores/useEventsStore'
import { useUserStore } from '@/stores/useUserStore'
import { useRouter } from 'vue-router'
import { useNotification } from '@kyvg/vue3-notification'
import { storeToRefs } from 'pinia'

export function useEventsController() {
  const eventsStore = useEventsStore()
  const userStore = useUserStore()
  const router = useRouter()
  const { notify } = useNotification()

  const { events, activeEvent } = storeToRefs(eventsStore)

  // State
  const loading = ref(true)
  const error = ref(null)
  const searchQuery = ref('')
  const statusFilter = ref('all')

  const avgResponse = computed(() => {
    if (!events.value.length) return 0
    const totalResponses = events.value.reduce((sum, event) => sum + (event.rsvpResponse || 0), 0)
    return totalResponses / (totalGuestsCount.value || 1)
  })

  const totalGuestsCount = computed(() => {
    return events.value.reduce((sum, event) => sum + (event.guestsCount || 0), 0)
  })

  const publicEvents = computed(() => {
    return events.value.filter(e => e.status === 'published' && e.id !== activeEvent.value?.id)
  })

  const allOtherEvents = computed(() => {
    return events.value.filter(e => e.status !== 'published' && e.id !== activeEvent.value?.id)
  })

  const filteredEvents = computed(() => {
    return events.value.filter(e => {
      const matchesSearch = e.eventName.toLowerCase().includes(searchQuery.value.toLowerCase())
      const notActive = e.id !== activeEvent.value?.id
      const isLive = e.status === 'published'
      const matchesStatus =
        statusFilter.value === 'all' ||
        (statusFilter.value === 'live' && isLive) ||
        (statusFilter.value === 'draft' && !isLive)
      return matchesSearch && matchesStatus && notActive
    })
  })

  // Methods
  const fetchEvents = async () => {
    loading.value = true
    error.value = null

    try {
      // Force loading even if events exist, to ensure we get latest data and activeEvent sync
      await eventsStore.initEvents()

      // Ensure we have an active event if possible
      if (!activeEvent.value && userStore.activeEvent) {
        eventsStore.selectEvent(userStore.activeEvent)
      }

      loading.value = false
    } catch (err) {
      error.value = 'Failed to load events. Please try again.'
      loading.value = false
      console.error('Error fetching events:', err)
    }
  }

  const switchToEvent = async event => {
    try {
      // Set the active event in the store FIRST
      await eventsStore.setActiveEvent(event)

      // Show notification
      notify({
        title: 'Event Activated',
        text: `"${event.eventName}" is now your active event`,
        type: 'success'
      })

      // Optionally reload data or just let reactivity handle it
      // Avoid setting loading=true here if it causes components to unmount prematurely
    } catch (error) {
      notify({
        title: 'Error',
        text: 'Failed to switch active event',
        type: 'error'
      })
      console.error('Error switching event:', error)
    }
  }

  const createNewEvent = () => {
    router.push('/dashboard/events/create')
  }

  onMounted(() => {
    fetchEvents()
  })

  return {
    loading,
    error,
    searchQuery,
    statusFilter,
    events,
    activeEvent,
    avgResponse,
    totalGuestsCount,
    publicEvents,
    allOtherEvents,
    filteredEvents,
    fetchEvents,
    switchToEvent,
    createNewEvent
  }
}
