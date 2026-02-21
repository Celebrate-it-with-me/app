import { useSeatingStore } from '@/modules/seating/stores/useSeatingStore'
import { onMounted, ref } from 'vue'

export function useSettingsView() {
  const seatingStore = useSeatingStore()

  // Modal state
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)
  const showRemoveGuestModal = ref(false)

  const editingTable = ref({ id: null, name: '', capacity: '', assignedGuests: [] })
  const tableToDelete = ref(null)
  const guestToRemove = ref(null)

  const openEditModal = table => {
    editingTable.value = { ...table }
    showEditModal.value = true
  }

  const openDeleteModal = table => {
    tableToDelete.value = table
    showDeleteModal.value = true
  }

  const openRemoveGuestModal = guest => {
    guestToRemove.value = guest
    showRemoveGuestModal.value = true
  }

  onMounted(async () => {
    await seatingStore.loadEventTables()
  })

  return {
    showEditModal,
    showDeleteModal,
    showRemoveGuestModal,
    editingTable,
    tableToDelete,
    guestToRemove,
    openEditModal,
    openDeleteModal,
    openRemoveGuestModal
  }
}
