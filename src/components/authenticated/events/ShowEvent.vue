<script setup>
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { computed, ref } from 'vue'
import DeleteEventModal from '@/components/UI/Modal/DeleteEventModal.vue'

const emit = defineEmits(['editEvent'])
const eventStore = useEventsStore()
const showConfirmDelete = ref(false)

const currentEventFeature = computed(() => {
  return eventStore.currentEvent.eventFeature ?? null
})

const showConfirmDeleteModal = () => {
  showConfirmDelete.value = true
}

const handleCloseDelete = () => {
  showConfirmDelete.value = false
}

const editCurrentEvent = () => {
  emit('editEvent')
}
</script>

<template>
  <div class="bg-gray-800 text-white p-6 rounded-lg shadow-md min-h-[550px]">
    <!-- Header with Event Details and Status Badge -->
    <div class="flex items-center justify-between border-b border-gray-700 pb-4 mb-6">
      <h3 class="text-lg font-semibold">Event Details</h3>
      <span
        class="px-3 py-1 text-xs font-bold rounded-full"
        :class="{
          'bg-blue-500 text-white': eventStore.currentEvent.status === 'published',
          'bg-gray-600 text-white': eventStore.currentEvent.status === 'draft'
        }"
      >
        {{ eventStore.currentEvent.status }}
      </span>
    </div>

    <!-- Event Information -->
    <div class="space-y-4">
      <!-- Event Name -->
      <div class="flex justify-between">
        <span class="font-semibold">Event Name:</span>
        <span class="font-light">{{ eventStore.currentEvent.eventName }}</span>
      </div>

      <!-- Event Date -->
      <div class="flex justify-between">
        <span class="font-semibold">Start Date:</span>
        <span class="font-light">{{ eventStore.currentEvent.startDate }}</span>
      </div>

      <div class="flex justify-between">
        <span class="font-semibold">End Date:</span>
        <span class="font-light">{{ eventStore.currentEvent.endDate }}</span>
      </div>

      <!-- Event Description -->
      <div class="flex justify-between">
        <span class="font-semibold">Description:</span>
        <span class="font-light">{{ eventStore.currentEvent.eventDescription }}</span>
      </div>

      <!-- Visibility as a modern Chip -->
      <div class="flex justify-between items-center">
        <span class="font-semibold">Visibility:</span>
        <span
          class="inline-block px-3 py-1 text-xs font-medium rounded-md"
          :class="{
            'bg-green-500 text-white': eventStore.currentEvent.visibility === 'public',
            'bg-yellow-500 text-black': eventStore.currentEvent.visibility === 'private'
          }"
        >
          {{ eventStore.currentEvent.visibility }}
        </span>
      </div>

      <div class="mt-5 border-b border-gray-700 mb-5"></div>

      <h3 class="text-lg font-semibold">Event Features</h3>

      <div class="grid grid-cols-2 gap-6 mt-5">
        <p class="font-thin">
          <span v-if="currentEventFeature?.saveTheDate" class="font-semibold">ON</span>
          <span v-else class="font-semibold">OFF</span>
          Save the Date
        </p>

        <p class="font-thin">
          <span v-if="currentEventFeature?.rsvp" class="font-semibold">ON</span>
          <span v-else class="font-semibold">OFF</span>
          RSVP
        </p>

        <p class="font-thin">
          <span v-if="currentEventFeature?.sweetMemories" class="font-semibold">ON</span>
          <span v-else class="font-semibold">OFF</span>
          Sweet Memories
        </p>

        <p class="font-thin">
          <span v-if="currentEventFeature?.music" class="font-semibold">ON</span>
          <span v-else class="font-semibold">OFF</span>
          Music
        </p>

        <p class="font-thin">
          <span v-if="currentEventFeature?.backgroundMusic" class="font-semibold">ON</span>
          <span v-else class="font-semibold">OFF</span>
          Background Music
        </p>

        <p class="font-thin">
          <span v-if="currentEventFeature?.eventComments" class="font-semibold">ON</span>
          <span v-else class="font-semibold">OFF</span>
          Event Comments
        </p>

        <p class="font-thin">
          <span v-if="currentEventFeature?.seatsAccommodation" class="font-semibold">ON</span>
          <span v-else class="font-semibold">OFF</span>
          Seats Accommodation
        </p>

        <p class="font-thin">
          <span v-if="currentEventFeature?.preview" class="font-semibold">ON</span>
          <span v-else class="font-semibold">OFF</span>
          Page Event Preview
        </p>

        <p class="font-thin">
          <span v-if="currentEventFeature?.budget" class="font-semibold">ON</span>
          <span v-else class="font-semibold">OFF</span>
          Event Budget
        </p>

        <p class="font-thin">
          <span v-if="currentEventFeature?.analytics" class="font-semibold">ON</span>
          <span v-else class="font-semibold">OFF</span>
          Event Analytics
        </p>
      </div>

      <div class="mt-6 flex justify-end items-center gap-4">
        <button
          type="button"
          class="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-2 px-6 rounded-md"
          @click="editCurrentEvent"
        >
          Edit
        </button>
        <button
          type="submit"
          class="text-white text-sm font-medium py-2 px-6 rounded-md bg-red-500 hover:bg-red-600 cursor-pointer"
          @click="showConfirmDeleteModal"
        >
          Delete
        </button>
      </div>
      <DeleteEventModal :open="showConfirmDelete" @close-modal="handleCloseDelete" />
    </div>
  </div>
</template>
