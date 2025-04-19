<template>
  <header class="w-full h-16 flex items-center justify-between px-6 border-b
                 border-gray-200 dark:border-gray-700
                 bg-gradient-to-r from-pink-50 to-white dark:from-gray-800 dark:to-gray-900"
  >
    <div class="flex items-center gap-3">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Evento:</label>
      <select
        v-model="selectedEventId"
        class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm px-3 py-1.5 rounded-md text-gray-900 dark:text-white focus:ring-primary focus:outline-none"
      >
        <option v-for="event in events" :key="event.id" :value="event.id">
          {{ event.name }}
        </option>
      </select>
    </div>

    <div class="flex items-center gap-4">
      <span class="text-sm text-gray-600 dark:text-gray-300">{{ userName }}</span>
      <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold uppercase">
        {{ initials }}
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'

const events = ref([
  { id: 1, name: 'Quinceañera de Angely' },
  { id: 2, name: 'Boda de Henry & Carmen' },
  { id: 3, name: 'Cumpleaños de Amanda' },
])

const selectedEventId = ref(events.value[0].id)
const userName = 'Henry Carmenate'

const initials = computed(() =>
  userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
)
</script>
