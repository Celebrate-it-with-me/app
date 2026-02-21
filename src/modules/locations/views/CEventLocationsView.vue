<template>
  <div class="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header Section -->
    <div class="relative mb-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Event
            <span
              class="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
            >
              Location
            </span>
          </h1>
          <p class="text-gray-500 font-medium">
            Manage your event location and share it with your guests
          </p>
        </div>

        <!-- Add Location Button (when no location) -->
        <div v-if="!hasLocation" class="flex flex-shrink-0">
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

    <!-- Loading State -->
    <div v-if="loading">
      <CLoading />
    </div>

    <!-- Location Display -->
    <div v-else-if="hasLocation" class="space-y-6">
      <!-- Quick Actions Bar -->
      <div class="flex flex-wrap items-center gap-3">
        <CButton
          variant="primary"
          class="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-purple-500/25"
          @click="editLocation"
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
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Location
        </CButton>

        <CButton
          variant="secondary"
          class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 px-6 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-sm"
          @click="copyLocationLink"
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
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Copy Link
        </CButton>

        <CButton
          variant="secondary"
          class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 px-6 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-sm"
          @click="getDirections"
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
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          Directions
        </CButton>

        <!-- More Options Dropdown -->
        <div class="ml-auto">
          <CButton
            variant="ghost"
            class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-3 py-2.5 rounded-xl transition-all"
            @click="toggleOptions"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </CButton>
        </div>
      </div>

      <!-- Main Location Card -->
      <div
        class="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        <!-- Hero Section: Carousel Full Width (Reduced Height) -->
        <div
          class="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-t-3xl overflow-hidden"
        >
          <!-- Image Carousel -->
          <CCarousel
            v-if="location?.event_location_images?.length"
            :images="imagesUrl"
            :autoplay="true"
            :autoplay-delay="5000"
            :show-dots="true"
            :show-arrows="true"
            width="w-full"
            height="h-80 lg:h-96"
            transition-effect="fade"
            class="overflow-hidden"
          />
          <div v-else class="h-80 lg:h-96 flex items-center justify-center">
            <div class="text-center">
              <div
                class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center"
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="text-purple-400"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <p class="text-gray-400 font-medium">No images yet</p>
              <p class="text-sm text-gray-400 mt-1">Add photos to showcase your venue</p>
            </div>
          </div>
        </div>

        <!-- Map + Location Info Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <!-- Map Section (Left) -->
          <div class="relative bg-gray-50 dark:bg-gray-800 p-8 lg:p-12">
            <h3
              class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3"
            >
              <div
                class="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  stroke-width="2.5"
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  />
                </svg>
              </div>
              Map Preview
            </h3>

            <div class="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
              <CMapPreview
                v-if="hasMap"
                :lat="latitudeNumber"
                :lng="longitudeNumber"
                class="w-full h-96"
              />
              <div
                v-else
                class="h-96 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
              >
                <div class="text-center px-6">
                  <div
                    class="w-20 h-20 mx-auto mb-4 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center"
                  >
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="text-gray-400"
                    >
                      <path
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                      />
                    </svg>
                  </div>
                  <p class="text-gray-500 dark:text-gray-400 font-medium mb-2">
                    Map Preview Unavailable
                  </p>
                  <p class="text-sm text-gray-400 dark:text-gray-500">
                    Add coordinates to display location on map
                  </p>
                </div>
              </div>
            </div>

            <!-- Coordinates Info -->
            <div v-if="hasMap" class="mt-6 bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
              <div class="flex items-center gap-3">
                <div
                  class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg flex items-center justify-center"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="text-purple-600 dark:text-purple-400"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path
                      d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <p
                    class="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold mb-0.5"
                  >
                    Coordinates
                  </p>
                  <p class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {{ latitudeNumber?.toFixed(6) || 'N/A' }},
                    {{ longitudeNumber?.toFixed(6) || 'N/A' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Location Info Section (Right) -->
          <div class="bg-white dark:bg-gray-900 p-8 lg:p-12">
            <!-- Venue Name & Address -->
            <div class="mb-8">
              <div class="flex items-start gap-4 mb-6">
                <div
                  class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    stroke-width="2.5"
                  >
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {{ location.name }}
                  </h2>
                  <p class="text-lg text-gray-600 dark:text-gray-400">
                    {{ fullAddress }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Location Details Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <!-- City -->
              <div class="group">
                <div class="flex items-center gap-3 mb-2">
                  <div
                    class="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="text-purple-600 dark:text-purple-400"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <span
                    class="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold"
                  >
                    City
                  </span>
                </div>
                <p class="text-lg font-semibold text-gray-900 dark:text-white ml-13">
                  {{ location.city }}
                </p>
              </div>

              <!-- State -->
              <div class="group">
                <div class="flex items-center gap-3 mb-2">
                  <div
                    class="w-10 h-10 bg-pink-50 dark:bg-pink-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="text-pink-600 dark:text-pink-400"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <span
                    class="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold"
                  >
                    State
                  </span>
                </div>
                <p class="text-lg font-semibold text-gray-900 dark:text-white ml-13">
                  {{ location.state }}
                </p>
              </div>

              <!-- Country -->
              <div class="group">
                <div class="flex items-center gap-3 mb-2">
                  <div
                    class="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="text-purple-600 dark:text-purple-400"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path
                        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                      />
                    </svg>
                  </div>
                  <span
                    class="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold"
                  >
                    Country
                  </span>
                </div>
                <p class="text-lg font-semibold text-gray-900 dark:text-white ml-13">
                  {{ location.country }}
                </p>
              </div>

              <!-- Zip Code -->
              <div class="group">
                <div class="flex items-center gap-3 mb-2">
                  <div
                    class="w-10 h-10 bg-pink-50 dark:bg-pink-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="text-pink-600 dark:text-pink-400"
                    >
                      <path
                        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                      />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                  <span
                    class="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold"
                  >
                    Zip Code
                  </span>
                </div>
                <p class="text-lg font-semibold text-gray-900 dark:text-white ml-13">
                  {{ location.zip_code }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Danger Zone (Bottom of Card) -->
        <div class="bg-white dark:bg-gray-900 px-8 lg:px-12 pb-8 lg:pb-12 rounded-b-3xl">
          <div class="pt-8 border-t border-gray-100 dark:border-gray-800">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Danger Zone
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Permanently remove this location from your event
                </p>
              </div>
              <CButton
                variant="danger"
                class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:border-red-800 px-5 py-2.5 rounded-xl transition-all"
                @click="confirmDelete(location)"
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
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Location State -->
    <NoLocations v-else />

    <!-- Confirm Delete Modal -->
    <CConfirmModal
      v-model="showConfirmDelete"
      title="Are you sure?"
      message="You are about to delete this location. This action cannot be undone."
      @confirm="handleConfirmDelete()"
      @close="showConfirmDelete = false"
    />

    <!-- Toast Notification -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="showToast" class="fixed bottom-6 right-6 z-50 max-w-md">
        <div
          :class="[
            'rounded-2xl shadow-2xl backdrop-blur-lg border p-4 flex items-center gap-3',
            toastType === 'success'
              ? 'bg-green-50/95 border-green-200 dark:bg-green-900/95 dark:border-green-700'
              : 'bg-red-50/95 border-red-200 dark:bg-red-900/95 dark:border-red-700'
          ]"
        >
          <!-- Success Icon -->
          <div
            v-if="toastType === 'success'"
            class="flex-shrink-0 w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <!-- Error Icon -->
          <div
            v-else
            class="flex-shrink-0 w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="3"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>

          <p
            :class="[
              'font-medium text-sm flex-1',
              toastType === 'success'
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            ]"
          >
            {{ toastMessage }}
          </p>

          <button
            :class="[
              'flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors',
              toastType === 'success'
                ? 'hover:bg-green-200 dark:hover:bg-green-800 text-green-600 dark:text-green-300'
                : 'hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-300'
            ]"
            @click="showToast = false"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import CLoading from '@/components/UI/loading/CLoading.vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'
import { PlusCircle } from 'lucide-vue-next'
import NoLocations from '@/modules/locations/components/NoLocations.vue'
import CMapPreview from '@/components/UI/google/CMapPreview.vue'
import CCarousel from '@/components/UI/carousel/CCarousel.vue'
import { useLocationsView } from '@/modules/locations/composables/useLocationsView'
import { ref } from 'vue'

const {
  loading,
  showConfirmDelete,
  fullAddress,
  latitudeNumber,
  longitudeNumber,
  hasMap,
  imagesUrl,
  location,
  hasLocation,
  handleConfirmDelete,
  addLocation,
  confirmDelete
} = useLocationsView()

// Toast notification state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success') // 'success' | 'error'

const showNotification = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true

  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// New methods for improved UX
const editLocation = () => {
  // TODO: Implement edit location functionality
  console.log('Edit location')
}

const copyLocationLink = async () => {
  try {
    // Generate the public location URL
    // Adjust this URL structure based on your routing
    const eventId = location.value.event_id
    const publicUrl = `${window.location.origin}/event/${eventId}/location`

    // Copy to clipboard
    await navigator.clipboard.writeText(publicUrl)

    // Show success feedback
    showNotification('Location link copied to clipboard!')
    console.log('Copied URL:', publicUrl)
  } catch (error) {
    console.error('Failed to copy location link:', error)
    showNotification('Failed to copy link. Please try again.', 'error')
  }
}

const getDirections = () => {
  // Use the actual number values, not the reactive refs
  const lat = latitudeNumber.value
  const lng = longitudeNumber.value

  if (lat && lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(url, '_blank')
  } else {
    showNotification('Location coordinates not available', 'error')
  }
}

const toggleOptions = () => {
  // TODO: Show dropdown with more options
  console.log('Toggle options')
}
</script>
