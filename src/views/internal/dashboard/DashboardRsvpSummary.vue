<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRsvpStore } from '@/stores/useRsvpStore'
import { useUserStore } from '@/stores/useUserStore'
import CBadge from '@/components/UI/badges/CBadge.vue'
import { PieChart } from 'lucide-vue-next'

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

onMounted(() => {
  loadRsvpSummary()
})

const loadRsvpSummary = async () => {
  try {
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
    } else {
      console.error('Error loading RSVP summary:', response)
    }
  } catch (error) {
    console.error('Error fetching RSVP summary:', error)
  }
}
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
    <div class="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
      <apexchart
        width="100%"
        height="200px"
        type="donut"
        :options="chartOptions"
        :series="series"
      />
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
    </div>
  </section>
</template>
