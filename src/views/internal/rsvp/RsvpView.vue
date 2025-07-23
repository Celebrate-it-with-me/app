<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <CHeading :level="2" weight="semibold">RSVP Guest List</CHeading>
    </div>

    <div
      v-if="!rsvpGuests.length"
    >
      <CAlert
        variant="info"
      >
        <p>No guests found for this event. Please check the event details or add guests
        in the guests section.</p>
      </CAlert>
    </div>
    <section
      v-else
      class="rsvp-table-section"
    >
      <div class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex gap-4 items-center justify-between">
            <CSelect
              id="filterStatus"
              name="filterStatus"
              :options="filterOptions"
              v-model="rsvpStatus"
            />

            <CInput
              id="search-value"
              name="searchValue"
              type="text"
              placeholder="Search by name"
              class="w-64"
              v-model="searchValue"
            />
          </div>

          <div
            class="flex items-center gap-4"
          >
            <RsvpDownload
              :current-page="currentPage"
              :per-page="perPage"
              :rsvp-status="rsvpStatus"
              :search-value="searchValue"
              :event-id="userStore.activeEvent"
              class="ml-4"
            />
            <CButton variant="primary" @click="sendInvitations" :disabled="!selectedGuests.length">
              Send Invitation to Selected
            </CButton>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-3 py-3 text-left w-6">
                <CCheckbox v-model="selectAll" @update:modelValue="toggleSelectAll" />
              </th>
              <th
                class="px-3 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Name
              </th>
              <th
                class="px-3 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Status
              </th>
              <th
                class="px-3 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Status Date
              </th>
              <th
                class="px-3 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Actions
              </th>
            </tr>
            </thead>

            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <template v-for="guest in rsvpGuests" :key="guest.id">
                <RsvpGuestTr
                  :selected-guests="selectedGuests"
                  :guest="guest"
                  @view-guest="viewGuest"
                />
              </template>
            </tbody>
          </table>
        </div>
        <div class="pagination-section mt-4 flex items-center justify-between">
          <div>
            <CSelect
              id="per-page"
              :options="perPageOptions"
              name="perPage"
              v-model="perPage"
            />
          </div>
          <div>
            <CPagination
              :total-pages="totalPages"
              :current-page="currentPage"
              @update:currentPage="currentPage = $event"
            />
          </div>
        </div>

        <RsvpTotals />
      </div>
      <CRsvpDetailsModal
        v-model="showDetailsModal"
        :guest="selectedGuest"
        @close="showDetailsModal = false"
        @confirmation-reverted="handleConfirmationReverted"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CCheckbox from '@/components/UI/form2/CCheckbox.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CRsvpDetailsModal from '@/components/UI/modals/CRsvpDetailsModal.vue'

import { useRsvpStore } from '@/stores/useRsvpStore'
import { useUserStore } from '@/stores/useUserStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import CPagination from '@/components/UI/pagination/CPagination.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import RsvpTotals from '@/views/internal/rsvp/components/RsvpTotals.vue'
import RsvpGuestTr from '@/views/internal/rsvp/components/RsvpGuestTr.vue'
import RsvpDownload from '@/views/internal/rsvp/components/RsvpDownload.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'

const perPageOptions = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
]

const selectedGuests = ref([])
const selectAll = ref(false)
const selectedGuest = ref(null)
const showDetailsModal = ref(false)
const rsvpGuests = ref([])
const perPage = ref("10")
const currentPage = ref(1)
const totalPages = ref(0)
const rsvpStatus = ref('')
const searchValue = ref('')

const userStore = useUserStore()
const rsvpStore = useRsvpStore()
const notifications = useNotificationStore()

const filterOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'declined', label: 'Declined' },
]

const toggleSelectAll = (checked) => {
  selectAll.value = checked
  selectedGuests.value = checked ? rsvpGuests.value.map(g => g.id) : []
}

const loadGuests = async () => {
  const response = await rsvpStore.loadRsvpGuestsList(
    {
      eventId: userStore.activeEvent,
      currentPage: currentPage.value,
      perPage: perPage.value,
      status: rsvpStatus.value,
      search: searchValue.value,
    })

  if (response.status !== 200) {
    notifications.addNotification({
      type: 'error',
      message: 'Failed to load guests. Please try again later.',
    })
    return
  }

  rsvpGuests.value = response.data.data ?? []
  currentPage.value = response.data.meta?.current_page || 1
  totalPages.value = response.data.meta?.last_page || 1
}

const viewGuest = (guest) => {
  selectedGuest.value = guest
  showDetailsModal.value = true
}

const sendInvitations = () => {
  alert(`Sending invitations to guests: ${selectedGuests.value.join(', ')}`)
}

const reloadGuests = () => {
  loadGuests()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleConfirmationReverted = async () => {
  await loadGuests()
  showDetailsModal.value = false
}

onMounted(loadGuests)

watch(perPage, async () => {
  reloadGuests()
})

watch(currentPage, async () => {
  reloadGuests()
})

watch(searchValue, async () => {
  reloadGuests()
})

watch(rsvpStatus, async () => {
  reloadGuests()
})

</script>
