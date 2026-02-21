<template>
  <div class="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6">
    <div
      v-if="hasGuests"
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
    >
      <div class="flex items-center gap-4 w-full md:w-auto">
        <CInput
          id="search-guests"
          v-model="guestStore.searchValue"
          name="searchValue"
          type="text"
          placeholder="Search by name"
          class="w-full md:w-64"
        />
      </div>
    </div>

    <div class="overflow-x-auto">
      <div v-if="loading">
        <CLoading />
      </div>
      <div v-else>
        <!-- CHANGED: Added stats at top -->
        <GuestListStats
          v-model="showOnlyWithCompanions"
          :total-guests="totalGuests"
          :total-attendees="totalAttendees"
          @filter-companions="handleFilterChange"
        />

        <!-- CHANGED: Replaced current guest rows with GuestCard -->
        <div v-if="guestStore.guests.length">
          <GuestCard
            v-for="guest in guestStore.guests"
            :key="guest.id"
            :guest="guest"
            @show-details="viewGuest"
            @delete-guest="confirmDeleteById"
          />
        </div>
        <CAlert v-else variant="info"> No guests found matching your search. </CAlert>
      </div>

      <div
        v-if="guestStore.guests.length"
        class="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-800 pt-6"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Show</span>
          <CSelect
            id="per-page"
            v-model="guestStore.perPage"
            name="perPage"
            :options="perPageOptions"
            class="w-20"
          />
          <span class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">per page</span>
        </div>
        <div>
          <CPagination
            :total-pages="totalPages"
            :current-page="guestStore.pageSelected"
            @update:current-page="guestStore.pageSelected = $event"
          />
        </div>
      </div>
      <GuestDetailsModal
        :guest="selectedGuest"
        :show="showDetailsModal"
        @close="showDetailsModal = false"
      />

      <CConfirmModal
        :model-value="confirmDeleteModal"
        title="Delete Guest"
        message="Are you sure you want to delete this guest? This action cannot be undone."
        @confirm="deleteGuest()"
        @update:model-value="confirmDeleteModal = false"
      />
    </div>
  </div>
</template>

<script setup>
import CLoading from '@/components/UI/loading/CLoading.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import GuestDetailsModal from '@/components/UI/modals/GuestDetailsModal.vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'
import CPagination from '@/components/UI/pagination/CPagination.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import GuestCard from './GuestCard.vue'
import GuestListStats from './GuestListStats.vue'
import { useGuestsController } from '@/modules/guests/composables/useGuestsController'

defineProps({
  menuRequired: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['loading'])

const {
  guestStore,
  loading,
  selectedGuest,
  showDetailsModal,
  confirmDeleteModal,
  showOnlyWithCompanions,
  hasGuests,
  totalGuests,
  totalAttendees,
  totalPages,
  handleFilterChange,
  viewGuest,
  deleteGuest,
  confirmDeleteById
} = useGuestsController(emit)

const perPageOptions = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' }
]
</script>
