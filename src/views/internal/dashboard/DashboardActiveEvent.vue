<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import { useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/useEventsStore'
import { computed } from 'vue'

const router = useRouter()
const eventStore = useEventsStore()

const seeEvent = () => {
  // Todo need to create the event details page
  router.push({ name: 'events' })
}

const eventName = computed(() => {
  return eventStore.activeEvent?.eventName ?? ''
})

const startDateFormatted = computed(() => {
  const dateStr = eventStore.activeEvent?.startDate ?? ''

  if (dateStr !== '') {
    const [datePart, timePart] = dateStr.split(' ')
    const [month, day, year] = datePart.split('/')
    const [hour, minute] = timePart.split(':')

    const parseDate = new Date(year, month - 1, day, hour, minute)

    // Format
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(parseDate)
  }

  return 'Invalid Date'
})

const eventVisibility = computed(() => {
  const visibility = eventStore.activeEvent?.visibility ?? ''

  if (!visibility) {
    return ''
  }

  return visibility.charAt(0).toUpperCase() + visibility.slice(1).toLowerCase()
})

const eventStatus = computed(() => {
  const status = eventStore.activeEvent?.status ?? ''

  if (!status) {
    return ''
  }

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
})

</script>

<template>
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Active Event</h2>
      <CButton variant="primary" size="sm" @click="seeEvent"> See Event </CButton>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <p class="text-gray-600 dark:text-gray-300">Name:</p>
        <p class="font-bold">
          {{ eventName }}
        </p>
      </div>
      <div>
        <p class="text-gray-600 dark:text-gray-300">Date:</p>
        <p class="font-bold">
          {{ startDateFormatted }}
        </p>
      </div>
      <div>
        <p class="text-gray-600 dark:text-gray-300">Visibility:</p>
        <p class="font-bold text-green-600">
          {{ eventVisibility }}
        </p>
      </div>

      <div>
        <p class="text-gray-600 dark:text-gray-300">Status:</p>
        <p class="font-bold text-gray-600">
          {{ eventStatus }}
        </p>
      </div>

      <div>
        <p class="text-gray-600 dark:text-gray-300">Progress:</p>
        <progress class="w-full" value="70" max="100"></progress>
      </div>
    </div>
  </section>
</template>

<style scoped>

</style>
