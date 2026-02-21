<script setup>
import { useSeatingStore } from '@/modules/seating/stores/useSeatingStore'
import { computed } from 'vue'

const emit = defineEmits(['remove-guest'])

const seatingStore = useSeatingStore()

const { getInitials } = seatingStore

const selectedTable = computed(() => seatingStore.selectedTable)

const assignedSeats = computed(() => {
  return selectedTable.value.capacity - selectedTable.value.available_seats
})
</script>

<template>
  <div
    v-if="selectedTable"
    class="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800"
  >
    <div
      class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 p-4"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25"
          >
            <span class="text-xl font-bold text-white">
              {{ selectedTable.id }}
            </span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ selectedTable.name }}
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">Table Details</p>
          </div>
        </div>
        <div class="text-right">
          <div class="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <span class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ assignedSeats }}
            </span>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              /{{ selectedTable.capacity }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4">
      <!-- Empty State -->
      <div v-if="assignedSeats === 0" class="text-center py-8">
        <div
          class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl flex items-center justify-center"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="text-purple-400"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <p class="text-gray-500 dark:text-gray-400 font-medium mb-1">No guests assigned</p>
        <p class="text-sm text-gray-400 dark:text-gray-500">
          Assign guests from the unassigned list
        </p>
      </div>

      <!-- Assigned Guests -->
      <div v-else class="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        <div
          v-for="guest in selectedTable.assigned_guests"
          :key="guest.id"
          class="group relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-3 hover:shadow-md transition-all"
        >
          <div class="flex items-start gap-3">
            <!-- Avatar -->
            <div
              class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm"
            >
              {{ getInitials(guest.name) }}
            </div>

            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900 dark:text-white truncate">
                {{ guest.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ guest.seatNumber }}
              </p>

              <!-- Status Badges -->
              <div class="flex items-center gap-2 mt-2">
                <span
                  class="px-2 py-1 text-xs rounded-lg font-medium"
                  :class="{
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300':
                      guest.rsvpStatus === 'attending',
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300':
                      guest.rsvpStatus === 'pending',
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300':
                      guest.rsvpStatus === 'not-attending'
                  }"
                >
                  {{ guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1) }}
                </span>
                <span
                  v-if="guest.isCompanion"
                  class="px-2 py-1 text-xs rounded-lg font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  Companion
                </span>
              </div>
            </div>

            <!-- Remove Button -->
            <button
              class="flex-shrink-0 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              title="Remove guest"
              @click="emit('remove-guest', guest)"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="text-red-500"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- No Table Selected State -->
  <div
    v-else
    class="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 h-full min-h-[400px] flex items-center justify-center"
  >
    <div class="text-center p-6">
      <div
        class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl flex items-center justify-center"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="text-purple-400"
        >
          <path d="M9 2v20"></path>
          <path d="M3 8h18"></path>
          <path d="M3 16h18"></path>
          <path d="M15 2v20"></path>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Table Selected</h3>
      <p class="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
        Select a table from the list or create a new one to view and manage its details
      </p>
    </div>
  </div>
</template>
