<template>
  <div class="events-view-container min-h-screen bg-gray-50 dark:bg-gray-900 flex">
    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto px-8 py-10">
      <!-- Page Header -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 class="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            Your
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
              >Celebrations</span
            >
          </h1>
          <p class="text-gray-500 dark:text-gray-400 font-medium">
            Manage {{ events.length }} events across your dashboard.
          </p>
        </div>
        <button class="btn-primary flex items-center gap-2" @click="createNewEvent">
          <PlusCircle class="w-5 h-5" />
          <span>Create New Event</span>
        </button>
      </header>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-20 bg-white/30 dark:bg-gray-800/30 rounded-3xl backdrop-blur-sm border border-gray-100 dark:border-gray-800"
      >
        <CWMLoading class="w-16 h-16 text-purple-600 dark:text-purple-400 mb-6" />
        <p class="text-gray-500 dark:text-gray-400 font-medium animate-pulse">
          Synchronizing your events...
        </p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 mb-8 flex justify-between items-center"
      >
        <div class="flex items-center gap-3">
          <AlertCircle class="w-6 h-6" />
          <p class="font-medium">{{ error }}</p>
        </div>
        <button
          class="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all"
          @click="fetchEvents"
        >
          <RefreshCw class="w-4 h-4" /> Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="events.length === 0"
        class="bg-white rounded-3xl p-12 text-center shadow-xl border border-gray-100 max-w-2xl mx-auto mt-10"
      >
        <div
          class="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CalendarDays class="w-12 h-12 text-purple-600" />
        </div>
        <h3 class="text-2xl font-bold mb-3 text-gray-900">No Events Found</h3>
        <p class="text-gray-500 mb-8 text-lg">
          It looks like you haven't created any events yet. Start planning your first big
          celebration today!
        </p>
        <button class="btn-primary flex items-center gap-2 mx-auto" @click="createNewEvent">
          <PlusCircle class="w-6 h-6" /> Create Your First Event
        </button>
      </div>

      <!-- Content when events exist -->
      <template v-else>
        <!-- Stats Dashboard -->
        <EventsStats
          :total-events="events.length"
          :public-events="publicEvents.length"
          :total-guests="totalGuestsCount"
          :avg-response="avgResponse"
        />

        <!-- Search & Filters -->
        <div
          class="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-10 flex flex-wrap gap-4 items-center"
        >
          <div class="relative flex-1 min-w-[300px]">
            <Search
              class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search events by name..."
              class="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-transparent focus:bg-white dark:focus:bg-gray-950 focus:border-purple-300 rounded-xl transition-all"
            />
          </div>
          <div class="flex gap-2">
            <select
              v-model="statusFilter"
              class="bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 font-medium text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900"
            >
              <option value="all">All Status</option>
              <option value="live">Live</option>
              <option value="draft">Draft</option>
              <option value="past">Past</option>
            </select>
            <button class="btn-secondary flex items-center gap-2">
              <SlidersHorizontal class="w-5 h-5" />
              <span>Advanced Filters</span>
            </button>
          </div>
        </div>

        <section v-if="activeEvent" class="mb-12">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h2
              class="text-xl font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider text-sm"
            >
              Active Event
            </h2>
          </div>
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <EventCard :event="activeEvent" />
          </div>
        </section>

        <section v-if="publicEvents.length" class="mb-12">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h2
              class="text-xl font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider text-sm"
            >
              Currently Published
            </h2>
          </div>
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <EventCard
              v-for="event in publicEvents"
              :key="event.id"
              :event="event"
              @switch-to-active="switchToEvent"
            />
          </div>
        </section>

        <!-- All Events Section -->
        <section>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">All Other Events</h2>
            <span class="text-gray-400 font-medium">{{ allOtherEvents.length }} Events Total</span>
          </div>
          <div
            v-if="allOtherEvents.length"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <EventCard
              v-for="event in allOtherEvents"
              :key="event.id"
              :event="event"
              @switch-to-active="switchToEvent"
            />
          </div>
          <div v-else class="flex items-center justify-center h-full">
            <div class="text-center">
              <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">
                No Other Events Found
              </h2>
              <p class="text-gray-500 dark:text-gray-400">You have no other events to display.</p>
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'
import { useRouter } from 'vue-router'
import { useNotification } from '@kyvg/vue3-notification'

// UI Components
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import EventsStats from './EventsStats.vue'
import EventCard from './EventCard.vue'

// Icons
import {
  PlusCircle,
  Search,
  SlidersHorizontal,
  CalendarDays,
  AlertCircle,
  RefreshCw
} from 'lucide-vue-next'

const eventsStore = useEventsStore()
const router = useRouter()
const { notify } = useNotification()

// State
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const statusFilter = ref('all')

const avgResponse = computed(() => {
  if (!events.value.length) return 0
  const totalResponses = events.value.reduce((sum, event) => sum + (event.rsvpResponse || 0), 0)
  return totalResponses / totalGuestsCount.value
})

// Computed properties
const events = computed(() => eventsStore.events)

const totalGuestsCount = computed(() => {
  return events.value.reduce((sum, event) => sum + (event.guestsCount || 0), 0)
})

const publicEvents = computed(() => {
  return events.value.filter(e => e.status === 'published' && e.id !== activeEvent.value?.id)
})

const allOtherEvents = computed(() => {
  return events.value.filter(e => e.status !== 'published' && e.id !== activeEvent.value?.id)
})

const activeEvent = computed(() => eventsStore.activeEvent ?? null)

const filteredEvents = computed(() => {
  return events.value.filter(e => {
    const matchesSearch = e.eventName.toLowerCase().includes(searchQuery.value.toLowerCase())
    // Basic status logic for filtering
    const isLive = e.status === 'published'
    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'live' && isLive) ||
      (statusFilter.value === 'draft' && !isLive)
    return matchesSearch && matchesStatus
  })
})

// Methods
const fetchEvents = async () => {
  loading.value = true
  error.value = null

  try {
    // Simulate loading/fetch if needed
    await new Promise(resolve => setTimeout(resolve, 500))
    loading.value = false
  } catch (err) {
    error.value = 'Failed to load events. Please try again.'
    loading.value = false
    console.error('Error fetching events:', err)
  }
}

const switchToEvent = async event => {
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

onMounted(() => {
  fetchEvents()
})
</script>

<style scoped>
.events-view-container {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-primary {
  @apply bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transform hover:-translate-y-0.5 transition-all;
}
.btn-secondary {
  @apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl hover:border-purple-300 dark:hover:border-purple-700 font-medium transition-all;
}
</style>
