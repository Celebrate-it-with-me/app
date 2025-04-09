<template>
  <div class="w-full">
    <!-- Preview Section -->
    <div v-if="previews.length > 0" class="mb-6">
      <h3 class="text-lg font-semibold mb-3 text-gray-700">Preview</h3>
      <div class="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4">
        <div
          v-for="(preview, index) in previews"
          :key="index"
          class="relative group rounded-lg overflow-hidden"
        >
          <img
            :src="preview.url"
            class="w-full h-24 object-cover"
            :alt="`Preview ${index + 1}`"
          />

          <!-- Overlay with Remove Button -->
          <div class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              @click="removeImage(index)"
              class="bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600 transition-colors"
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
        </div>
      </div>
    </div>
    <!-- Drag & Drop Zone -->
    <div
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      :class="[
        'w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        isDragging
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-300 hover:border-purple-400'
      ]"
      @click="triggerFileInput"
    >
      <input
        type="file"
        ref="fileInput"
        @change="handleFileSelect"
        accept="image/*"
        multiple
        class="hidden"
      />

      <div class="flex flex-col items-center justify-center">
        <!-- Upload Icon -->
        <svg
          class="w-12 h-12 mb-4 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p class="mb-2 text-lg font-semibold text-gray-700">
          Drop your images here or click to upload
        </p>
        <p class="text-sm text-gray-500">
          Supported formats: PNG, JPG, GIF (Max 5MB)
        </p>
      </div>
    </div>

    <div class="mt-4">
      <button
        v-if="showUploadButton"
        class="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 px-6 rounded-md"
        @click="uploadImages"
      >
        Save Images
      </button>
    </div>

    <!-- Error Messages -->
    <div
      v-if="errorMessage"
      class="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

//Emits and Props
const emit = defineEmits(['filesSelected', 'fileRemoved', 'uploadImages'])
const props = defineProps({
  maxFileSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  },
  maxFiles: {
    type: Number,
    default: 10
  }
})

// Data
const fileInput = ref(null)
const isDragging = ref(false)
const previews = ref([])
const errorMessage = ref('')

// Computed Properties
const showUploadButton = computed(() => {
  return previews.value.length > 0
})

// Methods
const handleDragOver = (event) => {
  isDragging.value = true
}

const handleDragLeave = (event) => {
  isDragging.value = false
}

const validateFile = (file) => {
  // Check file size
  if (file.size > props.maxFileSize) {
    errorMessage.value = `File ${file.name} is too large. Maximum size is ${formatFileSize(props.maxFileSize)}`
    return false
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    errorMessage.value = `File ${file.name} is not an image`
    return false
  }

  return true
}

const handleFiles = (files) => {
  errorMessage.value = ''

  // Check max files limit
  if (previews.value.length + files.length > props.maxFiles) {
    errorMessage.value = `Maximum ${props.maxFiles} files allowed`
    return
  }

  Array.from(files).forEach(file => {
    if (validateFile(file)) {
      const reader = new FileReader()

      reader.onload = (e) => {
        previews.value.push({
          url: e.target.result,
          name: file.name,
          size: file.size,
          file: file
        })
      }

      reader.readAsDataURL(file)
    }
  })

  // Emit selected files
  emit('filesSelected', files)
}

const handleDrop = (event) => {
  isDragging.value = false
  const files = event.dataTransfer.files
  handleFiles(files)
}

const handleFileSelect = (event) => {
  const files = event.target.files
  handleFiles(files)
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const removeImage = (index) => {
  const removedFile = previews.value[index]
  previews.value.splice(index, 1)
  emit('file-removed', removedFile)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const uploadImages = () => {
  emit('uploadImages', previews.value)
}

</script>
