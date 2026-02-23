<script setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref } from 'vue'
import { useRsvpStore } from '@/modules/rsvp/stores/useRsvpStore'
import { useUserStore } from '@/stores/useUserStore'
import CBadge from '@/components/UI/badges/CBadge.vue'
import { PieChart, Loader2, AlertCircle, FileBarChart, Info } from 'lucide-vue-next'

// Store instances
const rsvpStore = useRsvpStore()
const userStore = useUserStore()

// RSVP data
const summaries = reactive({
  totalGuests: 0,
  confirmed: 0,
  pending: 0,
  declined: 0,
  mainGuests: 0,
  companions: 0,
  totalAllowed: 0
})

// Chart configuration
const chartOptions = ref({
  labels: ['Confirmed', 'Pending', 'Declined'],
  colors: ['#22c55e', '#facc15', '#ef4444'],
  tooltip: {
    enabled: false
  },
  legend: {
    show: false,
    position: 'right',
    labels: {
      colors: ['#374151'],
      useSeriesColors: false
    },
    fontSize: '14px',
    fontWeight: 400
  },
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '14px'
    }
  },
  stroke: {
    width: 1
  },
  plotOptions: {
    pie: {
      donut: {
        size: '50%'
      }
    }
  }
})

// Computed properties
const series = computed(() => [summaries.confirmed, summaries.pending, summaries.declined])

// Component state
const isLoading = ref(true)
const hasData = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const activeTooltip = ref(null)

// Tooltip methods
const showTooltip = id => {
  activeTooltip.value = id
}

const hideTooltip = () => {
  activeTooltip.value = null
}

// Data loading
const loadRsvpSummary = async () => {
  isLoading.value = true
  hasError.value = false

  try {
    // Don't fetch if no active event
    if (!userStore.activeEvent) {
      isLoading.value = false
      return
    }

    const response = await rsvpStore.loadDashboardRsvpSummary({
      eventId: userStore.activeEvent
    })

    if (response.status === 200) {
      const { confirmed, pending, declined, mainGuests, companions, totalGuests, totalAllowed } =
        response?.data ?? {}

      summaries.totalGuests = totalGuests || 0
      summaries.confirmed = confirmed || 0
      summaries.pending = pending || 0
      summaries.declined = declined || 0
      summaries.mainGuests = mainGuests || 0
      summaries.companions = companions || 0
      summaries.totalAllowed = totalAllowed || 0

      // Check if we have any data to display
      hasData.value = confirmed > 0 || pending > 0 || declined > 0
    } else {
      hasError.value = true
      errorMessage.value = response.message || 'Failed to load RSVP data'
      console.error('Error loading RSVP summary:', response)
    }
  } catch (error) {
    hasError.value = true
    errorMessage.value = error.message || 'An unexpected error occurred'
    console.error('Error fetching RSVP summary:', error)
  } finally {
    isLoading.value = false
  }
}

// Event listener for dashboard refresh
const handleDashboardRefresh = () => {
  loadRsvpSummary()
}

// Lifecycle hooks
onMounted(() => {
  // Initial data load
  loadRsvpSummary()

  // Listen for dashboard refresh events
  document.addEventListener('dashboard-refresh', handleDashboardRefresh)
})

onBeforeUnmount(() => {
  // Clean up event listener
  document.removeEventListener('dashboard-refresh', handleDashboardRefresh)
})
</script>

<template>
  <section
    class="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl relative overflow-hidden"
    :class="{ 'opacity-75': isLoading }"
    aria-labelledby="rsvp-summary-title"
  >
    <!-- Loading overlay -->
    <div
      v-if="isLoading && !hasData"
      class="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-70 flex items-center justify-center z-10"
    >
      <div
        class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"
      ></div>
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div
        id="rsvp-summary-title"
        class="flex items-center gap-2 text-purple-600 font-semibold text-sm bg-purple-50 dark:bg-purple-950 px-3 py-1.5 rounded-full"
      >
        <PieChart class="w-4 h-4" aria-hidden="true" />
        <span>RSVP Summary</span>
      </div>
      <CBadge variant="secondary" size="sm" class="text-xs transition-transform hover:scale-105">
        <span v-if="summaries.totalAllowed === 0">Unlimited Guests</span>
        <span v-else>{{ summaries.totalAllowed }} Guests</span>
      </CBadge>
    </div>

    <!-- Error state -->
    <div v-if="hasError" class="text-center py-4">
      <div class="text-red-500 mb-2">
        <AlertCircle class="h-10 w-10 mx-auto" aria-hidden="true" />
      </div>
      <p class="text-red-600 dark:text-red-400 font-medium">{{ errorMessage }}</p>
      <button
        class="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors"
        aria-label="Retry loading RSVP data"
        @click="loadRsvpSummary"
      >
        Try again
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasData" class="text-center py-4">
      <div class="text-gray-400 mb-2">
        <FileBarChart class="h-10 w-10 mx-auto" aria-hidden="true" />
      </div>
      <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No RSVP Data</h3>
      <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
        No guest responses have been received yet
      </p>
    </div>

    <!-- RSVP content -->
    <div v-else class="flex flex-col items-center justify-between gap-6 min-h-[200px] relative">
      <!-- Chart on top -->
      <div class="w-full" aria-hidden="true">
        <apexchart
          width="100%"
          height="200px"
          type="donut"
          :options="chartOptions"
          :series="series"
        />
      </div>

      <!-- Response summary below -->
      <div class="flex flex-col gap-3 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 w-full">
        <h3 class="font-medium text-gray-700 dark:text-gray-200 mb-1 text-base">
          Response Summary
        </h3>
        <ul class="space-y-3">
          <li class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-green-500" aria-hidden="true"></span>
            <span class="text-gray-700 dark:text-gray-300">Confirmed:</span>
            <span class="font-semibold text-gray-800 dark:text-white ml-auto">{{
              summaries.confirmed
            }}</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-yellow-400" aria-hidden="true"></span>
            <span class="text-gray-700 dark:text-gray-300">Pending:</span>
            <span class="font-semibold text-gray-800 dark:text-white ml-auto">{{
              summaries.pending
            }}</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-red-500" aria-hidden="true"></span>
            <span class="text-gray-700 dark:text-gray-300">Declined:</span>
            <span class="font-semibold text-gray-800 dark:text-white ml-auto">{{
              summaries.declined
            }}</span>
          </li>
          <li class="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span class="text-gray-700 dark:text-gray-300">Total Guests:</span>
            <span class="font-semibold text-gray-800 dark:text-white ml-auto">{{
              summaries.totalGuests
            }}</span>
          </li>
          <li
            v-if="summaries.mainGuests > 0 || summaries.companions > 0"
            class="flex items-center gap-2"
          >
            <div
              class="relative flex items-center gap-1 cursor-help"
              aria-describedby="guest-breakdown-tooltip"
              @mouseenter="showTooltip('guest-breakdown')"
              @mouseleave="hideTooltip"
            >
              <span class="text-gray-700 dark:text-gray-300">Breakdown:</span>
              <Info class="w-3 h-3 text-gray-400" aria-hidden="true" />

              <!-- Tooltip -->
              <div
                v-if="activeTooltip === 'guest-breakdown'"
                id="guest-breakdown-tooltip"
                class="absolute z-10 left-0 bottom-full mb-1 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 text-xs w-48 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                role="tooltip"
              >
                <div class="font-medium mb-1">Guest Breakdown</div>
                <div class="flex justify-between">
                  <span>Main Guests:</span>
                  <span class="font-semibold">{{ summaries.mainGuests }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Companions:</span>
                  <span class="font-semibold">{{ summaries.companions }}</span>
                </div>
                <div
                  class="absolute -bottom-1 left-4 w-2 h-2 bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 rotate-45"
                ></div>
              </div>
            </div>
            <div class="ml-auto flex items-center gap-1">
              <span class="text-xs text-gray-500"
                >{{ summaries.mainGuests }} + {{ summaries.companions }}</span
              >
            </div>
          </li>
        </ul>
      </div>

      <!-- Loading indicator when refreshing with existing data -->
      <div v-if="isLoading" class="absolute bottom-4 right-4 flex items-center justify-center">
        <Loader2 class="w-4 h-4 text-purple-500 animate-spin" aria-hidden="true" />
        <span class="ml-2 text-xs text-gray-500">Refreshing...</span>
      </div>
    </div>
  </section>
</template>
