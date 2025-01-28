<script setup>
import Alert from '@/components/UI/alerts/Alert.vue'
import CreateEvent from '@/components/authenticated/events/CreateEvent.vue'
import ShowEvent from '@/components/authenticated/events/ShowEvent.vue'
import MyEventsList from '@/components/authenticated/events/MyEventsList.vue'
import { computed, ref } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'

// Data
const showAddEventView = ref(false)
const eventsStore = useEventsStore()

const handleCreateEvent = () => {
  eventsStore.currentEvent = null
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

    <section
      class="my-events-container flex flex-row gap-x-4 mt-2 border-2 border-gray-200/10 p-10 rounded-md min-h-[300px] h-full"
    >
      <MyEventsList
        @create-event="handleCreateEvent"
      />

      <div class="event-handle w-[70%]">
        <ShowEvent
          v-if="eventsStore.currentEvent"
        />

        <div
          v-else-if="showAddEventView"
          class="w-full"
        >
          <CreateEvent
            @cancel-create="handleCancelCreate"
          />
        </div>

        <Alert
          alert-type="info"
          v-else
        >
          {{ eventMessage }}
        </Alert>
      </div>
    </section>
  </section>
</template>

<style scoped>

</style>
