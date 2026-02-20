<template>
  <CCard class="w-full max-w-5xl mx-auto">
    <template #title>Select Photos for This Location</template>

    <div class="space-y-6">
      <!-- Loader -->
      <div v-if="loading" class="flex justify-center py-10">
        <span class="text-sm text-gray-500">Loading photos from Google...</span>
      </div>

      <!-- Google Photos -->
      <div
        v-else-if="photos.length"
        :key="renderKey"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <div
          v-for="(photo, index) in photos"
          :key="index"
          class="relative group rounded overflow-hidden border shadow-md"
        >
          <img :src="photo.url" class="w-full h-40 object-cover" alt="Place Image" />

          <button
            class="absolute top-2 right-2 bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-gray-100"
            title="Remove Photo"
            type="button"
            @click="removePhoto(index)"
          >
            ✖
          </button>
        </div>
      </div>

      <div v-else class="text-sm text-gray-400 italic">No photos available for this location.</div>

      <!-- Upload Custom Images -->
      <div class="mt-8">
        <div class="text-base font-medium mb-2">Upload Your Own</div>
        <CUploadFile @add-photos="addUploadedPhotos" />
      </div>
    </div>
  </CCard>
</template>

<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CUploadFile from '@/components/UI/form2/CUploadFile.vue'
import { useLocationImages } from '@/modules/locations/composables/useLocationImages'

const props = defineProps({
  placeId: { type: String, required: true },
  modelValue: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

const { renderKey, loading, photos, removePhoto, addUploadedPhotos } = useLocationImages(
  props,
  emit
)
</script>
