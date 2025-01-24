<script setup>
import Alert from '@/components/UI/alerts/Alert.vue'
import { computed, ref } from 'vue'
import CreateEvent from '@/components/authenticated/events/CreateEvent.vue'
import MyEvents from '@/components/authenticated/events/MyEvents.vue'
import { useEventsStore } from '@/stores/useEventsStore'

// Data
const showAddEventView = ref(false)
const eventsStore = useEventsStore()

const handleCreateEvent = () => {
  showAddEventView.value = true
}

const handleCancelCreate = () => {
  showAddEventView.value = false
}

const eventMessage = computed(() => {
  if (!eventsStore.events.length) {
    return "You don't have any event yet, please click in 'Add new event' to start"
  }

  if (!eventsStore.currentEvent) {
    return "Please select one event to work on it!"
  }

  return ''
})


</script>

<template>
  <section class="my-events">
    <div class="flex flex-row justify-end">
      <h2 class="text-white text-2xl font-semibold">Events</h2>
    </div>
    <section
      class="my-events-container flex flex-row gap-x-4 mt-10 border-2 border-gray-200/10 p-10 rounded-md min-h-[300px] h-full"
    >
      <MyEvents
        @create-event="handleCreateEvent"
      />

      <div class="event-handle w-[70%]">
        <Alert
          alert-type="info"
          v-if="!showAddEventView"
        >
          {{ eventMessage }}
        </Alert>

        <div class="w-full">
          <CreateEvent
            v-if="showAddEventView"
            @cancel-create="handleCancelCreate"
          />
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped></style>
