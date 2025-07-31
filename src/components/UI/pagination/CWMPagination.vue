<script setup>
import { computed, ref, watch } from 'vue'

const emit = defineEmits(['update:modelValue', 'update:perPage'])

const props = defineProps({
  totalItems: {
    type: Number,
    required: true
  },
  modelValue: {
    type: Number,
    default: 1 // Default to page 1
  },
  perPageOptions: {
    type: Array,
    required: false,
    default: () => [5, 10, 20, 50, 100]
  }
})

const perPage = ref(props.perPageOptions[0])
const currentPage = ref(props.modelValue)

const totalPages = computed(() => {
  if (perPage.value === 'All') {
    return 1
  }

  return Math.ceil(props.totalItems / perPage.value)
})

watch(
  () => props.modelValue,
  newValue => {
    currentPage.value = newValue
  }
)

watch(currentPage, newValue => {
  emit('update:modelValue', newValue)
})

watch(perPage, newValue => {
  emit('update:perPage', newValue)
  currentPage.value = 1
})

const changePage = page => {
  if (page < 1 || page > totalPages.value) {
    return // Prevent invalid page navigation
  }
  currentPage.value = page
}
</script>

<template>
  <nav
    class="flex items-center flex-column flex-wrap md:flex-row justify-between gap-x-4 pt-4"
    aria-label="Table navigation"
  >
    <!-- Pagination Controls -->
    <div class="flex items-center">
      <label for="perPage" class="sr-only">Items per page</label>
      <select
        id="perPage"
        v-model="perPage"
        class="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
      >
        <option v-for="option in props.perPageOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
    </div>
    <div class="flex items-center gap-4">
      <!-- Info about pagination -->
      <div class="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
        <span>
          Showing
          <span class="font-semibold text-gray-900 dark:text-white">
            {{ perPage === 'All' ? 1 : (currentPage - 1) * perPage + 1 }}-{{
              perPage === 'All'
                ? props.totalItems
                : Math.min(currentPage * perPage, props.totalItems)
            }}
          </span>
          of
          <span class="font-semibold text-gray-900 dark:text-white">{{ props.totalItems }}</span>
        </span>
      </div>

      <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
        <!-- Previous Button -->
        <li>
          <button
            :disabled="currentPage === 1"
            class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            @click="changePage(currentPage - 1)"
          >
            Previous
          </button>
        </li>

        <!-- Page Numbers -->
        <li v-for="page in totalPages" :key="page">
          <button
            :class="
              currentPage === page
                ? 'flex items-center justify-center px-3 h-8 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
                : 'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
            "
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </li>

        <!-- Next Button -->
        <li>
          <button
            :disabled="currentPage === totalPages"
            class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            @click="changePage(currentPage + 1)"
          >
            Next
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped></style>
