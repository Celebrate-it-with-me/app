<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <CHeading :level="2" weight="semibold">Guest List</CHeading>
      <CButton variant="primary" @click="createGuest">+ Add Guest</CButton>
    </div>

    <div class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6">
      <div class="overflow-x-auto">
        <div v-if="loading">
          <CLoading />
        </div>
        <div v-else>
          <table
            class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
            v-if="guestStore.guests.length"
          >
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Name
                </th>
                <th
                  class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Email
                </th>
                <th
                  class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Phone
                </th>
                <th
                  class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr
                v-for="guest in guestStore.guests"
                :key="guest.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {{ guest.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ guest.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ guest.phone }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="statusClass(guest.confirmed)">{{ guest.rsvpStatus }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-left flex flex-start gap-2 text-sm">
                  <CButton size="sm" variant="primary" @click="viewGuest(guest)">Details</CButton>
                  <CButton size="sm" variant="outline" @click="confirmDelete(guest)">Delete</CButton>
                </td>
              </tr>
            </tbody>
          </table>
          <CAlert variant="" v-else> There are no Guests for this event yet. </CAlert>
        </div>
        <GuestDetailsModal
          :guest="selectedGuest"
          :show="showDetailsModal"
          @close="showDetailsModal = false"
        />

        <CConfirmModal
          :modelValue="confirmDeleteModal"
          title="Delete Guest"
          message="Are you sure you want to delete this guest? This action cannot be undone."
          @confirm="deleteGuest()"
          @update:modelValue="confirmDeleteModal = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { useGuestsStore } from '@/stores/useGuestStore'
import CLoading from '@/components/UI/loading/CLoading.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import { useRouter } from 'vue-router'
import GuestDetailsModal from '@/components/UI/modals/GuestDetailsModal.vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'

const guestStore = useGuestsStore()
const router = useRouter()

const loading = ref()
const selectedGuest = ref({ })
const guestToDelete = ref(null)
const showDetailsModal = ref(false)
const confirmDeleteModal = ref(false)

const loadGuests = async () => {
  loading.value = true
  await guestStore.loadGuests()
  loading.value = false
}

const statusClass = (status) => {
  if (status === 'confirmed') return 'text-green-600 dark:text-green-400'
  if (status === 'declined') return 'text-red-500'
  return 'text-gray-500'
}

const viewGuest = (guest) => {
  selectedGuest.value = guest
  showDetailsModal.value = true
}

const createGuest = async () => {
  await router.push('/dashboard/guests/create')
}

const deleteGuest = async () => {
  if (guestToDelete.value) {
    const response = await guestStore.deleteGuest(guestToDelete.value.id)

    if (response.status === 200) {
      await loadGuests()
      guestToDelete.value = null
    } else {
      // Handle error (e.g., show notification)
      console.error('Failed to delete guest:', response)
    }

    confirmDeleteModal.value = false
  }
}

const confirmDelete = (guest) => {
  guestToDelete.value = guest
  confirmDeleteModal.value = true
}

onMounted(loadGuests)
</script>

<style scoped>
/* Custom styles if needed */
</style>
