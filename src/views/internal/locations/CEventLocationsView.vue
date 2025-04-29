<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <CHeading :level="2" weight="semibold">Event Locations</CHeading>
      <CButton
        variant="primary"
        @click="addLocation()"
      >+ Add Location</CButton>
    </div>

    <div class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6">
      <div class="overflow-x-auto">
        <div v-if="loading">
          <CLoading />
        </div>
        <div v-else>
          <table
            class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
            v-if="locations.length > 0"
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
                Zip Code / Postal Code
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
            </tr>
            </thead>
            <tbody
              class="divide-y divide-gray-100 dark:divide-gray-700"
            >
              <tr
                v-for="location in locations"
                :key="location.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {{ location.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ location.address }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ location.city }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ location.state }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ location.zipCode }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ location.country }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ location.isDefault ? 'Yes' : 'No' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-left flex flex-start gap-2 text-sm">
                  <CButton size="sm" variant="primary" @click="viewLocation(location)">Details</CButton>
                  <CButton size="sm" variant="outline" @click="confirmDelete(location)">Delete</CButton>
                </td>
              </tr>
            </tbody>
          </table>
          <CAlert variant="info" v-else>
            There are no locations for this event yet.
          </CAlert>
        </div>

      </div>
    </div>


  </div>
</template>

<script setup>
import CHeading from '@/components/UI/headings/CHeading.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CLoading from '@/components/UI/loading/CLoading.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import { onMounted, ref } from 'vue'
import { useLocationsStore } from '@/stores/useLocationsStore'
import { useRouter } from 'vue-router'

const loading = ref(false)
const locations = ref([])
const router = useRouter()

const locationsStore = useLocationsStore()

const loadLocations = async () => {
  loading.value = true
  try {
    const response = await locationsStore.loadLocations()

    if (response.status === 200) {
      locations.value = response?.data?.data ?? []
      locationsStore.locations = locations.value
    } else {
      console.error('Error loading locations:', response)
    }

  } catch (error) {
    console.error('Error loading locations:', error)
  } finally {
    loading.value = false
  }
}


const viewLocation = (location) => {
  // Logic to view location details
}
const confirmDelete = (location) => {
  // Logic to confirm delete location
}

const addLocation = async () => {
  await router.push('/dashboard/locations/create')
}

onMounted(loadLocations)
</script>
