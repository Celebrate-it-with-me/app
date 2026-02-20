<template>
  <div
    class="bg-white rounded-lg border p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4"
  >
    <div class="inline-flex rounded-lg border divide-x overflow-hidden">
      <button
        v-for="filter in filters"
        :key="filter.value"
        class="px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
        :class="
          activeFilter === filter.value
            ? 'bg-purple-100 text-purple-700'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        "
        @click="$emit('filter-change', filter.value)"
      >
        <span>{{ filter.label }}</span>
        <span
          class="px-1.5 py-0.5 rounded-full text-[10px]"
          :class="activeFilter === filter.value ? 'bg-purple-200' : 'bg-gray-100'"
        >
          {{ filter.count }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeFilter: {
    type: String,
    required: true
  },
  attendingCount: {
    type: Number,
    required: true
  },
  pendingCount: {
    type: Number,
    required: true
  },
  notAttendingCount: {
    type: Number,
    required: true
  },
  totalCount: {
    type: Number,
    required: true
  },
  showOnlyWithCompanions: {
    type: Boolean,
    default: false
  }
})

defineEmits(['filter-change', 'toggle-companions'])

const filters = computed(() => [
  { label: 'All', value: 'all', count: props.totalCount },
  { label: 'Attending', value: 'attending', count: props.attendingCount },
  { label: 'Pending', value: 'pending', count: props.pendingCount },
  { label: 'Not Attending', value: 'not-attending', count: props.notAttendingCount }
])
</script>
