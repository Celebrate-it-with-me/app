<script setup>
import { useEventsStore } from '@/stores/useEventsStore'

const eventStore = useEventsStore()

</script>

<template>
  <div class="bg-gray-800 text-white p-6 rounded-lg shadow-md">
    <!-- Header with Event Details and Status Badge -->
    <div class="flex items-center justify-between border-b border-gray-700 pb-4 mb-6">
      <h3 class="text-lg font-semibold">Event Details</h3>
      <span
        class="px-3 py-1 text-xs font-bold rounded-full"
        :class="{
          'bg-blue-500 text-white': eventStore.currentEvent.status === 'published',
          'bg-gray-600 text-white': eventStore.currentEvent.status === 'draft',
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
        <span class="font-semibold">Event Date:</span>
        <span class="font-light">{{ eventStore.currentEvent.eventDate }}</span>
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
            'bg-yellow-500 text-black': eventStore.currentEvent.visibility === 'private',
          }"
        >
          {{ eventStore.currentEvent.visibility }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
