<script setup>

import { useTemplateStore } from '@/stores/useTemplateStore'
import { computed } from 'vue'

const templateStore = useTemplateStore()

const guestCompanions = computed(() => {
  return templateStore.guest?.companions ?? []
})

</script>

<template>
    <div class="w-[80%] confirmation-section p-6 bg-white shadow-md rounded-md">
      <!-- Thank You Message -->
      <h2 class="text-xl font-bold text-purple-600 mb-4">
        Thank you for confirming your attendance, {{ templateStore.guestFullName }}!
      </h2>

      <!-- Event Name -->
      <p class="text-gray-700 mb-6">
        We are excited to welcome you to the <span class="font-bold">{{ templateStore.eventName }}</span>.
      </p>

      <!-- User's Information -->
      <h3 class="text-lg font-semibold text-gray-800 mb-2">Your Information:</h3>
      <ul class="mb-4">
        <li class="text-gray-700">✉️ Email: {{ templateStore.guest?.email ?? '' }}</li>
        <li class="text-gray-700">📞 Phone: {{ templateStore.guest?.phone ?? '' }}</li>
      </ul>

      <!-- Companions Information -->
      <h3
        class="text-lg font-semibold text-gray-800 mb-2"
        v-if="guestCompanions.length > 0"
      >
        Accompanying Guests:
      </h3>
      <ul v-if="guestCompanions.length > 0" class="mb-4">
        <li
          v-for="(companion, index) in guestCompanions"
          :key="index"
          class="text-gray-700"
        >
          👤 {{ companion.firstName }}
        </li>
      </ul>
      <p
        v-else
        class="text-gray-500 mb-4"
      >
        No accompanying guests.
      </p>

      <!-- Next Steps -->
      <h3 class="text-lg font-semibold text-gray-800 mb-2">Next Steps:</h3>
      <ul class="list-disc list-inside text-gray-700">
        <li>
          <strong>Event Location:</strong> Check your email for the event location and directions.
        </li>
        <li>
          <strong>Need Assistance?</strong> Contact the event organizer at
          <a
            :href="`mailto:${templateStore.eventOrganizerEmail}`"
            class="text-purple-600 underline"
          >
            {{ templateStore.eventOrganizerEmail }}
          </a>.
        </li>
      </ul>
    </div>
  </template>
