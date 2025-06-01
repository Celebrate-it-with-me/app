<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import { useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/useEventsStore'
import { computed, ref, onMounted } from 'vue'
import { CalendarCheck, Eye, Clock, Users, MapPin, Utensils, Calendar, Info } from 'lucide-vue-next'
import { useGuestsStore } from '@/stores/useGuestStore'
import { useSaveTheDateStore } from '@/stores/useSaveTheDateStore'
import { useLocationsStore } from '@/stores/useLocationsStore'
import { useMenusStore } from '@/stores/useMenusStore'

// Store instances
const router = useRouter()
const eventStore = useEventsStore()
const guestStore = useGuestsStore()
const saveTheDate = useSaveTheDateStore()
const locationStore = useLocationsStore()
const menuStore = useMenusStore()

// Component state
const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')
const activeTooltip = ref(null)

// Navigation
const navigateToEventDetails = () => {
  if (eventStore.activeEvent?.id) {
    router.push({
      name: 'event-details',
      params: { id: eventStore.activeEvent.id }
    })
  } else {
    router.push({ name: 'events' })
  }
}

// Computed properties
const hasActiveEvent = computed(() => {
  return !!eventStore.activeEvent
})

const eventName = computed(() => {
  return eventStore.activeEvent?.eventName ?? ''
})

const startDateFormatted = computed(() => {
  const dateStr = eventStore.activeEvent?.startDate ?? ''

  if (!dateStr) return 'Not set'

  try {
    const [datePart, timePart] = dateStr.split(' ')
    const [month, day, year] = datePart.split('/')
    const [hour, minute] = timePart.split(':')

    const parseDate = new Date(year, month - 1, day, hour, minute)

    if (isNaN(parseDate.getTime())) {
      return 'Invalid date'
    }

    // Format date
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    // Format time
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })

    return `${dateFormatter.format(parseDate)} at ${timeFormatter.format(parseDate)}`
  } catch (error) {
    console.error('Date parsing error:', error)
    return 'Invalid date format'
  }
})

const eventVisibility = computed(() => {
  const visibility = eventStore.activeEvent?.visibility ?? ''
  return visibility
    ? visibility.charAt(0).toUpperCase() + visibility.slice(1).toLowerCase()
    : 'Private'
})

const eventStatus = computed(() => {
  const status = eventStore.activeEvent?.status ?? ''
  return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Draft'
})

const progressItems = computed(() => [
  {
    name: 'Event Details',
    completed: eventStore.hasEvents,
    icon: Calendar,
    description: 'Basic information about your event including name, date, and type',
    id: 'event-details'
  },
  {
    name: 'Guest List',
    completed: guestStore.hasGuests > 0,
    icon: Users,
    description: 'Add and manage your guest list with contact information',
    id: 'guest-list'
  },
  {
    name: 'Save The Date',
    completed: saveTheDate.hasSaveTheDate,
    icon: Clock,
    description: 'Send save-the-date notifications to your guests',
    id: 'save-the-date'
  },
  {
    name: 'Location',
    completed: locationStore.hasLocations,
    icon: MapPin,
    description: 'Set the venue and address for your event',
    id: 'location'
  },
  {
    name: 'Menu',
    completed: menuStore.hasMenu,
    icon: Utensils,
    description: 'Plan the food and beverages for your event',
    id: 'menu'
  }
])

const eventProgress = computed(() => {
  if (!eventStore.activeEvent) return 0

  const completedItems = progressItems.value.filter(item => item.completed).length
  const totalItems = progressItems.value.length

  return Math.round((completedItems / totalItems) * 100)
})

const progressColor = computed(() => {
  const progress = eventProgress.value
  if (progress < 25) return 'bg-red-500'
  if (progress < 50) return 'bg-yellow-500'
  if (progress < 75) return 'bg-blue-500'
  return 'bg-green-500'
})

// Tooltip methods
const showTooltip = id => {
  activeTooltip.value = id
}

const hideTooltip = () => {
  activeTooltip.value = null
}

// Status descriptions
const statusDescriptions = {
  Draft: 'Event is in planning stage and not yet published',
  Published: 'Event is live and visible to guests',
  Completed: 'Event has already taken place',
  Cancelled: 'Event has been cancelled'
}

const visibilityDescriptions = {
  Public: 'Event is visible to everyone',
  Private: 'Event is only visible to invited guests'
}

const retry = () => {
  isLoading.value = true
  hasError.value = false
}

// Lifecycle hooks
onMounted(async () => {
  try {
    // Simulate loading (remove this in production if data is already loaded)
    setTimeout(() => {
      isLoading.value = false
    }, 500)
  } catch (error) {
    hasError.value = true
    errorMessage.value = 'Failed to load event data'
    isLoading.value = false
  }
})
</script>

<template>
  <section
    class="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl relative overflow-hidden"
    :class="{ 'opacity-75': isLoading }"
    aria-labelledby="active-event-title"
  >
    <!-- Loading overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-70 flex items-center justify-center z-10"
    >
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="text-center py-4">
      <div class="text-red-500 mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-10 w-10 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p class="text-red-600 dark:text-red-400 font-medium">{{ errorMessage }}</p>
      <CButton variant="secondary" size="sm" class="mt-3" @click="retry"> Retry </CButton>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasActiveEvent" class="text-center py-4">
      <div class="text-gray-400 mb-2">
        <CalendarCheck class="h-10 w-10 mx-auto" />
      </div>
      <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Active Event</h3>
      <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
        Create an event to get started with your planning
      </p>
      <CButton variant="primary" size="sm" @click="router.push({ name: 'create-event' })">
        Create Event
      </CButton>
    </div>

    <!-- Event content -->
    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-5">
        <div
          id="active-event-title"
          class="flex items-center gap-2 text-pink-600 font-semibold text-sm bg-pink-50 dark:bg-pink-950 px-3 py-1.5 rounded-full"
        >
          <CalendarCheck class="w-4 h-4" aria-hidden="true" />
          <span>Active Event</span>
        </div>
        <CButton
          variant="primary"
          size="xs"
          class="rounded-full flex items-center gap-1 transition-transform hover:scale-105"
          aria-label="View event details"
          @click="navigateToEventDetails"
        >
          <Eye class="w-4 h-4" aria-hidden="true" />
          <span>View Details</span>
        </CButton>
      </div>

      <!-- Info -->
      <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-5">
        <h3 class="font-medium text-gray-700 dark:text-gray-200 mb-3 text-base">
          Event Information
        </h3>
        <ul class="space-y-3 text-sm">
          <li class="flex justify-between items-center">
            <span class="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Calendar class="w-4 h-4" aria-hidden="true" />
              <span>Name:</span>
            </span>
            <span class="font-semibold text-gray-800 dark:text-white">{{ eventName }}</span>
          </li>
          <li class="flex justify-between items-center">
            <span class="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Clock class="w-4 h-4" aria-hidden="true" />
              <span>Date:</span>
            </span>
            <span class="font-semibold text-gray-800 dark:text-white">{{
              startDateFormatted
            }}</span>
          </li>
          <li class="flex justify-between items-center">
            <span class="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Eye class="w-4 h-4" aria-hidden="true" />
              <span>Visibility:</span>
            </span>
            <div class="relative">
              <span
                :class="[
                  'font-semibold px-2 py-0.5 rounded-full text-xs flex items-center gap-1 cursor-help',
                  eventVisibility === 'Public'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                ]"
                aria-describedby="visibility-tooltip"
                @mouseenter="showTooltip('visibility')"
                @mouseleave="hideTooltip"
              >
                {{ eventVisibility }}
                <Info class="w-3 h-3" />
              </span>
              <!-- Tooltip -->
              <div
                v-if="activeTooltip === 'visibility'"
                id="visibility-tooltip"
                class="absolute z-10 right-0 top-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 text-xs w-48 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                role="tooltip"
              >
                {{ visibilityDescriptions[eventVisibility] || 'Set the visibility of your event' }}
                <div
                  class="absolute -top-1 right-2 w-2 h-2 bg-white dark:bg-gray-800 border-t border-l border-gray-200 dark:border-gray-700 transform rotate-45"
                ></div>
              </div>
            </div>
          </li>
          <li class="flex justify-between items-center">
            <span class="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Status:</span>
            </span>
            <div class="relative">
              <span
                class="font-semibold px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-1 cursor-help"
                aria-describedby="status-tooltip"
                @mouseenter="showTooltip('status')"
                @mouseleave="hideTooltip"
              >
                {{ eventStatus }}
                <Info class="w-3 h-3" />
              </span>
              <!-- Tooltip -->
              <div
                v-if="activeTooltip === 'status'"
                id="status-tooltip"
                class="absolute z-10 right-0 top-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 text-xs w-48 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                role="tooltip"
              >
                {{ statusDescriptions[eventStatus] || 'Current status of your event' }}
                <div
                  class="absolute -top-1 right-2 w-2 h-2 bg-white dark:bg-gray-800 border-t border-l border-gray-200 dark:border-gray-700 transform rotate-45"
                ></div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Progress section -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Planning Progress</h3>
          <span
            class="text-sm font-bold"
            :class="[
              eventProgress < 25
                ? 'text-red-500'
                : eventProgress < 50
                  ? 'text-yellow-500'
                  : eventProgress < 75
                    ? 'text-blue-500'
                    : 'text-green-500'
            ]"
            >{{ eventProgress }}%</span
          >
        </div>

        <!-- Progress bar -->
        <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-4">
          <div
            :class="[progressColor, 'h-2.5 rounded-full transition-all duration-1000 ease-out']"
            :style="{ width: eventProgress + '%' }"
            role="progressbar"
            :aria-valuenow="eventProgress"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>

        <!-- Progress items -->
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-3">
          <li
            v-for="(item, index) in progressItems"
            :key="index"
            class="flex items-center gap-2 p-2 rounded-lg transition-colors relative group"
            :class="
              item.completed
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400'
            "
            :aria-describedby="`${item.id}-tooltip`"
            @mouseenter="showTooltip(item.id)"
            @mouseleave="hideTooltip"
          >
            <component
              :is="item.icon"
              class="w-4 h-4"
              :class="
                item.completed
                  ? 'text-green-500 dark:text-green-400'
                  : 'text-gray-400 dark:text-gray-500'
              "
              aria-hidden="true"
            />
            <span>{{ item.name }}</span>

            <!-- Status indicator -->
            <div class="ml-auto flex items-center">
              <Info
                class="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-help"
                :class="
                  item.completed
                    ? 'text-green-500 dark:text-green-400'
                    : 'text-gray-400 dark:text-gray-500'
                "
              />
              <svg
                v-if="item.completed"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-green-500 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-gray-300 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <!-- Tooltip -->
            <div
              v-if="activeTooltip === item.id"
              :id="`${item.id}-tooltip`"
              class="absolute z-10 left-1/2 transform -translate-x-1/2 bottom-full mb-1 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 text-xs w-48 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              role="tooltip"
            >
              <div class="font-medium mb-1">{{ item.name }}</div>
              <p>{{ item.description }}</p>
              <div
                class="mt-1 pt-1 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"
              >
                <span>Status:</span>
                <span :class="item.completed ? 'text-green-500 font-medium' : 'text-gray-500'">
                  {{ item.completed ? 'Completed' : 'Pending' }}
                </span>
              </div>
              <div
                class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 rotate-45"
              ></div>
            </div>
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>
