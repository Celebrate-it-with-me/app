<script setup>
import { LucideDownload } from 'lucide-vue-next'
import CButton from '@/components/UI/buttons/CButton.vue'
import { useRsvpDownload } from '../composables/useRsvpDownload'

const props = defineProps({
  status: {
    type: String,
    default: ''
  },
  searchValue: {
    type: String,
    default: ''
  },
  perPage: {
    type: Number,
    default: 10
  },
  currentPage: {
    type: Number,
    default: 1
  }
})

const { showDropdown, toggleDropdown, exportToPDF, exportToExcel } = useRsvpDownload(props)
</script>

<template>
  <div class="relative inline-block text-left">
    <CButton variant="outline" @click="toggleDropdown">
      <LucideDownload class="w-4 h-4 mr-2" /> Export
    </CButton>

    <div
      v-if="showDropdown"
      class="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      <div class="py-1">
        <button
          class="block w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="exportToPDF"
        >
          PDF
        </button>
        <button
          class="block w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="exportToExcel"
        >
          Excel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
