<template>
  <div class="w-full">
    <!-- Preview Section -->
    <div v-if="previews.length > 0" class="mb-6">
      <h3 class="text-lg font-semibold mb-3 text-gray-700">Preview</h3>
      <div class="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4">
        <ImageBox
          v-for="(preview, index) in previews"
          :key="index"
          :index="index"
          :preview="preview"

          @file-removed="removeImage"
        />
      </div>
    </div>
    <!-- Error Messages -->
    <div
      v-if="errorMessage"
      class="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 mb-4"
    >
      {{ errorMessage }}
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
        :disabled="!updatedNeeded"
        v-if="showUploadButton"
        class="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 px-6 rounded-md"
        :class="{
          'opacity-50 cursor-not-allowed': !updatedNeeded
        }"
        @click="handleRequest"
      >
        <span v-if="mode === 'create'">
          Save Images
        </span>
        <span v-else>
          Update Images
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import ImageBox from '@/components/authenticated/sweet-memories/ImageBox.vue'

//Emits and Props
const emit = defineEmits(['filesSelected', 'fileRemoved', 'uploadImages', 'updateImages'])
const props = defineProps({
  maxFileSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  },
  maxFiles: {
    type: Number,
    default: 10
  },
  initialFiles: {
    type: Array,
    default: () => []
  },
  mode: {
    type: String,
    default: 'create'
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

const updatedNeeded = computed(() => {
  if (props.mode === 'create') {
    return true
  }

  return previews.value.some((image) => !image.isExisting)
})

onMounted(() => {
  if (props.initialFiles.length > 0) {
    previews.value = props.initialFiles
  }
})


// Methods
const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
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

const removeImage = (index) => {
  const removedFile = previews.value[index]
  previews.value.splice(index, 1)
  emit('file-removed', removedFile)
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
          file: file,
          isExisting: false
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

const handleRequest = () => {
  if (props.mode === 'create') {
    return uploadImages()
  }
  return updateImages()
}

const uploadImages = () => {
  emit('uploadImages', previews.value)
}

const updateImages = () => {
  emit('updateImages', previews.value.filter((img) => !img.isExisting))
}

watch(() => props.initialFiles, (newValue) => {
  previews.value = newValue
}, {
  deep: true,
  immediate: true
})

</script>
