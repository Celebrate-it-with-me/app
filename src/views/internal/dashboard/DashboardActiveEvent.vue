<template>
  <div
    class="hero-section bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 shadow-sm border-l-4 border-pink-500"
  >
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <h1 class="text-2xl font-bold text-gray-900">
            {{ eventData.eventName || 'Untitled Event' }}
          </h1>
          <span class="text-gray-400">•</span>
          <span class="text-sm text-gray-600 flex items-center gap-1">
            <Calendar class="w-4 h-4 text-pink-500" />
            {{ formattedFullDate }}
          </span>
        </div>

        <div
          :class="[
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all',
            countdownClass
          ]"
        >
          <component :is="countdownIcon" class="w-4 h-4" />
          <span>{{ countdownText }}</span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span
          class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200"
        >
          ✓ Active
        </span>
        <span
          class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold border border-yellow-200"
        >
          {{ eventData.status || 'Draft' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Calendar, Clock, AlertCircle, Flame } from 'lucide-vue-next'
import { computed } from 'vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { format, parse, differenceInHours } from 'date-fns'

const props = defineProps({
  daysUntilEvent: {
    type: Number,
    required: true
  }
})

const eventsStore = useEventsStore()

// Event Data
const eventData = computed(
  () =>
    eventsStore.activeEvent || {
      name: 'Your Event',
      date: new Date().toISOString(),
      status: 'Draft'
    }
)

const formattedFullDate = computed(() => {
  if (!eventData.value?.startDate) return 'Date not set'
  return format(
    parse(eventData.value.startDate, 'MM/dd/yyyy HH:mm', new Date()),
    "EEEE, MMMM d, yyyy 'at' h:mm a"
  )
})

// Countdown styling
const countdownClass = computed(() => {
  const days = props.daysUntilEvent
  if (days === 0) return 'bg-red-100 text-red-700 border-2 border-red-500 animate-pulse'
  if (days < 0) return 'bg-gray-100 text-gray-700 border border-gray-300'
  if (days < 7) return 'bg-orange-100 text-orange-700 border-2 border-orange-400'
  if (days < 30) return 'bg-yellow-100 text-yellow-700 border border-yellow-300'
  return 'bg-purple-100 text-purple-700 border border-purple-300'
})

// Countdown text
const countdownText = computed(() => {
  const days = props.daysUntilEvent

  if (days === 0) {
    const hours = hoursUntilEvent.value
    if (hours > 0) {
      return `🔥 EVENT TODAY - Starts in ${hours} hours!`
    } else if (hours === 0) {
      return '🔥 EVENT HAPPENING NOW!'
    } else {
      return '✓ Event Completed Today'
    }
  }

  if (days === 1) return 'EVENT TOMORROW!'
  if (days < 0) return `Event was ${Math.abs(days)} days ago`
  if (days < 7) return `${days} days away - Coming soon!`
  if (days < 30) return `${days} days away`

  return `${days} days away`
})

// Hours until event (for same-day events)
const hoursUntilEvent = computed(() => {
  if (!eventData.value?.startDate) return 0
  const eventDate = parse(eventData.value.startDate, 'MM/dd/yyyy HH:mm', new Date())
  return Math.max(0, differenceInHours(eventDate, new Date()))
})

// Countdown icon
const countdownIcon = computed(() => {
  const days = props.daysUntilEvent
  if (days === 0) return Flame
  if (days < 7) return AlertCircle
  return Clock
})
</script>
