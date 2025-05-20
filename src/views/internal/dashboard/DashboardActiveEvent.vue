<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import { useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/useEventsStore'
import { computed } from 'vue'
import { CalendarCheck, Eye } from 'lucide-vue-next'
import { useGuestsStore } from '@/stores/useGuestStore'
import { useSaveTheDateStore } from '@/stores/useSaveTheDateStore'
import { useLocationsStore } from '@/stores/useLocationsStore'
import { useMenusStore } from '@/stores/useMenusStore'

const router = useRouter()
const eventStore = useEventsStore()
const guestStore = useGuestsStore()
const saveTheDate = useSaveTheDateStore()
const locationStore = useLocationsStore()
const menuStore = useMenusStore()

const seeEvent = () => {
  router.push({ name: 'events' }) // puedes cambiar esto al detalle real
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
  return visibility ? visibility.charAt(0).toUpperCase() + visibility.slice(1).toLowerCase() : ''
})

const eventStatus = computed(() => {
  const status = eventStore.activeEvent?.status ?? ''
  return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : ''
})

const eventProgress = computed(() => {
  const event = eventStore.activeEvent
  if (!event) return 0

  let total = 0
  if (eventStore.hasEvents) total += 20
  if (guestStore.hasGuests > 0) total += 20
  if (saveTheDate.hasSaveTheDate) total += 20
  if (locationStore.hasLocations) total += 20
  if (menuStore.hasMenu) total += 20

  return total
})

</script>

<template>
  <section class="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 border border-gray-100">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2 text-pink-600 font-semibold text-sm bg-pink-50 dark:bg-pink-950 px-3 py-1 rounded-full">
        <CalendarCheck class="w-4 h-4" />
        Active Event
      </div>
      <CButton variant="primary" size="sm" class="rounded-full flex items-center gap-1" @click="seeEvent">
        <Eye class="w-4 h-4" />
        See Event
      </CButton>
    </div>

    <!-- Info -->
    <ul class="space-y-3 text-sm">
      <li class="flex justify-between">
        <span class="text-gray-500 dark:text-gray-400">Name:</span>
        <span class="font-semibold text-gray-800 dark:text-white">{{ eventName }}</span>
      </li>
      <li class="flex justify-between">
        <span class="text-gray-500 dark:text-gray-400">Date:</span>
        <span class="font-semibold text-gray-800 dark:text-white">{{ startDateFormatted }}</span>
      </li>
      <li class="flex justify-between">
        <span class="text-gray-500 dark:text-gray-400">Visibility:</span>
        <span :class="['font-semibold', eventVisibility === 'Public' ? 'text-green-600' : 'text-yellow-500']">
          {{ eventVisibility }}
        </span>
      </li>
      <li class="flex justify-between">
        <span class="text-gray-500 dark:text-gray-400">Status:</span>
        <span class="font-semibold text-gray-600 dark:text-gray-300">{{ eventStatus }}</span>
      </li>
    </ul>

    <div class="mt-6">
      <p class="text-sm text-gray-500 mb-1">Progress: {{ eventProgress }}%</p>
      <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
        <div
          class="bg-gradient-to-r from-pink-400 to-fuchsia-500 h-2 rounded-full transition-all duration-500"
          :style="{ width: eventProgress + '%' }"
        ></div>
      </div>
    </div>
  </section>
</template>
