<script setup>

import SweetMemoryNameModal from '@/components/UI/Modal/SweetMemoryNameModal.vue'
import { ref } from 'vue'

const emit = defineEmits(['fileRemoved'])
defineProps({
  preview: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})

// Data
const showEditName = ref(false)

// Methods
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const removeImage = (index) => {
  emit('fileRemoved', index)
}

const handleShowEditName = () => {
  showEditName.value = true
}

const handleHideEditName = () => {
  showEditName.value = false
}


</script>

<template>
  <div
    class="relative group rounded-lg overflow-hidden"
  >
    <img
      :src="preview.url"
      class="w-full h-24 object-cover"
      :alt="`Preview ${index + 1}`"
    />

    <!-- Overlay with Remove Button -->
    <div class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100
                      transition-opacity flex items-center justify-center flex flex-col gap-y-2"
    >
      <button
        v-if="preview.id"
        class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600
                      transition-colors mr-2"
        @click="handleShowEditName"
      >
        Edit Name
      </button>

      <button
        @click="removeImage(index)"
        class="bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600
                      transition-colors"
      >
        Remove
      </button>
    </div>

    <!-- File Name -->
    <p class="text-sm text-gray-600 mt-1 truncate">
      {{ preview.name }}
    </p>

    <!-- File Size -->
    <p class="text-xs text-gray-500">
      {{ formatFileSize(preview.size) }}
    </p>

    <SweetMemoryNameModal
      :open="showEditName"
      :image-file="preview"
      @close-modal="handleHideEditName"
    />
  </div>
</template>

<style scoped>

</style>
