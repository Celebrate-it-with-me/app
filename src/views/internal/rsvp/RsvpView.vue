<template>
  <div class="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="relative mb-12">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">
            RSVP Guest <span class="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">List</span>
          </h1>
          <p class="text-gray-500 font-medium">
            Monitor and manage your guest responses. Track who's attending and their specific requirements.
          </p>
        </div>
      </div>
    </div>

    <section class="rsvp-table-section">
      <div v-if="!rsvpGuests.length && !rsvpStore.statusSelected && !rsvpStore.searchValue">
          <NoRsvp />
      </div>
      <div
        v-else
        class="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6"
      >
        <!-- CHANGED: Added RsvpStats component -->
        <RsvpStats
          :attending="attendingStats"
          :pending="pendingStats"
          :not-attending="notAttendingStats"
          :totals="totalsStats"
          :response-rate="responseRate"
        />

        <div class="flex items-center justify-between mb-4">
          <div class="flex gap-4 items-center">
            <!-- CHANGED: Replace CSelect and CInput with RsvpFilters and keeping CInput for search -->
            <RsvpFilters
              :active-filter="rsvpStore.statusSelected || 'all'"
              :attending-count="attendingStats.guests"
              :pending-count="pendingStats.guests"
              :not-attending-count="notAttendingStats.guests"
              :total-count="totalsStats.guests"
              :show-only-with-companions="showOnlyWithCompanions"
              @filter-change="handleStatusFilterChange"
              @toggle-companions="handleToggleCompanions"
            />

            <CInput
              id="search-value"
              v-model="rsvpStore.searchValue"
              name="searchValue"
              type="text"
              placeholder="Search by name"
              class="w-64 mb-4"
            />
          </div>

          <div v-if="rsvpStore.rsvpGuests.length" class="flex items-center gap-4">
            <RsvpDownload
              :current-page="rsvpStore.pageSelected"
              :per-page="rsvpStore.perPage"
              :rsvp-status="rsvpStore.statusSelected"
              :search-value="rsvpStore.searchValue"
              :event-id="userStore.activeEvent"
              class="ml-4"
            />
            <CButton variant="primary" :disabled="!selectedGuests.length" @click="sendInvitations">
              Send Invitation to Selected
            </CButton>
          </div>
        </div>

        <!-- Bulk Selection Row -->
        <div v-if="rsvpStore.rsvpGuests.length" class="flex items-center gap-4 mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
          <CCheckbox v-model="selectAll" @update:model-value="toggleSelectAll" />
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select All ({{ displayedGuests.length }} guests)
          </span>
          <span v-if="selectedGuests.length > 0" class="text-sm text-purple-600 font-semibold">
            | {{ selectedGuests.length }} selected
          </span>
        </div>

        <div v-if="displayedGuests.length" class="space-y-3">
          <RsvpGuestCard
            v-for="guest in displayedGuests"
            :key="guest.id"
            :guest="guest"
            :selected="selectedGuests.includes(guest.id)"
            @toggle-select="handleToggleSelect"
            @show-details="viewGuest"
            @send-invitation="handleSendInvitation"
            @resend-invitation="handleResendInvitation"
            @rsvp-updated="handleRsvpUpdated"
          />
        </div>
        <div v-else>
          <CAlert variant="info">
            <p>
              No guests found matching your criteria.
            </p>
          </CAlert>
        </div>
        <div
          v-if="rsvpGuests.length"
          class="pagination-section mt-4 flex items-center justify-between"
        >
          <div>
            <CSelect
              id="per-page"
              v-model="rsvpStore.perPage"
              :options="perPageOptions"
              name="perPage"
            />
          </div>
          <div>
            <CPagination
              :total-pages="rsvpStore.totalPages"
              :current-page="rsvpStore.pageSelected"
              @update:current-page="rsvpStore.pageSelected = $event"
            />
          </div>
        </div>
      </div>
      <CRsvpDetailsModal
        v-model="showDetailsModal"
        :guest="selectedGuest"
        @close="showDetailsModal = false"
        @confirmation-reverted="handleConfirmationReverted"
        @send="handleOpenSendModalFromDetails"
      />
      <CSendInvitationModal
        v-model="showSendModal"
        :guests="guestsToInvite"
        :sending="isSendingInvitation"
        @send="handleSendInvitationAction"
        @close="handleCloseSendModal"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CCheckbox from '@/components/UI/form2/CCheckbox.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CRsvpDetailsModal from '@/components/UI/modals/CRsvpDetailsModal.vue'
import CSendInvitationModal from '@/components/UI/modals/CSendInvitationModal.vue'

import { useRsvpStore } from '@/stores/useRsvpStore'
import { useUserStore } from '@/stores/useUserStore'
import CPagination from '@/components/UI/pagination/CPagination.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import RsvpTotals from '@/views/internal/rsvp/components/RsvpTotals.vue'
import RsvpDownload from '@/views/internal/rsvp/components/RsvpDownload.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import NoRsvp from '@/views/internal/rsvp/components/NoRsvp.vue'

// CHANGED: Import new UI components
import RsvpStats from './components/RsvpStats.vue'
import RsvpFilters from './components/RsvpFilters.vue'
import RsvpGuestCard from './components/RsvpGuestCard.vue'

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

const userStore = useUserStore()
const rsvpStore = useRsvpStore()

const filterOptions = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'attending', label: 'Confirmed' },
  { value: 'not-attending', label: 'Declined' }
]

const rsvpGuests = computed(() => {
  return rsvpStore.rsvpGuests ?? []
})

// CHANGED: Extract stats objects directly (not just numbers)
const attendingStats = computed(() => {
  return rsvpStore.stats?.data?.attending || { guests: 0, companions: 0, total: 0 };
});

const pendingStats = computed(() => {
  return rsvpStore.stats?.data?.pending || { guests: 0, companions: 0, total: 0 };
});

const notAttendingStats = computed(() => {
  return rsvpStore.stats?.data?.not_attending || { guests: 0, companions: 0, total: 0 };
});

const totalsStats = computed(() => {
  return rsvpStore.stats?.data?.totals || { guests: 0, companions: 0, people: 0, responded: 0 };
});

const responseRate = computed(() => {
  return rsvpStore.stats?.data?.response_rate || 0;
});

// CHANGED: Added filter state
const showOnlyWithCompanions = ref(false);

const handleRsvpUpdated = async () => {
  await rsvpStore.loadGuests()
}

const handleStatusFilterChange = (status) => {
  rsvpStore.statusSelected = status === 'all' ? '' : status;
  // This will trigger the watcher on rsvpStore.statusSelected
};

const handleToggleCompanions = (value) => {
  showOnlyWithCompanions.value = value;
  // If actual filtering by companions is needed in backend, it should be implemented in rsvpStore
  // For now, we follow the instruction to keep data flow as is, but we might need a computed for UI filtering
};

// Filtered guests based on "Show only with companions" toggle
const displayedGuests = computed(() => {
  let filtered = rsvpGuests.value;
  if (showOnlyWithCompanions.value) {
    filtered = filtered.filter(g => (g.companions_count || 0) > 0);
  }
  return filtered;
});

const toggleSelectAll = checked => {
  selectAll.value = checked
  selectedGuests.value = checked ? displayedGuests.value.map(g => g.id) : []
}

const handleToggleSelect = (guestId) => {
  const index = selectedGuests.value.indexOf(guestId);
  if (index > -1) {
    selectedGuests.value.splice(index, 1);
  } else {
    selectedGuests.value.push(guestId);
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
const handleSendInvitation = (guestId) => {
  const guest = rsvpGuests.value.find(g => g.id === guestId)
  if (guest) {
    guestsToInvite.value = [guest]
    showSendModal.value = true
  }
}

const handleResendInvitation = (guestId) => {
  const guest = rsvpGuests.value.find(g => g.id === guestId)
  if (guest) {
    guestsToInvite.value = [guest]
    showSendModal.value = true
  }
}

const handleOpenSendModalFromDetails = (guestData) => {
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


onMounted(() => {
  rsvpStore.fetchStats()
})
</script>
