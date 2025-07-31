<template>
  <nav class="inline-flex items-center gap-1 text-sm font-medium">
    <button
      :disabled="currentPage === 1"
      class="px-3 py-1 rounded-md border bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-100 disabled:opacity-50"
      @click="$emit('update:currentPage', currentPage - 1)"
    >
      Prev
    </button>

    <button
      v-for="page in pages"
      :key="page"
      :class="[
        'px-3 py-1 rounded-md border',
        page === currentPage
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600'
      ]"
      @click="$emit('update:currentPage', page)"
    >
      {{ page }}
    </button>

    <button
      :disabled="currentPage === totalPages"
      class="px-3 py-1 rounded-md border bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-100 disabled:opacity-50"
      @click="$emit('update:currentPage', currentPage + 1)"
    >
      Next
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

const pages = computed(() => {
  return Array.from({ length: props.totalPages }, (_, i) => i + 1)
})
</script>

<style scoped>
/* Pagination-specific styles if needed */
</style>
