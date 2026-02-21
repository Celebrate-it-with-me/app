import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import { useRsvpStore } from '@/stores/useRsvpStore'

export function useRsvpDownload(props) {
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
        currentPage: props.currentPage
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

  return {
    showDropdown,
    toggleDropdown,
    exportToPDF,
    exportToExcel
  }
}
