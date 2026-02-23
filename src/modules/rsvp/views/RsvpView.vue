<template>
  <div class="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="relative mb-12">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">
            RSVP Guest
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
              >List 123</span
            >
          </h1>
          <p class="text-gray-500 font-medium">
            Monitor and manage your guest responses. Track who's attending and their specific
            requirements.
          </p>
        </div>
      </div>
    </div>

    <section class="rsvp-table-section">
      <div v-if="!rsvpGuests.length && !statusSelected && !searchValue">
        <NoRsvp />
      </div>
      <div v-else class="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6">
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
              :active-filter="statusSelected || 'all'"
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
              :model-value="searchValue"
              name="searchValue"
              type="text"
              placeholder="Search by name"
              class="w-64 mb-4"
              :disabled="isLoading"
              @update:model-value="handleSearchChange"
            />
          </div>

          <div v-if="rsvpGuests.length" class="flex items-center gap-4">
            <RsvpDownload
              :current-page="pageSelected"
              :per-page="perPage"
              :rsvp-status="statusSelected"
              :search-value="searchValue"
              :event-id="activeEvent"
              class="ml-4"
            />
            <CButton variant="primary" :disabled="!selectedGuests.length" @click="sendInvitations">
              Send Invitation to Selected
            </CButton>
          </div>
        </div>

        <!-- Bulk Selection Row -->
        <div
          v-if="rsvpGuests.length"
          class="flex items-center gap-4 mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700"
        >
          <CCheckbox v-model="selectAll" @update:model-value="toggleSelectAll" />
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select All ({{ displayedGuests.length }} guests)
          </span>
          <span v-if="selectedGuests.length > 0" class="text-sm text-purple-600 font-semibold">
            | {{ selectedGuests.length }} selected
          </span>
        </div>

        <div v-if="isLoading" class="flex justify-center py-8">
          <CLoading :size="8" />
        </div>
        <div v-else-if="displayedGuests.length" class="space-y-3">
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
            <p>No guests found matching your criteria.</p>
          </CAlert>
        </div>
        <div
          v-if="rsvpGuests.length"
          class="pagination-section mt-4 flex items-center justify-between"
        >
          <div>
            <CSelect
              id="per-page"
              :model-value="perPage"
              :options="perPageOptions"
              name="perPage"
              description=""
              label=""
              :disabled="isLoading"
              @update:model-value="handlePerPageChange"
            />
          </div>
          <div>
            <CPagination
              :total-pages="totalPages"
              :current-page="pageSelected"
              :disabled="isLoading"
              @update:current-page="pageSelected = $event"
              @update:current-page="handlePageChange"
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
import CButton from '@/components/UI/buttons/CButton.vue'
import CCheckbox from '@/components/UI/form2/CCheckbox.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CRsvpDetailsModal from '@/components/UI/modals/CRsvpDetailsModal.vue'
import CSendInvitationModal from '@/components/UI/modals/CSendInvitationModal.vue'
import CPagination from '@/components/UI/pagination/CPagination.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import CLoading from '@/components/UI/loading/CLoading.vue'

// CHANGED: Import new UI components
import RsvpStats from '@/modules/rsvp/components/RsvpStats.vue'
import RsvpFilters from '@/modules/rsvp/components/RsvpFilters.vue'
import RsvpGuestCard from '@/modules/rsvp/components/RsvpGuestCard.vue'
import NoRsvp from '@/modules/rsvp/components/NoRsvp.vue'
import RsvpDownload from '@/modules/rsvp/components/RsvpDownload.vue'
import { useRsvpView } from '@/modules/rsvp/composables/useRsvpView'

const {
  perPageOptions,
  selectedGuests,
  selectAll,
  selectedGuest,
  showDetailsModal,

  statusSelected,
  searchValue,
  pageSelected,
  perPage,
  totalPages,

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
  isLoading,

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
} = useRsvpView()
</script>
