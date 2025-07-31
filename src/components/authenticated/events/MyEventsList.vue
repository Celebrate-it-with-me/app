<script setup>
import { PlusIcon } from '@heroicons/vue/16/solid'
import { useEventsStore } from '@/stores/useEventsStore'
import EventLi from '@/components/authenticated/events/EventLi.vue'
import CWMButton from '@/components/UI/form/CWMButton.vue'
import TextField from '@/components/UI/form/TextField.vue'
import { ref, watch } from 'vue'
import debounce from 'lodash.debounce'

const emit = defineEmits(['createEvent', 'selectedEvent'])
const eventsStore = useEventsStore()
const eventName = ref('')

const showAddEvent = () => {
  emit('createEvent')
}

const changeEventNameSearch = debounce(query => {
  eventsStore.filterEvents(query)
})

const eventSelected = () => {
  emit('selectedEvent')
}

watch(eventName, changeEventNameSearch)
</script>

<template>
  <div class="events-lists w-[30%] bg-gray-800 rounded-lg p-6 flex flex-col justify-between pr-6">
    <div class="my-events w-full">
      <div class="mb-5">
        <TextField
          v-model="eventName"
          name="evenFilter"
          label=""
          class-input="w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2
                       focus:ring-blue-400 input-control w-full block focus:outline-none h-[40px]"
          placeholder="Event Name"
        />
      </div>
      <ul>
        <EventLi
          v-for="activeEvent in eventsStore.activeEvents"
          :key="activeEvent.id"
          :active-event="activeEvent"
          @click="eventSelected"
        />
      </ul>
    </div>

    <div class="w-full add__new-event">
      <CWMButton size="small" @click="showAddEvent">
        <PlusIcon class="h-6 w-6" />
        Add New Event
      </CWMButton>
    </div>
  </div>
</template>

<style scoped></style>
