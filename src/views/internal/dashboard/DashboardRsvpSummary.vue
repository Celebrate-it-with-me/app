<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRsvpStore } from '@/stores/useRsvpStore'
import { useUserStore } from '@/stores/useUserStore'
import CBadge from '@/components/UI/badges/CBadge.vue'

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
  legend: {
    show: false,
    position: 'right',
    labels: {
      colors: ['#374151'], // Tailwind slate-700 (optional for dark/light mode)
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
    const response = await rsvpStore.loadDashboardRsvpSummary(
      {
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
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Rsvp Summary</h2>
      <CBadge
        variant="secondary"
        size="sm"
        class="text-xs"
      >
        <span v-if="summaries.totalAllowed === 0">
          Unlimited Guests
        </span>
        <span v-else-if="summaries.totalAllowed !== 0">
          {{ summaries.totalAllowed }} Guests
        </span>
      </CBadge>
    </div>

    <div class="w-full p-4 flex items-center justify-between">
      <apexchart
        width="100%"
        height="150px"
        type="donut"
        :options="chartOptions"
        :series="series"
      />
      <div class="flex flex-col justify-center gap-4 mt-4 text-sm">
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-full bg-green-500"></span> Confirmed
        </div>
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-full bg-yellow-400"></span> Pending
        </div>
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-full bg-red-500"></span> Declined
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>

</style>
