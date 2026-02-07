<script setup>
import { reactive, defineEmits, defineProps, computed, ref } from 'vue'
import { Trash2, Save, X } from 'lucide-vue-next'

import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import CImageUpload from '@/components/UI/form2/CImageUpload.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { Form } from 'vee-validate'
import { useSweetMemoriesStore } from '@/stores/useSweetMemoriesStore'

const formErrors = ref(null)
const sending = ref(false)
const sweetMemoriesStore = useSweetMemoriesStore()

const isDragging = ref(false)
const imagePreview = ref(null)
const selectedFile = ref(null)
const fileInput = ref(null)
const showPreview = ref(false)

const errors = ref({
  image: ''
})

const completionPercentage = computed(() => {
  let completed = 0
  const total = 4 // total required/important fields

  if (imagePreview.value || memory.imagePath) completed++
  if (memory.title && memory.title.trim()) completed++
  if (memory.description && memory.description.trim()) completed++
  if (memory.year && String(memory.year).trim()) completed++

  return Math.round((completed / total) * 100)
})

const hasContent = computed(() => {
  return (memory.title && memory.title.trim()) || (memory.description && memory.description.trim()) || imagePreview.value || memory.imagePath
})

const emit = defineEmits(['save', 'delete', 'cancel'])
const props = defineProps({
  initialMemory: {
    type: Object,
    default: () => ({
      id: null,
      imagePath: '',
      title: '',
      description: '',
      year: '',
      visible: true
    })
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const validationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      title: zod
        .string({
          required_error: 'Title is required',
          invalid_type_error: 'Title must be a string'
        })
        .min(1, 'Title is required')
        .max(100, 'Title cannot exceed 100 characters'),
      year: zod.string().optional().nullable(),
      description: zod.string().max(500, 'Description cannot exceed 500 characters').optional().nullable(),
      visible: zod.boolean().optional().default(true)
    })
  )
})

const memory = reactive({
  ...props.initialMemory,
  image: []
})

const handleImageUpload = files => {
  if (files.length > 0) {
    const file = files[0]
    if (file instanceof File) {
      memory.imagePath = URL.createObjectURL(file)
    }
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
}

const processFile = (file) => {
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB')
    return
  }

  selectedFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)

  // Update form data
  memory.image = [file]
  // Note: we don't update memory.imagePath here yet as it's used for current saved image
}

const removeImage = () => {
  imagePreview.value = null
  selectedFile.value = null
  memory.imagePath = ''
  memory.image = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const validateForm = () => {
  errors.value = {
    image: ''
  }
  let isValid = true

  if (!imagePreview.value && !memory.imagePath) {
    errors.value.image = 'Please upload a photo for this memory'
    isValid = false
  }

  return isValid
}

const handleDelete = () => {
  emit('delete', memory)
}

const saveMemory = () => {
  emit('save', { ...memory })
}

const cancelEdit = () => {
  emit('cancel')
}

const onSubmit = async () => {
  if (!validateForm()) {
    return
  }
  sending.value = true
  formErrors.value = null

  try {
    let response
    if (props.isEditing) {
      response = await sweetMemoriesStore.updateSweetMemory(memory)
    } else {
      response = await sweetMemoriesStore.createSweetMemory(memory)
    }

    if (response.status >= 200 && response.status < 300) {
      emit('save', response.data.data)
    } else {
      invalidSubmit(response.data.errors || response.data)
    }
  } catch (error) {
    console.log(error)
  } finally {
    sending.value = false
  }
}

const invalidSubmit = errors => {
  formErrors.value = errors
  console.error('Form submission failed:', errors)
}
</script>

<template>
  <Form :validation-schema="validationSchema" :initial-values="memory" @submit="onSubmit" @invalid-submit="invalidSubmit">
    <!-- Progress Indicator -->
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-semibold text-gray-700">Form Completion</span>
        <span class="text-sm font-bold text-purple-600">{{ completionPercentage }}%</span>
      </div>
      <div class="w-full bg-white rounded-full h-3 shadow-inner">
        <div
          class="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
          :style="{ width: `${completionPercentage}%` }"
        >
          <span v-if="completionPercentage > 20" class="text-xs text-white font-bold">{{ completionPercentage }}%</span>
        </div>
      </div>
      <p class="text-xs text-gray-600 mt-2">
        {{ completionPercentage < 100 ? 'Complete all fields to save your memory' : 'Ready to save! 🎉' }}
      </p>
    </div>

    <!-- Preview Toggle -->
    <div v-if="hasContent" class="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-3 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          <span class="font-bold text-sm text-purple-900">Preview Mode</span>
        </div>
        <button
          @click="showPreview = !showPreview"
          type="button"
          class="text-purple-600 font-semibold text-sm hover:text-purple-700 transition-colors flex items-center gap-1.5"
        >
          {{ showPreview ? 'Hide Preview' : 'Show Preview' }}
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="showPreview ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Preview Card -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="showPreview" class="bg-white rounded-2xl p-6 border-l-4 border-purple-500 shadow-lg mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Preview Image -->
          <div class="relative overflow-hidden rounded-xl aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
            <img
              v-if="imagePreview || memory.imagePath"
              :src="imagePreview || memory.imagePath"
              alt="Preview"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>

          <!-- Preview Details -->
          <div class="flex flex-col justify-between">
            <div class="flex items-start justify-between border-b border-gray-100 pb-4 mb-4">
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-900 mb-1">
                  {{ memory.title || 'Untitled Memory' }}
                </h3>
                <p v-if="memory.description" class="text-sm text-gray-600 italic">
                  "{{ memory.description }}"
                </p>
              </div>
              <span v-if="memory.year" class="ml-3 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold shadow-md">
                {{ memory.year }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <svg v-if="memory.visible" class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-sm font-medium" :class="memory.visible ? 'text-green-600' : 'text-gray-500'">
                {{ memory.visible ? 'Visible to guests' : 'Hidden from guests' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Section 1: Photo Upload -->
    <div class="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-6">
      <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        Memory Photo
      </h3>

      <!-- Empty State - No Image -->
      <div
        v-if="!imagePreview && !memory.imagePath"
        @click="triggerFileInput"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        class="border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer"
        :class="isDragging ? 'border-purple-500 bg-purple-50' : 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-400'"
      >
        <div class="space-y-4">
          <div class="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center transition-transform" :class="isDragging ? 'scale-110' : ''">
            <svg class="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
          </div>
          <div>
            <p class="text-lg font-semibold text-gray-900 mb-1">
              Drop your photo here or <span class="text-purple-600 hover:text-purple-700">browse</span>
            </p>
            <p class="text-sm text-gray-500">
              JPG, PNG or WEBP • Max 5MB
            </p>
          </div>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          class="hidden"
        />
      </div>

      <!-- Image Preview State -->
      <div v-else class="relative group">
        <div class="relative overflow-hidden rounded-2xl aspect-video bg-gray-100">
          <img
            :src="imagePreview || memory.imagePath"
            alt="Memory preview"
            class="w-full h-full object-cover"
          />

          <!-- Hover Overlay with Actions -->
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
            <button
              @click="triggerFileInput"
              type="button"
              class="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              Change Photo
            </button>
            <button
              @click="removeImage"
              type="button"
              class="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Remove
            </button>
          </div>
        </div>

        <!-- File Info Badge -->
        <div v-if="selectedFile" class="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span class="text-sm font-semibold text-gray-900">
              {{ selectedFile.name }} • {{ formatFileSize(selectedFile.size) }}
            </span>
          </div>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          class="hidden"
        />
      </div>
      <!-- Validation message for Image -->
      <p v-if="errors.image" class="mt-2 text-sm text-red-600 flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        {{ errors.image }}
      </p>
    </div>

    <!-- Section 2: Memory Details -->
    <div class="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-6">
      <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        Memory Details
      </h3>

      <div class="space-y-6">
        <!-- Title Input -->
        <div class="space-y-2">
          <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            Title
            <span class="text-red-500 text-base">*</span>
          </label>
          <div class="relative">
            <CInput
              v-model="memory.title"
              name="title"
              id="title"
              placeholder="e.g., First Day of School"
              show-error
              @reset-errors="formErrors = null"
            >
              <template #icon>
                <svg class="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </template>
            </CInput>
          </div>
          <p v-if="formErrors?.title" class="text-sm text-red-600 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ Array.isArray(formErrors.title) ? formErrors.title[0] : formErrors.title }}
          </p>
          <p v-else-if="!errors.title" class="text-xs text-gray-500">Give this memory a meaningful title</p>
        </div>

        <!-- Year or Age Input -->
        <div class="space-y-2">
          <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Year or Age
            <span class="text-gray-400 font-normal text-xs">(Optional)</span>
          </label>
          <div class="relative">
            <CInput
              v-model="memory.year"
              name="year"
              id="year"
              placeholder="e.g., 2024 or '5 years old'"
              show-error
              @reset-errors="formErrors = null"
            >
              <template #icon>
                <svg class="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </template>
            </CInput>
          </div>
          <p v-if="formErrors?.year" class="text-sm text-red-600 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ Array.isArray(formErrors.year) ? formErrors.year[0] : formErrors.year }}
          </p>
          <p v-else class="text-xs text-gray-500">Enter the year (e.g., 2024) or age (e.g., 5 years old) when this happened</p>
        </div>

        <!-- Description with Character Count -->
        <div class="space-y-2">
          <label class="flex items-center justify-between">
            <span class="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
              </svg>
              Description
              <span class="text-gray-400 font-normal text-xs">(Optional)</span>
            </span>
            <span class="text-xs font-semibold" :class="memory.description?.length > 500 ? 'text-red-500' : 'text-gray-500'">
              {{ memory.description?.length || 0 }}/500
            </span>
          </label>
            <CTextarea
              v-model="memory.description"
              name="description"
              id="description"
              :rows="4"
              placeholder="Share the story behind this memory..."
              show-error
              @reset-errors="formErrors = null"
            />
          <p v-if="formErrors?.description" class="text-sm text-red-600 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ Array.isArray(formErrors.description) ? formErrors.description[0] : formErrors.description }}
          </p>
          <p v-else class="text-xs text-gray-500">Tell the story behind this special moment</p>
        </div>
      </div>
    </div>

    <!-- Section 3: Visibility Settings -->
    <div class="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-6">
      <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
        Visibility Settings
      </h3>

      <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
        <div class="flex items-start gap-4">
          <div class="flex-1">
            <h4 class="font-bold text-gray-900 mb-1 flex items-center gap-2">
              Memory Visibility
            </h4>
            <p class="text-sm text-gray-600 mb-4">
              Control whether guests can see this memory in the timeline
            </p>
            <div class="flex items-center gap-3">
              <CToggle
                v-model="memory.visible"
                name="visible"
                id="visible"
                show-error
                @reset-errors="formErrors = null"
              />
              <div class="flex items-center gap-2">
                <svg v-if="memory.visible" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <svg v-else class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
                <span class="font-semibold text-base" :class="memory.visible ? 'text-green-600' : 'text-gray-500'">
                  {{ memory.visible ? 'Visible to guests' : 'Hidden from guests' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-end gap-3 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
      <CButton
        v-if="isEditing"
        variant="danger"
        size="md"
        class="flex items-center px-6"
        @click="handleDelete"
      >
        <Trash2 class="w-4 h-4 mr-2" />
        Delete
      </CButton>
      <CButton
        variant="secondary"
        size="md"
        class="flex items-center px-6"
        @click="cancelEdit"
      >
        <X class="w-4 h-4 mr-2" />
        Cancel
      </CButton>
      <CButton
        variant="primary"
        size="md"
        class="flex items-center px-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-none shadow-md transform transition-all active:scale-95"
        type="submit"
        :loading="sending"
      >
        <Save class="w-4 h-4 mr-2" />
        Save Memory
      </CButton>
    </div>
  </Form>
</template>
