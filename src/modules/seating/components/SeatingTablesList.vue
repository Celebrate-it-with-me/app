<script setup>
import { useSeatingStore } from '@/modules/seating/stores/useSeatingStore'
import { storeToRefs } from 'pinia'
import SeatingTableLine from '@/modules/seating/components/SeatingTableLine.vue'

const emit = defineEmits(['edit', 'delete'])

const seatingStore = useSeatingStore()
const { tables, selectedTable } = storeToRefs(seatingStore)
const { selectTable } = seatingStore
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800"
  >
    <div
      class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 p-4"
    >
      <div class="flex items-center justify-between">
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
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Tables</h2>
        </div>
        <span
          class="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm font-semibold rounded-full"
        >
          {{ tables.length }}
        </span>
      </div>
    </div>

    <div class="p-4">
      <!-- Empty State -->
      <div v-if="tables.length === 0" class="text-center py-8">
        <div
          class="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl flex items-center justify-center"
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
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
        </div>
        <p class="text-gray-500 dark:text-gray-400 font-medium mb-1">No tables created yet</p>
        <p class="text-sm text-gray-400 dark:text-gray-500">
          Create a table to start assigning guests
        </p>
      </div>

      <!-- Tables Grid - 5 columns -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2">
        <SeatingTableLine
          v-for="table in tables"
          :key="table.id"
          :table="table"
          :is-selected="selectedTable?.id === table.id"
          @select-table="selectTable(table)"
          @edit-table="emit('edit', table)"
          @delete-table="emit('delete', table)"
        />
      </div>
    </div>
  </div>
</template>
