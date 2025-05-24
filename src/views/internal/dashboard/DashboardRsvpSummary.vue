<script setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref, inject } from 'vue'
import { useRsvpStore } from '@/stores/useRsvpStore'
import { useUserStore } from '@/stores/useUserStore'
import CBadge from '@/components/UI/badges/CBadge.vue'
import { PieChart, Loader2, AlertCircle, FileBarChart } from 'lucide-vue-next'

const rsvpStore = useRsvpStore()
const userStore = useUserStore()
const summaries = reactive({
  totalGuests: 0,
  confirmed: 0,
  pending: 0,
  declined: 0,
  mainGuests: 0,
  companions: 0,
  totalAllowed: 0
})

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

const series = computed(() => [
  summaries.confirmed,
  summaries.pending,
  summaries.declined
])


// Component state
const isLoading = ref(true)
const hasData = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

const loadRsvpSummary = async () => {
  isLoading.value = true
  hasData.value = false
  hasError.value = false

  try {
    // Don't fetch if no active event
    if (!userStore.activeEvent) return

    const response = await rsvpStore.loadDashboardRsvpSummary({
      eventId: userStore.activeEvent
    })

    if (response.status === 200) {
      const {
        confirmed,
        pending,
        declined,
        mainGuests,
        companions,
        totalGuests,
        totalAllowed
      } = response?.data ?? {}

      summaries.totalGuests = totalGuests
      summaries.confirmed = confirmed
      summaries.pending = pending
      summaries.declined = declined
      summaries.mainGuests = mainGuests
      summaries.companions = companions
      summaries.totalAllowed = totalAllowed

      // Check if we have any data to display
      hasData.value = (confirmed > 0 || pending > 0 || declined > 0)
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
  <section class="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 border border-gray-100">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2 text-purple-600 font-semibold text-sm bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded-full">
        <PieChart class="w-4 h-4" />
        RSVP Summary
      </div>
      <CBadge variant="secondary" size="sm" class="text-xs">
        <span v-if="summaries.totalAllowed === 0">Unlimited Guests</span>
        <span v-else>{{ summaries.totalAllowed }} Guests</span>
      </CBadge>
    </div>

    <!-- Content -->
    <!-- Loading state -->
    <div v-if="isLoading && !hasData" class="py-8 flex flex-col items-center justify-center">
      <Loader2 class="w-8 h-8 text-purple-500 animate-spin mb-2" />
      <p class="text-gray-500 text-sm">Loading RSVP data...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="py-8 flex flex-col items-center justify-center">
      <AlertCircle class="w-8 h-8 text-red-500 mb-2" />
      <p class="text-red-500 text-sm font-medium">{{ errorMessage }}</p>
      <button
        @click="loadRsvpSummary"
        class="mt-3 text-purple-600 hover:text-purple-800 text-sm font-medium"
      >
        Try again
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasData" class="py-8 flex flex-col items-center justify-center">
      <FileBarChart class="w-8 h-8 text-gray-400 mb-2" />
      <p class="text-gray-500 text-sm">No RSVP data available yet</p>
    </div>

    <div v-else class="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 min-h-[200px] relative">
      <div class="w-full md:w-auto">
        <apexchart
          width="100%"
          height="200px"
          type="donut"
          :options="chartOptions"
          :series="series"
        />
      </div>
      <div class="flex flex-col gap-2 text-sm">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-green-500"></span>
          Confirmed ({{ summaries.confirmed }})
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-yellow-400"></span>
          Pending ({{ summaries.pending }})
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-red-500"></span>
          Declined ({{ summaries.declined }})
        </div>
      </div>

      <!-- Loading indicator when refreshing with existing data -->
      <div v-if="isLoading" class="absolute bottom-4 right-4 flex items-center justify-center">
        <Loader2 class="w-4 h-4 text-purple-500 animate-spin" />
        <span class="ml-2 text-xs text-gray-500">Refreshing...</span>
      </div>
    </div>
  </section>
</template>
