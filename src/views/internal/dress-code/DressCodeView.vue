<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Event Dress Code</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">Define the dress code requirements for your event</p>
    </div>

    <!-- Empty State -->
    <CCard v-if="!hasDressCode" class="mb-6">
      <div class="flex flex-col items-center justify-center py-12">
        <Shirt class="w-16 h-16 text-gray-400 mb-4" />
        <h3 class="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No dress code has been defined for this event yet.</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
          Define a dress code to help your guests know what to wear to your event.
        </p>
        <CButton variant="primary" class="mt-2">
          <Plus class="w-4 h-4 mr-2" />
          Create Dress Code
        </CButton>
      </div>
    </CCard>

    <!-- Dress Code Form -->
    <CCard v-else class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Dress Code Type -->
        <div class="col-span-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <div class="flex items-center gap-2">
              <span>Dress Code Type</span>
            </div>
          </label>
          <CSelect
            v-model="dressCodeType"
            :options="dressCodeOptions"
            placeholder="Select dress code type"
            class="w-full"
            id="dressCodeType"
            name="dressCodeType"
          />
        </div>

        <!-- Reserved Colors -->
        <div class="col-span-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <div class="flex items-center gap-2">
              <Palette class="w-5 h-5" />
              <span>Reserved Colors</span>
            </div>
          </label>
          <div class="flex flex-wrap gap-3">
            <div
              v-for="(color, index) in selectedColors"
              :key="index"
              class="relative"
            >
              <div
                class="w-10 h-10 rounded-full border border-gray-300 cursor-pointer"
                :style="{ backgroundColor: color }"
              ></div>
              <button
                class="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-0.5 border border-gray-300 dark:border-gray-600"
                @click="removeColor(index)"
              >
                <X class="w-3 h-3 text-gray-500" />
              </button>
            </div>
            <button
              @click="addColor"
              class="w-10 h-10 rounded-full border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400"
            >
              <Plus class="w-5 h-5" />
            </button>
          </div>
          <input
            type="color"
            v-model="colorPickerValue"
            class="hidden"
            ref="colorPicker"
          />
        </div>

        <!-- Description -->
        <div class="col-span-1 md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <div class="flex items-center gap-2">
              <FileText class="w-5 h-5" />
              <span>Description</span>
            </div>
          </label>
          <CTextarea
            v-model="description"
            placeholder="Provide details about the dress code requirements..."
            rows="4"
            class="w-full"
            name="description"
            id="description"
          />
        </div>

        <!-- Image Upload -->
        <div class="col-span-1 md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <div class="flex items-center gap-2">
              <Image class="w-5 h-5" />
              <span>Reference Images</span>
            </div>
          </label>
          <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              class="hidden"
              ref="fileInput"
              @change="handleFileUpload"
            />
            <button
              @click="$refs.fileInput.click()"
              class="flex flex-col items-center justify-center w-full h-full cursor-pointer"
            >
              <Upload class="w-10 h-10 text-gray-400 mb-2" />
              <span class="text-sm text-gray-500 dark:text-gray-400">
                Click to upload or drag and drop
              </span>
              <span class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                PNG, JPG, GIF up to 10MB
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 mt-8">
        <CButton variant="outline">Cancel</CButton>
        <CButton variant="primary">Save Dress Code</CButton>
      </div>
    </CCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Shirt,
  Palette,
  Image,
  FileText,
  Plus,
  X,
  Upload
} from 'lucide-vue-next'
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'

// Toggle between empty state and form for demo purposes
const hasDressCode = ref(true)

// Form data
const dressCodeType = ref('')
const description = ref('')
const selectedColors = ref(['#FF5733', '#33FF57', '#3357FF'])
const colorPickerValue = ref('#000000')
const fileInput = ref(null)
const colorPicker = ref(null)

// Dress code options
const dressCodeOptions = [
  { label: 'Formal', value: 'formal' },
  { label: 'Semi-formal', value: 'semi-formal' },
  { label: 'Casual', value: 'casual' },
  { label: 'Thematic', value: 'thematic' },
  { label: 'Black Tie', value: 'black-tie' }
]

// Methods
const addColor = () => {
  colorPicker.value.click()
  colorPicker.value.onchange = () => {
    selectedColors.value.push(colorPickerValue.value)
  }
}

const removeColor = (index) => {
  selectedColors.value.splice(index, 1)
}

const handleFileUpload = (event) => {
  // Handle file upload logic here
  console.log('File uploaded:', event.target.files[0])
}
</script>
