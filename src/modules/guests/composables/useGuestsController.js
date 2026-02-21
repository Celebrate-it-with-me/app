import { ref, computed, watch } from 'vue'
import { useGuestsStore } from '@/modules/guests/stores/useGuestStore'

export function useGuestsController(emit) {
  const guestStore = useGuestsStore()
  const loading = ref(false)
  const selectedGuest = ref({})
  const guestToDelete = ref(null)
  const showDetailsModal = ref(false)
  const confirmDeleteModal = ref(false)
  const showOnlyWithCompanions = ref(false)

  const hasGuests = computed(() => {
    return guestStore.guests.length > 0 || guestStore.searchValue !== ''
  })

  const totalGuests = computed(() => guestStore.guests?.length || 0)

  const totalAttendees = computed(() => {
    return (
      guestStore.guests?.reduce((sum, guest) => {
        return sum + 1 + (guest.companions?.length || 0)
      }, 0) || 0
    )
  })

  const totalPages = computed(() => {
    return Math.ceil(guestStore.totalItems / guestStore.perPage)
  })

  const loadGuests = async () => {
    loading.value = true
    if (emit) emit('loading', true)
    await guestStore.loadGuests()
    loading.value = false
    if (emit) emit('loading', false)
  }

  const handleFilterChange = async value => {
    showOnlyWithCompanions.value = value
    await loadGuests()
  }

  const viewGuest = guest => {
    selectedGuest.value = guest
    showDetailsModal.value = true
  }

  const deleteGuest = async () => {
    if (guestToDelete.value) {
      loading.value = true
      if (emit) emit('loading', true)
      const response = await guestStore.deleteGuest(guestToDelete.value.id)

      if (response.status === 200) {
        await loadGuests()
        guestToDelete.value = null
      } else {
        console.error('Failed to delete guest:', response)
      }

      confirmDeleteModal.value = false
      loading.value = false
      if (emit) emit('loading', false)
    }
  }

  const confirmDelete = guest => {
    guestToDelete.value = guest
    confirmDeleteModal.value = true
  }

  const confirmDeleteById = guestId => {
    const guest = guestStore.guests.find(g => g.id === guestId)
    if (guest) {
      confirmDelete(guest)
    }
  }

  watch(
    () => [guestStore.perPage, guestStore.searchValue],
    async () => {
      guestStore.pageSelected = 1
      await loadGuests()
    }
  )

  watch(
    () => guestStore.pageSelected,
    async (newPage, oldPage) => {
      if (newPage !== oldPage) {
        await loadGuests()
      }
    }
  )

  return {
    guestStore,
    loading,
    selectedGuest,
    guestToDelete,
    showDetailsModal,
    confirmDeleteModal,
    showOnlyWithCompanions,
    hasGuests,
    totalGuests,
    totalAttendees,
    totalPages,
    loadGuests,
    handleFilterChange,
    viewGuest,
    deleteGuest,
    confirmDelete,
    confirmDeleteById
  }
}
