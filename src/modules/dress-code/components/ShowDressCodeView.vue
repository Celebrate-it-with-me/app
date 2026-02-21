<script setup>
import { FileText, Image, Palette, Pencil, Shirt, Trash2 } from 'lucide-vue-next'
import CButton from '@/components/UI/buttons/CButton.vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'
import { useDressCodeView } from '@/modules/dress-code/composables/useDressCodeView'

const emit = defineEmits(['editDressCode'])

const {
  dressCode,
  formattedDressCodeType,
  // Image preview modal
  selectedImage,
  showImageModal,
  // Toast notification
  showToast,
  toastMessage,
  // Delete confirmation modal
  showDeleteModal,
  confirmDelete,
  deleteDressCode,
  getColorName,
  handleEdit,
  closeImagePreview,
  openImagePreview
} = useDressCodeView(emit)
</script>

<template>
  <div class="space-y-6">
    <!-- Quick Actions Bar -->
    <div class="flex flex-wrap items-center gap-3">
      <CButton
        variant="primary"
        class="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-purple-500/25"
        @click="handleEdit"
      >
        <Pencil class="w-4 h-4 mr-2" />
        Edit Dress Code
      </CButton>

      <CButton
        variant="secondary"
        class="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 px-6 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-sm"
        @click="confirmDelete"
      >
        <Trash2 class="w-4 h-4 mr-2" />
        Delete Dress Code
      </CButton>
    </div>

    <!-- Main Card -->
    <div
      class="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
    >
      <!-- Header Section -->
      <div
        class="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 p-8 lg:p-12"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25"
          >
            <Shirt class="w-7 h-7 text-white" stroke-width="2.5" />
          </div>
          <div class="flex-1">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {{ formattedDressCodeType }}
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400">Dress Code Guidelines</p>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="p-8 lg:p-12">
        <!-- Reserved Colors Section -->
        <div v-if="dressCode?.reservedColors?.length" class="mb-12">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl flex items-center justify-center"
            >
              <Palette class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Reserved Colors</h3>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div v-for="(color, index) in dressCode.reservedColors" :key="index" class="group">
              <div
                class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div
                  class="w-full aspect-square rounded-xl mb-3 ring-4 ring-white dark:ring-gray-800 shadow-lg group-hover:scale-105 transition-transform"
                  :style="{ backgroundColor: color }"
                ></div>
                <p class="text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {{ getColorName(color) }}
                </p>
                <p class="text-center text-xs text-gray-400 dark:text-gray-500 font-mono mt-1">
                  {{ color }}
                </p>
              </div>
            </div>
          </div>

          <div
            class="mt-6 bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-100 dark:border-purple-900/20"
          >
            <p class="text-sm text-purple-800 dark:text-purple-200">
              <span class="font-semibold">Note:</span> These colors are reserved for the quinceañera
              and her court. Guests should avoid wearing these colors.
            </p>
          </div>
        </div>

        <!-- No Reserved Colors State -->
        <div v-else class="mb-12">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl flex items-center justify-center"
            >
              <Palette class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Reserved Colors</h3>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
            <p class="text-gray-500 dark:text-gray-400">No reserved colors specified</p>
          </div>
        </div>

        <!-- Description Section -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl flex items-center justify-center"
            >
              <FileText class="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Description</h3>
          </div>

          <div
            class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 lg:p-8"
          >
            <p class="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-line">
              {{ dressCode.description || 'No description provided' }}
            </p>
          </div>
        </div>

        <!-- Reference Images Section -->
        <div v-if="dressCode.dressCodeImages?.length">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl flex items-center justify-center"
            >
              <Image class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Reference Images</h3>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="(image, index) in dressCode.dressCodeImages"
              :key="index"
              class="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 cursor-pointer"
              @click="openImagePreview(image)"
            >
              <img
                :src="typeof image.imagePath === 'string' ? image.imagePath : ''"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                alt="Dress code reference"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <div class="absolute bottom-4 left-4 right-4">
                  <div class="flex items-center justify-center gap-2 text-white">
                    <Image class="w-4 h-4" />
                    <span class="text-sm font-medium">View Image</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showImageModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        @click="closeImagePreview"
      >
        <div class="relative max-w-4xl w-full" @click.stop>
          <button
            class="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            @click="closeImagePreview"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            v-if="selectedImage"
            :src="typeof selectedImage.imagePath === 'string' ? selectedImage.imagePath : ''"
            class="w-full h-auto rounded-2xl shadow-2xl"
            alt="Dress code reference"
          />
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <CConfirmModal
      v-model="showDeleteModal"
      title="Delete Dress Code"
      message="Are you sure you want to delete this dress code? This action cannot be undone."
      @confirm="deleteDressCode"
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
          class="rounded-2xl shadow-2xl backdrop-blur-lg border p-4 flex items-center gap-3 bg-green-50/95 border-green-200 dark:bg-green-900/95 dark:border-green-700"
        >
          <div
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

          <p class="font-medium text-sm flex-1 text-green-800 dark:text-green-200">
            {{ toastMessage }}
          </p>

          <button
            class="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-green-200 dark:hover:bg-green-800 text-green-600 dark:text-green-300"
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

<style scoped>
/* Additional styling if needed */
</style>
