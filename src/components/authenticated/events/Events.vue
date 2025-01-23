<script setup>
import { PlusIcon } from '@heroicons/vue/16/solid'
import Alert from '@/components/UI/alerts/Alert.vue'
import { ref } from 'vue'
import CreateEvent from '@/components/authenticated/events/CreateEvent.vue'

// Data
const showAddEventView = ref(false)

const showAddEvent = () => {
  showAddEventView.value = true
}

const handleCancelCreate = () => {
  showAddEventView.value = false
}

</script>

<template>
  <section class="my-events">
    <div class="flex flex-row justify-end">
      <h2 class="text-white text-2xl font-semibold">Events</h2>
    </div>
    <section
      class="my-events-container flex flex-row gap-x-4 mt-10 border-2 border-gray-200/10 p-10 rounded-md min-h-[300px] h-full"
    >
      <div class="events-lists w-[30%]">
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

      <div class="event-handle w-[70%]">
        <Alert
          alert-type="info"
          v-if="!showAddEventView"
        >
          You don't have any event yet!
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
