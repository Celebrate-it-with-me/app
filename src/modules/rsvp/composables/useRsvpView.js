import { computed, onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import { useRsvpStore } from '@/modules/rsvp/stores/useRsvpStore'

export function useRsvpView() {
  const perPageOptions = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' }
  ]

  const selectedGuests = ref([])
  const selectAll = ref(false)
  const selectedGuest = ref(null)
  const showDetailsModal = ref(false)

  const showSendModal = ref(false)
  const guestsToInvite = ref([])
  const isSendingInvitation = ref(false)
  // CHANGED: Added filter state
  const showOnlyWithCompanions = ref(false)

  const userStore = useUserStore()
  const rsvpStore = useRsvpStore()

  const rsvpGuests = computed(() => {
    return rsvpStore.rsvpGuests ?? []
  })

  // CHANGED: Extract stats objects directly (not just numbers)
  const attendingStats = computed(() => {
    return rsvpStore.stats?.data?.attending || { guests: 0, companions: 0, total: 0 }
  })

  const pendingStats = computed(() => {
    return rsvpStore.stats?.data?.pending || { guests: 0, companions: 0, total: 0 }
  })

  const notAttendingStats = computed(() => {
    return rsvpStore.stats?.data?.not_attending || { guests: 0, companions: 0, total: 0 }
  })

  const totalsStats = computed(() => {
    return rsvpStore.stats?.data?.totals || { guests: 0, companions: 0, people: 0, responded: 0 }
  })

  const responseRate = computed(() => {
    return rsvpStore.stats?.data?.response_rate || 0
  })

  const activeEvent = computed(() => {
    return userStore.activeEvent || 0
  })

  const statusSelected = computed(() => {
    return rsvpStore.statusSelected || ''
  })

  const searchValue = computed(() => {
    return rsvpStore.searchValue || ''
  })

  const pageSelected = computed(() => {
    return rsvpStore.pageSelected || 1
  })

  const perPage = computed(() => {
    return rsvpStore.perPage || 10
  })

  const totalPages = computed(() => {
    return rsvpStore.totalPages || 1
  })

  // Filtered guests based on "Show only with companions" toggle
  const displayedGuests = computed(() => {
    let filtered = rsvpGuests.value
    if (showOnlyWithCompanions.value) {
      filtered = filtered.filter(g => (g.companions_count || 0) > 0)
    }
    return filtered
  })

  const handleRsvpUpdated = async () => {
    await rsvpStore.loadGuests()
  }

  const handleStatusFilterChange = status => {
    rsvpStore.statusSelected = status === 'all' ? '' : status
    // This will trigger the watcher on rsvpStore.statusSelected
  }

  const handleToggleCompanions = value => {
    showOnlyWithCompanions.value = value
    // If actual filtering by companions is needed in backend, it should be implemented in rsvpStore
    // For now, we follow the instruction to keep data flow as is, but we might need a computed for UI filtering
  }

  const toggleSelectAll = checked => {
    selectAll.value = checked
    selectedGuests.value = checked ? displayedGuests.value.map(g => g.id) : []
  }

  const handleToggleSelect = guestId => {
    const index = selectedGuests.value.indexOf(guestId)
    if (index > -1) {
      selectedGuests.value.splice(index, 1)
    } else {
      selectedGuests.value.push(guestId)
    }
  }

  const viewGuest = guest => {
    selectedGuest.value = guest
    showDetailsModal.value = true
  }

  const sendInvitations = () => {
    guestsToInvite.value = rsvpGuests.value.filter(g => selectedGuests.value.includes(g.id))
    showSendModal.value = true
  }

  // CHANGED: Updated handleSendInvitation and handleResendInvitation to open modal
  const handleSendInvitation = guestId => {
    const guest = rsvpGuests.value.find(g => g.id === guestId)
    if (guest) {
      guestsToInvite.value = [guest]
      showSendModal.value = true
    }
  }

  const handleResendInvitation = guestId => {
    const guest = rsvpGuests.value.find(g => g.id === guestId)
    if (guest) {
      guestsToInvite.value = [guest]
      showSendModal.value = true
    }
  }

  const handleOpenSendModalFromDetails = guestData => {
    guestsToInvite.value = [guestData]
    showSendModal.value = true
  }

  const handleSendInvitationAction = async ({ guests, channel, isResend }) => {
    try {
      isSendingInvitation.value = true

      for (const guest of guests) {
        if (isResend) {
          await rsvpStore.resendInvitation({ id: guest.id, channel })
        } else {
          await rsvpStore.sendInvitation({ id: guest.id, channel })
        }
      }

      showSendModal.value = false
      await rsvpStore.loadGuests()
    } catch (error) {
      console.error('Failed to send invitations:', error)
      alert('Failed to send invitations. Please try again.')
    } finally {
      isSendingInvitation.value = false
    }
  }

  const handleCloseSendModal = () => {
    showSendModal.value = false
    guestsToInvite.value = []
  }

  const reloadGuests = async () => {
    await rsvpStore.loadGuests()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleConfirmationReverted = async () => {
    await rsvpStore.loadGuests()
    showDetailsModal.value = false
  }

  watch(
    () => rsvpStore.perPage,
    async () => {
      await reloadGuests()
    }
  )

  watch(
    () => rsvpStore.pageSelected,
    async () => {
      await reloadGuests()
    }
  )

  watch(
    () => rsvpStore.searchValue,
    async () => {
      await reloadGuests()
    }
  )

  watch(
    () => rsvpStore.statusSelected,
    async () => {
      await reloadGuests()
    }
  )

  onMounted(async () => {
    await rsvpStore.fetchStats()
  })

  const handlePageChange = newPage => {
    rsvpStore.pageSelected = newPage
  }

  const handlePerPageChange = newPerPage => {
    rsvpStore.perPage = newPerPage
    rsvpStore.pageSelected = 1 // Reset to first page when changing per page
  }

  const handleSearchChange = newSearch => {
    rsvpStore.searchValue = newSearch
    rsvpStore.pageSelected = 1 // Reset to first page when searching
  }



  return {
    perPageOptions,
    selectedGuests,
    selectAll,
    selectedGuest,
    showDetailsModal,

    showSendModal,
    guestsToInvite,
    isSendingInvitation,
    // CHANGED: Added filter state
    showOnlyWithCompanions,

    rsvpGuests,
    // CHANGED: Extract stats objects directly (not just numbers)
    attendingStats,
    pendingStats,
    notAttendingStats,
    totalsStats,
    responseRate,
    activeEvent,

    statusSelected,
    searchValue,
    pageSelected,
    perPage,
    totalPages,

    // Filtered guests based on "Show only with companions" toggle
    displayedGuests,

    handleRsvpUpdated,
    handleStatusFilterChange,
    handleToggleCompanions,
    toggleSelectAll,
    handleToggleSelect,
    viewGuest,
    sendInvitations,

    // CHANGED: Updated handleSendInvitation and handleResendInvitation to open modal
    handleSendInvitation,
    handleResendInvitation,
    handleOpenSendModalFromDetails,
    handleSendInvitationAction,
    handleCloseSendModal,
    reloadGuests,
    handleConfirmationReverted,
    handlePerPageChange,
    handlePageChange,
    handleSearchChange
  }
}
