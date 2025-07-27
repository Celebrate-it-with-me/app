<script setup>
import { computed, ref, watch } from 'vue'
import { ChevronDoubleLeftIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDoubleRightIcon } from '@heroicons/vue/16/solid'
import CButton from '@/components/UI/buttons/CButton.vue'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  totalItems: {
    type: Number,
    required: true
  },
  modelValue: {
    type: Number,
    default: 1
  },
  perPageOptions: {
    type: Array,
    required: false,
    default: () => [4, 10, 20, 50, 100]
  }
})

const perPage = ref(props.perPageOptions[0])
const currentPage = ref(props.modelValue)

const totalPages = computed(() => {
  return Math.ceil(props.totalItems / perPage.value)
})

watch(() => props.modelValue, (newValue) => {
  currentPage.value = newValue
})

watch(currentPage, (newValue) => {
  emit('update:modelValue', newValue)
})

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) {
    return
  }
  currentPage.value = page
}

// Smart pagination logic: << < 1 2 ... n-1 n > >>
const paginationItems = computed(() => {
  const items = []
  const current = currentPage.value
  const total = totalPages.value

  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      items.push({ type: 'page', value: i, active: i === current })
    }
    return items
  }

  // Always show first page
  items.push({ type: 'page', value: 1, active: current === 1 })

  // Show second page if not too close to current
  if (current > 4) {
    items.push({ type: 'page', value: 2, active: false })
    items.push({ type: 'ellipsis', value: '...' })
  } else if (current > 3) {
    items.push({ type: 'ellipsis', value: '...' })
  }

  // Show current page and neighbors
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    if (i !== 1 && i !== total) {
      items.push({ type: 'page', value: i, active: i === current })
    }
  }

  // Show ellipsis and last pages
  if (current < total - 3) {
    items.push({ type: 'ellipsis', value: '...' })
    items.push({ type: 'page', value: total - 1, active: false })
  } else if (current < total - 2) {
    items.push({ type: 'ellipsis', value: '...' })
  }

  // Always show last page
  if (total > 1) {
    items.push({ type: 'page', value: total, active: current === total })
  }

  return items
})

</script>

<template>
  <div class="modern-pagination-container max-h-[50%] w-full flex items-center justify-center gap-1 sm:gap-2 mt-4 px-2">
    <!-- First page button -->
    <CButton
      v-if="totalPages > 1"
      size="sm"
      variant="ghost"
      :disabled="currentPage === 1"
      @click="changePage(1)"
      class="hidden sm:flex pagination-nav-btn"
      aria-label="First page"
    >
      <ChevronDoubleLeftIcon class="w-4 h-4" />
    </CButton>

    <!-- Previous page button -->
    <CButton
      v-if="totalPages > 1"
      size="sm"
      variant="ghost"
      :disabled="currentPage === 1"
      @click="changePage(currentPage - 1)"
      class="pagination-nav-btn"
      aria-label="Previous page"
    >
      <ChevronLeftIcon class="w-4 h-4" />
    </CButton>

    <!-- Page numbers and ellipsis -->
    <div class="flex items-center gap-1 sm:gap-2">
      <template v-for="item in paginationItems" :key="`${item.type}-${item.value}`">
        <!-- Page number button -->
        <CButton
          v-if="item.type === 'page'"
          size="sm"
          :variant="item.active ? 'primary' : 'ghost'"
          @click="changePage(item.value)"
          class="pagination-page-btn"
          :class="{ 'pagination-active': item.active }"
          :aria-label="`Page ${item.value}`"
          :aria-current="item.active ? 'page' : undefined"
        >
          {{ item.value }}
        </CButton>

        <!-- Ellipsis -->
        <span
          v-else-if="item.type === 'ellipsis'"
          class="pagination-ellipsis text-gray-500 px-2 py-1 text-sm font-medium"
          aria-hidden="true"
        >
          {{ item.value }}
        </span>
      </template>
    </div>

    <!-- Next page button -->
    <CButton
      v-if="totalPages > 1"
      size="sm"
      variant="ghost"
      :disabled="currentPage === totalPages"
      @click="changePage(currentPage + 1)"
      class="pagination-nav-btn"
      aria-label="Next page"
    >
      <ChevronRightIcon class="w-4 h-4" />
    </CButton>

    <!-- Last page button -->
    <CButton
      v-if="totalPages > 1"
      size="sm"
      variant="ghost"
      :disabled="currentPage === totalPages"
      @click="changePage(totalPages)"
      class="hidden sm:flex pagination-nav-btn"
      aria-label="Last page"
    >
      <ChevronDoubleRightIcon class="w-4 h-4" />
    </CButton>
  </div>
</template>

<style scoped>
/* Modern pagination container */
.modern-pagination-container {
  @apply select-none;
}

/* Navigation buttons styling */
.pagination-nav-btn {
  @apply transition-all duration-200 ease-in-out;
  min-width: 2rem;
  min-height: 2rem;
}

.pagination-nav-btn:hover:not(:disabled) {
  @apply transform scale-105 shadow-md;
}

.pagination-nav-btn:disabled {
  @apply opacity-40 cursor-not-allowed;
}

/* Page number buttons */
.pagination-page-btn {
  @apply transition-all duration-200 ease-in-out font-medium;
  min-width: 2.5rem !important;
  min-height: 2.5rem !important;
  padding: 0.5rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
}

.pagination-page-btn:hover:not(.pagination-active) {
  @apply transform scale-105 shadow-md bg-gray-100 text-gray-700;
}

/* Active page styling with lavender line indicator */
.pagination-active {
  background-color: transparent !important;
  color: #6B46C1 !important;
  position: relative !important;
}

.pagination-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 3px;
  background-color: #B19CD9;
  border-radius: 2px;
  transition: all 0.2s ease-in-out;
}

.pagination-active:hover {
  color: #553C9A !important;
  @apply transform scale-105;
}

.pagination-active:hover::after {
  background-color: #A78BDB;
  width: 90%;
}

/* Ellipsis styling */
.pagination-ellipsis {
  @apply transition-colors duration-200;
  min-width: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .pagination-page-btn {
    min-width: 2rem !important;
    min-height: 2rem !important;
    font-size: 0.875rem;
    padding: 0.375rem !important;
  }

  .pagination-active::after {
    height: 2px;
    bottom: -1px;
  }

  .pagination-nav-btn {
    min-width: 1.75rem;
    min-height: 1.75rem;
  }

  .pagination-ellipsis {
    min-width: 1.5rem;
    font-size: 0.75rem;
  }
}

/* Smooth focus states for accessibility */
.pagination-nav-btn:focus,
.pagination-page-btn:focus {
  @apply outline-none ring-2 ring-offset-2;
  ring-color: #B19CD9;
}

/* Enhanced hover effects for better UX */
.pagination-nav-btn:active:not(:disabled),
.pagination-page-btn:active {
  @apply transform scale-95;
}

/* Ensure proper spacing and alignment */
.modern-pagination-container > * {
  @apply flex-shrink-0;
}
</style>
