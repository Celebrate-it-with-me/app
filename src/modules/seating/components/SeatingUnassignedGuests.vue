<script setup>
import { useSeatingStore } from '@/modules/seating/stores/useSeatingStore'
import { storeToRefs } from 'pinia'
import CInput from '@/components/UI/form2/CInput.vue'
import { onMounted } from 'vue'

const seatingStore = useSeatingStore()
const { selectedTable, searchQuery, filterStatus, filteredUnassignedGuests } =
  storeToRefs(seatingStore)
const { assignGuestToTable, getInitials } = seatingStore

onMounted(async () => {
  await seatingStore.fetchUnassignedGuests()
})
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800"
  >
    <div
      class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 p-4"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="2.5"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Unassigned Guests</h2>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ filteredUnassignedGuests.length }} available
            </p>
          </div>
        </div>
      </div>

      <!-- Filter Pills -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="status in ['all', 'attending', 'pending', 'not-attending']"
          :key="status"
          class="px-3 py-1.5 text-xs rounded-lg font-medium transition-all"
          :class="{
            'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm':
              filterStatus === status,
            'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800':
              filterStatus !== status
          }"
          @click="filterStatus = status"
        >
          {{ status.charAt(0).toUpperCase() + status.slice(1) }}
        </button>
      </div>
    </div>

    <div class="p-4">
      <!-- Search -->
      <div class="mb-3 relative">
        <div class="absolute left-3 top-1/2 -translate-y-1/2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="text-gray-400"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
        <CInput
          id="search-guests"
          v-model="searchQuery"
          name="searchGuests"
          placeholder="Search guests..."
          :show-error="false"
          class="pl-10"
        />
      </div>

      <!-- Empty State -->
      <div v-if="filteredUnassignedGuests.length === 0" class="text-center py-8">
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
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <p class="text-gray-500 dark:text-gray-400 font-medium mb-1">No guests found</p>
        <p class="text-sm text-gray-400 dark:text-gray-500">
          {{
            searchQuery
              ? 'Try a different search term'
              : 'All guests have been assigned or no guests match your filter'
          }}
        </p>
      </div>

      <!-- Guests List -->
      <div v-else class="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        <div
          v-for="guest in filteredUnassignedGuests"
          :key="guest.id"
          class="group relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-3 hover:shadow-md transition-all"
        >
          <div class="flex items-center gap-3">
            <!-- Avatar -->
            <div
              class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm"
            >
              {{ getInitials(guest.name) }}
            </div>

            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 dark:text-white truncate text-sm">
                {{ guest.name }}
              </p>

              <!-- Status Badges -->
              <div class="flex items-center gap-2 mt-1">
                <span
                  class="px-2 py-0.5 text-xs rounded-md font-medium"
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
                  class="px-2 py-0.5 text-xs rounded-md font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  +1
                </span>
              </div>
            </div>

            <!-- Assign Button -->
            <button
              v-if="selectedTable && selectedTable.assigned_guests?.length < selectedTable.capacity"
              class="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold rounded-lg transition-all hover:-translate-y-0.5 shadow-sm"
              @click="assignGuestToTable(guest.id)"
            >
              Assign
            </button>
            <span v-else class="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
              Select table
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
