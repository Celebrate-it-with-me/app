<script setup>
import { CheckIcon, PlusIcon } from '@heroicons/vue/16/solid'
import { useEventsStore } from '@/stores/useEventsStore'
import EventLi from '@/components/authenticated/events/EventLi.vue'

const emit = defineEmits(['createEvent'])
const eventsStore = useEventsStore()



const showAddEvent = () => {
  emit('createEvent')
}

</script>

<template>
  <div class="events-lists w-[30%]">
    <div class="my-events">
      <ul>
        <EventLi
          v-for="activeEvent in eventsStore.activeEvents"
          :active-event="activeEvent"
          :key="activeEvent.id"
        />
      </ul>
    </div>

    <div class="add__new-event">
      <p
        class="text-yellow-100/40 transition-colors duration-500 hover:text-yellow-300/75 flex flex-row gap-x-1 justify-start items-center cursor-pointer"
        @click="showAddEvent"
      >
        <PlusIcon class="h-6 w-6" />
        Add New Event
      </p>
    </div>
  </div>



</template>

<style scoped>

</style>
