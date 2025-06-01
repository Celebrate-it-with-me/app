<script setup>
import { CheckIcon } from '@heroicons/vue/16/solid'
import { useEventsStore } from '@/stores/useEventsStore'
import { computed } from 'vue'

const eventsStore = useEventsStore()
const props = defineProps({
  activeEvent: {
    type: Object,
    required: true
  }
})

const handleSelectEvent = event => {
  eventsStore.selectEvent(event.id)
}

const textColor = computed(() => {
  if (eventsStore.currentEvent && eventsStore.currentEvent.id === props.activeEvent.id) {
    return 'text-yellow-300 hover:text-yellow-500'
  }
  return 'text-gray-300 hover:text-white'
})
</script>

<template>
  <li
    class="py-1 flex items-center justify-between transition-colors mb-1"
    :class="textColor"
    @click="handleSelectEvent(activeEvent)"
  >
    <label :for="`event-${activeEvent.id}`" class="text-sm font-light cursor-pointer">
      {{ activeEvent.eventName }}
    </label>

    <CheckIcon class="h-6 w-6 cursor-pointer"> </CheckIcon>
  </li>
</template>

<style scoped></style>
