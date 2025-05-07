<script setup>
import { onMounted, reactive } from 'vue'
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
    <div class="grid grid-cols-2 gap-4">
      <div>
        <p class="text-sm text-gray-600">Total Guests:</p>
        <p class="text-lg font-bold">
          {{ summaries.totalGuests }}
        </p>
      </div>
      <div>
        <p class="text-sm text-green-600">Confirmed:</p>
        <p class="font-bold">
          {{ summaries.confirmed }}
        </p>
      </div>
      <div>
        <p class="text-sm text-yellow-600">Pending:</p>
        <p class="font-bold">
          {{ summaries.pending }}
        </p>
      </div>
      <div>
        <p class="text-sm text-red-600">Declined:</p>
        <p class="font-bold">
          {{ summaries.declined }}
        </p>
      </div>
      <div>
        <p class="text-sm text-yellow-600">Guests:</p>
        <p class="font-bold">
          {{ summaries.mainGuests }}
        </p>
      </div>

      <div>
        <p class="text-sm text-yellow-600">Companions:</p>
        <p class="font-bold">
          {{ summaries.companions }}
        </p>
      </div>

    </div>
  </section>
</template>

<style scoped>

</style>
