<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <CHeading :level="2" weight="semibold">Event Locations</CHeading>
      <CButton
        variant="primary"
        @click="addLocation()"
      >+ Add Location</CButton>
    </div>

    <div class="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6">
      <div class="overflow-x-auto">
        <div v-if="loading">
          <CLoading />
        </div>
        <div v-else>
          <table
            class="w-full table-auto divide-y divide-gray-200 dark:divide-gray-700"
            v-if="locationsStore.locations.length > 0"
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
                Address
              </th>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                City
              </th>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                State
              </th>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Zip Code
              </th>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Country
              </th>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Is Default
              </th>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Actions
              </th>
            </tr>
            </thead>
            <tbody
              class="divide-y divide-gray-100 dark:divide-gray-700"
            >
              <tr
                v-for="location in locationsStore.locations"
                :key="location.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {{ location.name }}
                </td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ location.address }}
                </td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ location.city }}
                </td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ location.state }}
                </td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ location.zipCode }}
                </td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ location.country }}
                </td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ location.isDefault ? 'Yes' : 'No' }}
                </td>
                <td class="px-2 py-4 whitespace-nowrap text-left text-sm w-[160px]">
                  <div class="flex gap-2 flex-wrap">
                    <CButton
                      v-tooltip="'Coming Soon'"
                      size="sm"
                      variant="primary" @click="editLocation(location)"
                      disabled
                    >
                      Edit
                    </CButton>
                    <CButton size="sm" variant="outline" @click="confirmDelete(location)">Delete</CButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <CAlert variant="info" v-else>
            There are no locations for this event yet.
          </CAlert>
        </div>
        <CConfirmModal
          v-model="showConfirmDelete"
          title="Delete Location"
          message="Are you sure you want to delete this location? This action cannot be undone."
          @close="showConfirmDelete = false"
          @confirm="handleConfirmDelete()"
        />
      </div>
    </div>


  </div>
</template>

<script setup>
import CHeading from '@/components/UI/headings/CHeading.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CLoading from '@/components/UI/loading/CLoading.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import { ref } from 'vue'
import { useLocationsStore } from '@/stores/useLocationsStore'
import { useRouter } from 'vue-router'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'

const loading = ref(false)
const locations = ref([])
const router = useRouter()

const locationsStore = useLocationsStore()
const selectedLocationForDelete = ref(null)
const showConfirmDelete = ref(false)
const notificationsStore = useNotificationStore()

const loadLocations = async () => {
  loading.value = true
  await locationsStore.loadLocationsList()
  loading.value = false
}

const editLocation = async (location) => {
  return await router.push('/dashboard/locations/edit/' + location.id)
}

const confirmDelete = (location) => {
  selectedLocationForDelete.value = location
  showConfirmDelete.value = true
}

const addLocation = async () => {
  await router.push('/dashboard/locations/create')
}

const handleConfirmDelete = async () => {
  if (selectedLocationForDelete.value) {
    const response = await locationsStore.deleteLocation(selectedLocationForDelete.value.id)

    if (response.status === 200) {
      await loadLocations()
      selectedLocationForDelete.value = null
      notificationsStore.addNotification({
        type: 'success',
        message: 'Location deleted successfully!',
      })
    } else {
      console.error('Failed to delete location:', response)
      notificationsStore.addNotification({
        type: 'error',
        message: 'Failed to delete location. Please try again.',
      })
    }
    showConfirmDelete.value = false
  }
}

</script>
