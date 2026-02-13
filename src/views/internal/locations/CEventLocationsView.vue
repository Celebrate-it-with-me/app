<template>
  <div class="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="relative mb-12">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Event
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
              >Location</span
            >
          </h1>
          <p class="text-gray-500 font-medium">
            Manage your event location and its details. Add, edit, and delete locations as needed.
          </p>
        </div>

        <div v-if="!locationStore.hasLocation" class="flex flex-shrink-0">
          <CButton
            variant="gradient"
            class="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-xl shadow-purple-500/20 px-8 h-14 rounded-2xl transition-all hover:-translate-y-0.5 active:scale-95"
            :disabled="loading"
            @click="addLocation()"
          >
            <PlusCircle class="w-5 h-5 mr-2" />
            <span class="font-bold">Add Location</span>
          </CButton>
        </div>
      </div>
    </div>

    <div v-if="loading">
      <CLoading />
    </div>
    <!-- Location Display -->
    <div v-else-if="locationStore.hasLocation" class="space-y-8">
      <!-- Location Card -->
      <div
        class="bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
      >
        <!-- Image Carousel -->
        <CCarousel
          v-if="locationStore.location?.event_location_images?.length"
          :images="imagesUrl"
          :autoplay="true"
          :autoplay-delay="5000"
          :show-dots="true"
          :show-arrows="true"
          width="w-full"
          height="h-80"
          transition-effect="fade"
          class="rounded-t-2xl overflow-hidden"
        />

        <!-- Location Info -->
        <div class="p-8">
          <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <!-- Left: Location Details -->
            <div class="flex-1 space-y-6">
              <div>
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {{ locationStore.location.name }}
                </h2>
                <p class="text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="text-purple-500"
                  >
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    />
                  </svg>
                  {{ fullAddress }}
                </p>
              </div>

              <!-- Location Details Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div>
                    <span
                      class="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold tracking-wider"
                      >City</span
                    >
                    <p class="text-gray-900 dark:text-white font-medium mt-1">
                      {{ locationStore.location.city }}
                    </p>
                  </div>
                  <div>
                    <span
                      class="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold tracking-wider"
                      >State</span
                    >
                    <p class="text-gray-900 dark:text-white font-medium mt-1">
                      {{ locationStore.location.state }}
                    </p>
                  </div>
                </div>
                <div class="space-y-4">
                  <div>
                    <span
                      class="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold tracking-wider"
                      >Country</span
                    >
                    <p class="text-gray-900 dark:text-white font-medium mt-1">
                      {{ locationStore.location.country }}
                    </p>
                  </div>
                  <div>
                    <span
                      class="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold tracking-wider"
                      >Zip Code</span
                    >
                    <p class="text-gray-900 dark:text-white font-medium mt-1">
                      {{ locationStore.location.zip_code }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-wrap gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                <CButton
                  variant="danger"
                  class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:border-red-800 px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5"
                  @click="confirmDelete(locationStore.location)"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="mr-2"
                  >
                    <polyline points="3,6 5,6 21,6" />
                    <path
                      d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"
                    />
                  </svg>
                  Remove Location
                </CButton>

                <CConfirmModal
                  v-model="showConfirmDelete"
                  title="Are you sure?"
                  message="You are about to delete this location. This action cannot be undone."
                  @confirm="handleConfirmDelete()"
                  @close="showConfirmDelete = false"
                />
              </div>
            </div>

            <!-- Right: Map Preview -->
            <div class="lg:w-96 flex-shrink-0">
              <div class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-1 shadow-inner">
                <CMapPreview
                  v-if="hasMap"
                  :lat="latitudeNumber"
                  :lng="longitudeNumber"
                  class="rounded-xl overflow-hidden h-64 w-full"
                />
                <div
                  v-else
                  class="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center"
                >
                  <div class="text-center text-gray-500 dark:text-gray-400">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="mx-auto mb-2 opacity-50"
                    >
                      <path
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                      />
                    </svg>
                    <p class="text-sm">Map coordinates not available</p>
                  </div>
                </div>
              </div>

              <!-- Map Info -->
              <div class="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><span class="font-medium">Coordinates:</span></p>
                <p class="ml-2">Lat: {{ locationStore.location?.latitude || 'N/A' }}</p>
                <p class="ml-2">Lng: {{ locationStore.location?.longitude || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <NoLocations v-else />
  </div>
</template>

<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import CLoading from '@/components/UI/loading/CLoading.vue'
import { computed, ref } from 'vue'
import { useLocationsStore } from '@/stores/useLocationsStore'
import { useRouter } from 'vue-router'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { PlusCircle } from 'lucide-vue-next'
import NoLocations from '@/views/internal/locations/NoLocations.vue'
import CMapPreview from '@/components/UI/google/CMapPreview.vue'
import CCarousel from '@/components/UI/carousel/CCarousel.vue'

const loading = ref(false)
const router = useRouter()

const locationStore = useLocationsStore()
const selectedLocationForDelete = ref(null)
const showConfirmDelete = ref(false)
const notificationsStore = useNotificationStore()

const loadLocation = async () => {
  loading.value = true
  await locationStore.fetchLocation()
  loading.value = false
}

const confirmDelete = location => {
  selectedLocationForDelete.value = location
  showConfirmDelete.value = true
}

const addLocation = async () => {
  await router.push('/dashboard/locations/create')
}

const handleConfirmDelete = async () => {
  if (selectedLocationForDelete.value) {
    const response = await locationStore.deleteLocation(selectedLocationForDelete.value.id)

    if (response.status === 200) {
      await loadLocation()
      selectedLocationForDelete.value = null
      notificationsStore.addNotification({
        type: 'success',
        message: 'Location deleted successfully!'
      })
    } else {
      console.error('Failed to delete location:', response)
      notificationsStore.addNotification({
        type: 'error',
        message: 'Failed to delete location. Please try again.'
      })
    }
    showConfirmDelete.value = false
  }
}

const fullAddress = computed(() => {
  const location = locationStore.location
  if (!location) return ''
  return `${location.address}, ${location.city}, ${location.state} ${location.zip_code}`
})

const latitudeNumber = computed(() => {
  if (!locationStore.location) return ''

  return parseFloat(locationStore.location?.latitude)
})

const longitudeNumber = computed(() => {
  if (!locationStore.location) return ''

  return parseFloat(locationStore.location?.longitude)
})

const hasMap = computed(() => {
  return latitudeNumber.value && longitudeNumber.value
})

const imagesUrl = computed(() => {
  return locationStore.location.event_location_images.map(image => image.path)
})
</script>
