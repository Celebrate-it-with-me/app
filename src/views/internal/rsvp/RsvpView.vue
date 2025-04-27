<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <CHeading :level="2" weight="semibold">RSVP Guest List</CHeading>
    </div>

    <div class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex gap-2 items-center">
          <CSelect
            id="filterStatus"
            name="filterStatus"
            :options="filterOptions"
          />
        </div>

        <CButton variant="primary" @click="sendInvitations" :disabled="!selectedGuests.length">
          Send Invitation to Selected
        </CButton>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-3 py-3 text-left">
              <CCheckbox v-model="selectAll" @update:modelValue="toggleSelectAll" />
            </th>
            <th class="px-3 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
            <th class="px-3 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
              Confirmed Status
            </th>
            <th class="px-3 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
              Confirmed Status Date
            </th>
            <th class="px-3 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr v-for="guest in guestStore.guests" :key="guest.id" class="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <td class="px-3 py-2">
              <CCheckbox
                :id="`guest_${guest.id}`"
                :modelValue="selectedGuests.includes(guest.id)"
                @update:modelValue="val => toggleGuestSelection(guest.id, val)"
              />
            </td>
            <td class="px-3 py-2 text-sm text-gray-800 dark:text-gray-100">{{ guest.name }}</td>
            <td class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{{ guest.email || 'N/A' }}</td>
            <td class="px-3 py-2 text-sm">
              <span :class="statusClass(guest.rsvpStatus)">{{ guest.rsvpStatus }}</span>
            </td>
            <td class="px-3 py-2  text-right">
              <CButton size="sm" variant="outline" @click="viewGuest(guest)">Details</CButton>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <CRsvpDetailsModal
    v-model="showDetailsModal"
    :guest="selectedGuest"
    @close="showDetailsModal = false"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CCheckbox from '@/components/UI/form2/CCheckbox.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CRsvpDetailsModal from '@/components/UI/modals/CRsvpDetailsModal.vue'
import { useGuestsStore } from '@/stores/useGuestStore'

const loading = ref(false)

const selectedGuests = ref([])
const selectAll = ref(false)
const selectedGuest = ref(null)
const showDetailsModal = ref(false)

const guestStore = useGuestsStore()

onMounted(async () => {
  await loadGuests()
})

const filterOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'declined', label: 'Declined' },
]

const toggleSelectAll = (checked) => {
  selectAll.value = checked
  selectedGuests.value = checked ? guests.value.map(g => g.id) : []
}

const toggleGuestSelection = (id, checked) => {
  if (checked && !selectedGuests.value.includes(id)) {
    selectedGuests.value.push(id)
  } else if (!checked) {
    selectedGuests.value = selectedGuests.value.filter(g => g !== id)
  }
  selectAll.value = selectedGuests.value.length === guests.value.length
}

const statusClass = (status) => {
  return {
    pending: 'text-yellow-600',
    confirmed: 'text-green-600',
    declined: 'text-red-500',
  }[status] || 'text-gray-500'
}

const loadGuests = async () => {
  loading.value = true
  await guestStore.loadGuests()
  loading.value = false
}

const viewGuest = (guest) => {
  selectedGuest.value = guest
  showDetailsModal.value = true
}

const sendInvitations = () => {
  alert(`Sending invitations to guests: ${selectedGuests.value.join(', ')}`)
}
</script>
