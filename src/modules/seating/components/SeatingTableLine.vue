<script setup>
import { computed } from 'vue'
import { useSeatingStore } from '@/modules/seating/stores/useSeatingStore'

const emit = defineEmits(['selectTable', 'editTable', 'deleteTable'])

const props = defineProps({
  table: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const selectCurrentTable = () => {
  emit('selectTable', props.table)
}

const assignedSeats = computed(() => {
  return props.table.capacity - props.table.available_seats
})
const seatingStore = useSeatingStore()

const { getProgressColor } = seatingStore
</script>

<template>
  <div
    class="group relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-3 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg border-2"
    :class="{
      'border-purple-500 shadow-lg shadow-purple-500/20': isSelected,
      'border-transparent hover:shadow-md': !isSelected
    }"
    @click="selectCurrentTable()"
  >
    <div class="flex items-start justify-between mb-2">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm"
        >
          <span class="text-lg font-bold text-purple-600 dark:text-purple-400">
            {{ table.id }}
          </span>
        </div>
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ table.name }}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">Table #{{ table.id }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div
        class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        @click.stop
      >
        <button
          class="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          title="Edit table"
          @click="emit('editTable', table)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="text-blue-500"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button
          class="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Delete table"
          @click="emit('deleteTable', table)"
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
            <polyline points="3 6 5 6 21 6"></polyline>
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Capacity Info -->
    <div class="space-y-2">
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-600 dark:text-gray-400">Capacity</span>
        <span class="font-semibold text-gray-900 dark:text-white">
          {{ assignedSeats }}/{{ table.capacity }}
        </span>
      </div>

      <!-- Progress Bar -->
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          :class="getProgressColor(table)"
          :style="{ width: `${(assignedSeats / table.capacity) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
