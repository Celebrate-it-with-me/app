<template>
  <section class="events-view">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div>
        <CHeading :level="2" weight="semibold" class="text-rose-darken">My Events</CHeading>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Manage all your celebrations in one place</p>
      </div>
      <CButton variant="gradient" @click="createNewEvent" class="bg-gradient-to-r from-rose to-rose-dark hover:from-rose-dark hover:to-rose-darken text-white">
        <PlusCircle class="w-4 h-4 mr-2" />
        Create New Event
      </CButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <CWMLoading class="w-12 h-12 text-rose mb-4" />
      <p class="text-gray-500 dark:text-gray-400">Loading your events...</p>
    </div>

    <!-- Error State -->
    <CAlert v-else-if="error" variant="error" class="mb-6">
      <template #icon>
        <AlertCircle class="w-5 h-5" />
      </template>
      <p>{{ error }}</p>
      <CButton @click="fetchEvents" variant="text" size="sm" class="mt-2">
        <RefreshCw class="w-4 h-4 mr-1" /> Try Again
      </CButton>
    </CAlert>

    <!-- Empty State -->
    <div v-else-if="!hasEvents" class="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-card border border-gray-200 dark:border-gray-700">
      <CalendarDays class="w-16 h-16 mx-auto text-rose mb-4" />
      <CHeading :level="4" class="mb-2">No Events Yet</CHeading>
      <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Create your first event to start planning your celebration. You can add details, invite guests, and more.
      </p>
      <CButton variant="gradient" @click="createNewEvent" class="bg-gradient-to-r from-rose to-rose-dark hover:from-rose-dark hover:to-rose-darken text-white">
        <PlusCircle class="w-4 h-4 mr-2" />
        Create Your First Event
      </CButton>
    </div>

    <!-- Content when events exist -->
    <template v-else>
      <!-- Active Event Section -->
      <div v-if="activeEvent" class="mb-10">
        <div class="flex items-center mb-4">
          <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <CHeading :level="5" class="text-rose">Active Event</CHeading>
        </div>

        <ActiveEventCard
          :active-event="activeEvent"
          :user-role="getUserRole(activeEvent)"
        />
      </div>

      <!-- Other Events Section -->
      <div v-if="otherEvents.length > 0" class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <CHeading :level="5" class="text-gray-700 dark:text-gray-300">Other Events</CHeading>
            <CBadge variant="secondary" class="ml-2">{{ otherEvents.length }}</CBadge>
          </div>

          <!-- Filter/Sort Options (can be expanded later) -->
          <div class="flex items-center">
            <button class="text-gray-500 hover:text-rose focus:outline-none">
              <SlidersHorizontal class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <OtherEventCard
            v-for="event in otherEvents"
            :key="event.id"
            :event="event"
            :user-role="getUserRole(event)"
            @switch-event="switchToEvent"
          />
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'
import { useUserStore } from '@/stores/useUserStore'
import { useRouter } from 'vue-router'
import { useNotification } from '@kyvg/vue3-notification'

// UI Components
import CHeading from '@/components/UI/headings/CHeading.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import CBadge from '@/components/UI/badges/CBadge.vue'

// Event Card Components
import OtherEventCard from '@/views/internal/events/OtherEventCard.vue'
import ActiveEventCard from '@/views/internal/events/ActiveEventCard.vue'

// Icons
import { PlusCircle, CalendarDays, AlertCircle, RefreshCw, SlidersHorizontal } from 'lucide-vue-next'

const eventsStore = useEventsStore()
const userStore = useUserStore()
const router = useRouter()
const { notify } = useNotification()

// State
const loading = ref(true)
const error = ref(null)

const getUserRole = (event) => {
  return event.userRole
}

// Computed properties
const activeEvent = computed(() => eventsStore.activeEvent)
const otherEvents = computed(() =>
  eventsStore.events.filter(e => e.id !== eventsStore.activeEvent?.id)
)
const hasEvents = computed(() => eventsStore.events.length > 0)

// Methods
const fetchEvents = async () => {
  loading.value = true
  error.value = null

  try {
    // This is a placeholder - replace with actual fetch logic if needed
    // If events are already loaded in the store, this might not be necessary
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate loading
    loading.value = false
  } catch (err) {
    error.value = 'Failed to load events. Please try again.'
    loading.value = false
    console.error('Error fetching events:', err)
  }
}

const switchToEvent = async (event) => {
  try {
    loading.value = true
    await eventsStore.setActiveEvent(event)
    notify({
      title: 'Event Activated',
      text: `"${event.eventName}" is now your active event`,
      type: 'success'
    })
  } catch (error) {
    notify({
      title: 'Error',
      text: 'Failed to switch active event',
      type: 'error'
    })
    console.error('Error switching event:', error)
  } finally {
    loading.value = false
  }
}

const createNewEvent = () => {
  router.push('/dashboard/events/create')
}

// Lifecycle hooks
onMounted(() => {
  fetchEvents()
})
</script>

<style scoped>
.events-view {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
