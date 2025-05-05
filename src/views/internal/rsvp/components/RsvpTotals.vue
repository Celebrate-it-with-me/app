<template>
  <div>
    <CButton variant="outline" @click="loadTotals" :disabled="loading">
      <LucideBarChart2 class="w-4 h-4 mr-2" /> Show Totals
    </CButton>

    <div v-if="totals" class="mt-4 bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">RSVP Summary</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="(value, label) in formattedTotals" :key="label" class="text-center">
          <div class="text-2xl font-bold text-primary">{{ value }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-300">{{ label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { LucideBarChart2 } from 'lucide-vue-next'
import { useRsvpStore } from '@/stores/useRsvpStore'
import { useUserStore } from '@/stores/useUserStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

const rsvpStore = useRsvpStore()
const userStore = useUserStore()
const notifications = useNotificationStore()

const totals = ref(null)
const loading = ref(false)

const loadTotals = async () => {
  try {
    loading.value = true
    const response = await rsvpStore.loadRsvpTotals({ eventId: userStore.activeEvent })

    if (response.status === 200) {
      totals.value = response.data.data ?? []
    } else {
      throw new Error('Failed to fetch RSVP totals')
    }
  } catch (error) {
    notifications.addNotification({
      type: 'error',
      message: 'Could not load RSVP totals. Please try again.',
    })
    console.error(error)
  } finally {
    loading.value = false
  }
}

const formattedTotals = computed(() => {
  if (!totals.value) return {}
  return {
    Confirmed: totals.value.totalConfirmed,
    Pending: totals.value.totalPending,
    Declined: totals.value.totalDeclined,
    'Main Guests': totals.value.totalMainGuests,
    Companions: totals.value.totalCompanions,
    'Total Guests': totals.value.totalGuests,
  }
})
</script>
