<script setup>
import { ref, computed } from 'vue'
import { Camera, Image, User, Users, Trash2, X, Edit, CheckCircle, XCircle, AlertCircle } from 'lucide-vue-next'
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CTag from '@/components/UI/tags/CTag.vue'
import CImageUpload from '@/components/UI/form2/CImageUpload.vue'
import CModal from '@/components/UI/modals/CModal.vue'
import CPageLoaderV2 from '@/components/UI/loading/CPageLoaderV2.vue'

// Mock data for photos
const photos = ref([
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'Beautiful wedding ceremony',
    uploadedBy: 'admin',
    uploadedByName: 'Event Organizer',
    createdAt: '2023-10-15T14:30:00Z',
    approvalStatus: 'approved' // Admin photos are auto-approved
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'First dance',
    uploadedBy: 'admin',
    uploadedByName: 'Event Organizer',
    createdAt: '2023-10-15T15:45:00Z',
    approvalStatus: 'approved' // Admin photos are auto-approved
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80',
    caption: 'Cake cutting moment',
    uploadedBy: 'guest',
    uploadedByName: 'John Smith',
    createdAt: '2023-10-15T16:20:00Z',
    approvalStatus: 'pending' // Guest photos need approval
  },
  {
    id: 4,
    imageUrl: 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'Group photo',
    uploadedBy: 'guest',
    uploadedByName: 'Sarah Johnson',
    createdAt: '2023-10-15T17:10:00Z',
    approvalStatus: 'approved' // This guest photo has been approved
  },
  {
    id: 5,
    imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'Venue decoration',
    uploadedBy: 'admin',
    uploadedByName: 'Event Organizer',
    createdAt: '2023-10-15T13:00:00Z',
    approvalStatus: 'approved' // Admin photos are auto-approved
  },
  {
    id: 6,
    imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'Reception dinner',
    uploadedBy: 'guest',
    uploadedByName: 'Michael Brown',
    createdAt: '2023-10-15T18:30:00Z',
    approvalStatus: 'rejected' // This guest photo has been rejected
  }
])

// State variables
const loading = ref(false)
const filterType = ref('all') // 'all', 'admin', 'guest', 'pending', 'approved', 'rejected'
const uploadedImages = ref([])
const showDeleteModal = ref(false)
const photoToDelete = ref(null)
const showApprovalModal = ref(false)
const photoToModerate = ref(null)

// Filter photos based on the selected filter type
const filteredPhotos = computed(() => {
  if (filterType.value === 'all') {
    return photos.value
  } else if (filterType.value === 'admin') {
    return photos.value.filter(photo => photo.uploadedBy === 'admin')
  } else if (filterType.value === 'guest') {
    return photos.value.filter(photo => photo.uploadedBy === 'guest')
  } else if (filterType.value === 'pending') {
    return photos.value.filter(photo => photo.approvalStatus === 'pending')
  } else if (filterType.value === 'approved') {
    return photos.value.filter(photo => photo.approvalStatus === 'approved')
  } else if (filterType.value === 'rejected') {
    return photos.value.filter(photo => photo.approvalStatus === 'rejected')
  }
  return photos.value
})

// Handle image upload
const handleImageUpload = () => {
  if (uploadedImages.value.length === 0) return

  loading.value = true

  // Simulate API call delay
  setTimeout(() => {
    // Add new photos to the list
    const newPhotos = uploadedImages.value.map((file, index) => ({
      id: photos.value.length + index + 1,
      imageUrl: URL.createObjectURL(file),
      caption: '',
      uploadedBy: 'admin',
      uploadedByName: 'Event Organizer',
      createdAt: new Date().toISOString(),
      approvalStatus: 'approved' // Admin uploads are auto-approved
    }))

    photos.value = [...newPhotos, ...photos.value]
    uploadedImages.value = []
    loading.value = false
  }, 1000)
}

// Open approval modal
const openApprovalModal = (photo) => {
  photoToModerate.value = photo
  showApprovalModal.value = true
}

// Approve a photo
const approvePhoto = () => {
  if (!photoToModerate.value) return

  loading.value = true

  // Simulate API call delay
  setTimeout(() => {
    const index = photos.value.findIndex(p => p.id === photoToModerate.value.id)
    if (index !== -1) {
      photos.value[index].approvalStatus = 'approved'
    }
    photoToModerate.value = null
    showApprovalModal.value = false
    loading.value = false
  }, 500)
}

// Reject a photo
const rejectPhoto = () => {
  if (!photoToModerate.value) return

  loading.value = true

  // Simulate API call delay
  setTimeout(() => {
    const index = photos.value.findIndex(p => p.id === photoToModerate.value.id)
    if (index !== -1) {
      photos.value[index].approvalStatus = 'rejected'
    }
    photoToModerate.value = null
    showApprovalModal.value = false
    loading.value = false
  }, 500)
}

// Open delete confirmation modal
const confirmDelete = (photo) => {
  photoToDelete.value = photo
  showDeleteModal.value = true
}

// Delete a photo
const deletePhoto = () => {
  if (!photoToDelete.value) return

  loading.value = true

  // Simulate API call delay
  setTimeout(() => {
    photos.value = photos.value.filter(p => p.id !== photoToDelete.value.id)
    photoToDelete.value = null
    showDeleteModal.value = false
    loading.value = false
  }, 500)
}

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
        <Camera class="w-8 h-8 mr-3 text-primary-600" />
        Sweet Memories
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Manage photo memories for your event
      </p>
    </div>

    <!-- Loading State -->
    <CPageLoaderV2 v-if="loading"></CPageLoaderV2>

    <template v-else>
      <!-- Image Upload Section -->
      <CCard class="mb-6 sticky top-0 z-10">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Image class="w-5 h-5 mr-2 text-primary-600" />
            Upload Photos
          </h2>

          <CImageUpload
            name="photos"
            label="Event Photos"
            v-model="uploadedImages"
            description="Upload photos to share with your guests"
          />

          <div class="mt-4 flex justify-end">
            <CButton
              variant="primary"
              :disabled="uploadedImages.length === 0"
              @click="handleImageUpload"
            >
              Upload Photos
            </CButton>
          </div>
        </div>
      </CCard>

      <!-- Photo Gallery -->
      <CCard>
        <div class="p-6">
          <div class="flex flex-wrap justify-between items-center mb-6">
            <div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                <Image class="w-5 h-5 mr-2 text-primary-600" />
                Photo Gallery
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ filteredPhotos.length }} photos
              </p>
            </div>

            <!-- Filter Buttons -->
            <div class="flex flex-wrap space-x-2 mt-2 sm:mt-0">
              <CButton
                :variant="filterType === 'all' ? 'primary' : 'outline'"
                size="sm"
                @click="filterType = 'all'"
              >
                All Photos
              </CButton>
              <CButton
                :variant="filterType === 'admin' ? 'primary' : 'outline'"
                size="sm"
                @click="filterType = 'admin'"
              >
                <User class="w-4 h-4 mr-1" />
                Admin Uploaded
              </CButton>
              <CButton
                :variant="filterType === 'guest' ? 'primary' : 'outline'"
                size="sm"
                @click="filterType = 'guest'"
              >
                <Users class="w-4 h-4 mr-1" />
                Guest Uploaded
              </CButton>
            </div>

            <!-- Moderation Filter Buttons -->
            <div class="flex flex-wrap space-x-2 mt-2 w-full">
              <CButton
                :variant="filterType === 'pending' ? 'primary' : 'outline'"
                size="sm"
                @click="filterType = 'pending'"
                class="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-800"
              >
                <AlertCircle class="w-4 h-4 mr-1" />
                Pending Approval ({{ photos.filter(p => p.approvalStatus === 'pending').length }})
              </CButton>
              <CButton
                :variant="filterType === 'approved' ? 'primary' : 'outline'"
                size="sm"
                @click="filterType = 'approved'"
                class="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800"
              >
                <CheckCircle class="w-4 h-4 mr-1" />
                Approved
              </CButton>
              <CButton
                :variant="filterType === 'rejected' ? 'primary' : 'outline'"
                size="sm"
                @click="filterType = 'rejected'"
                class="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800"
              >
                <XCircle class="w-4 h-4 mr-1" />
                Rejected
              </CButton>
            </div>
          </div>

          <!-- No Photos Message -->
          <div
            v-if="filteredPhotos.length === 0"
            class="text-center py-8 text-gray-500 dark:text-gray-400"
          >
            <Image class="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p class="text-lg">No photos found</p>
            <p class="text-sm mt-1">
              {{
                filterType === 'all'
                  ? 'Upload photos using the uploader above'
                  : 'Try a different filter'
              }}
            </p>
          </div>

          <!-- Photos Grid -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div
              v-for="photo in filteredPhotos"
              :key="photo.id"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition"
            >
              <div class="relative aspect-square">
                <img
                  :src="photo.imageUrl"
                  :alt="photo.caption || 'Event photo'"
                  class="w-full h-full object-cover"
                />
                <button
                  class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  title="Delete photo"
                  @click="confirmDelete(photo)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
              <div class="p-4">
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-sm text-gray-700 dark:text-gray-300">
                      {{ photo.caption || 'No caption' }}
                    </p>
                    <div class="mt-2 flex items-center">
                      <CTag
                        :variant="photo.uploadedBy === 'admin' ? 'primary' : 'warning'"
                        size="sm"
                        class="text-xs"
                      >
                        {{ photo.uploadedBy === 'admin' ? 'Admin' : 'Guest' }}
                      </CTag>
                      <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {{ photo.uploadedByName }}
                      </span>
                    </div>

                    <!-- Approval Status Tag -->
                    <div class="mt-1 flex items-center">
                      <CTag
                        v-if="photo.uploadedBy === 'guest'"
                        :variant="
                          photo.approvalStatus === 'approved'
                            ? 'success'
                            : photo.approvalStatus === 'rejected'
                              ? 'error'
                              : 'warning'
                        "
                        size="sm"
                        class="text-xs flex items-center"
                      >
                        <CheckCircle v-if="photo.approvalStatus === 'approved'" class="w-3 h-3 mr-1" />
                        <XCircle v-else-if="photo.approvalStatus === 'rejected'" class="w-3 h-3 mr-1" />
                        <AlertCircle v-else class="w-3 h-3 mr-1" />
                        {{
                          photo.approvalStatus === 'approved'
                            ? 'Approved'
                            : photo.approvalStatus === 'rejected'
                              ? 'Rejected'
                              : 'Pending Approval'
                        }}
                      </CTag>
                    </div>

                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {{ formatDate(photo.createdAt) }}
                    </p>

                    <!-- Moderation Buttons for Guest Photos -->
                    <div v-if="photo.uploadedBy === 'guest' && photo.approvalStatus === 'pending'" class="mt-2 flex space-x-2">
                      <CButton
                        variant="outline"
                        size="sm"
                        class="text-xs py-1 px-2 min-w-0 bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                        @click="openApprovalModal(photo)"
                      >
                        Moderate
                      </CButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CCard>
    </template>

    <!-- Delete Confirmation Modal -->
    <CModal v-model="showDeleteModal">
      <template #title>Confirm Deletion</template>
      <p class="text-gray-700 dark:text-gray-300">
        Are you sure you want to delete this photo? This action cannot be undone.
      </p>
      <template #footer>
        <CButton variant="ghost" @click="showDeleteModal = false">Cancel</CButton>
        <CButton variant="danger" @click="deletePhoto">Delete</CButton>
      </template>
    </CModal>

    <!-- Photo Moderation Modal -->
    <CModal v-model="showApprovalModal">
      <template #title>Moderate Guest Photo</template>
      <div v-if="photoToModerate" class="space-y-4">
        <div class="aspect-square w-full max-h-80 overflow-hidden rounded-lg">
          <img
            :src="photoToModerate.imageUrl"
            :alt="photoToModerate.caption || 'Guest photo'"
            class="w-full h-full object-cover"
          />
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Caption: {{ photoToModerate.caption || 'No caption' }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Uploaded by: {{ photoToModerate.uploadedByName }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Date: {{ formatDate(photoToModerate.createdAt) }}
          </p>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Please review this photo and decide whether to approve or reject it.
          </p>
        </div>
      </div>
      <template #footer>
        <CButton variant="ghost" @click="showApprovalModal = false">Cancel</CButton>
        <CButton
          variant="outline"
          class="bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
          @click="rejectPhoto"
        >
          Reject
        </CButton>
        <CButton
          variant="outline"
          class="bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
          @click="approvePhoto"
        >
          Approve
        </CButton>
      </template>
    </CModal>
  </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>
