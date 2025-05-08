<script setup>
import { computed, ref } from 'vue'
import { LucideDownload } from 'lucide-vue-next'
import CButton from '@/components/UI/buttons/CButton.vue'
import { useUserStore } from '@/stores/useUserStore'
import { useRsvpStore } from '@/stores/useRsvpStore'

const props = defineProps({
  status: {
    type: String,
    default: '',
  },
  searchValue: {
    type: String,
    default: '',
  },
  perPage: {
    type: Number,
    default: 10,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
})

const exportType = ref('')
const showDropdown = ref(false)
const userStore = useUserStore()
const rsvpStore = useRsvpStore()

const activeEventId = computed(() => {
  return userStore.activeEvent ?? null
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const exportToPDF = async () => {
  exportType.value = 'pdf'
  await requestExport()
}

const exportToExcel = async () => {
  exportType.value = 'excel'
  await requestExport()
}

const requestExport = async () => {
  try {
    const response = await rsvpStore.downloadFile({
      eventId: activeEventId.value,
      status: props.status,
      searchValue: props.searchValue,
      exportType: exportType.value,
      perPage: props.perPage,
      currentPage: props.currentPage,
    })

    if (response.status === 200) {
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rsvp-${exportType.value}.${exportType.value === 'pdf' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } else {
      throw new Error('Failed to export data')
    }

  } catch (error) {
    console.error('Error exporting data:', error)
  } finally {
    showDropdown.value = false
  }
}

</script>

<template>
  <div class="relative inline-block text-left">
    <CButton variant="outline" @click="toggleDropdown">
      <LucideDownload class="w-4 h-4 mr-2" /> Export
    </CButton>

    <div
      v-if="showDropdown"
      class="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md
            bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5
            focus:outline-none"
    >
      <div class="py-1">
        <button
          @click="exportToPDF"
          class="block w-full px-4 py-2 text-sm text-left text-gray-700
                dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          PDF
        </button>
        <button
          @click="exportToExcel"
          class="block w-full px-4 py-2 text-sm text-left text-gray-700
                dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Excel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
