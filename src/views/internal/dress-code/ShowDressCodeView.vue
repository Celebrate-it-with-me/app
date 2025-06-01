<script setup>
import { FileText, Image, Palette, Pencil, Shirt } from 'lucide-vue-next'
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { useDressCodeStore } from '@/stores/useDressCodeStore'
import { computed } from 'vue'

const dressCodeStore = useDressCodeStore()
const dressCode = computed(() => dressCodeStore.dressCode)

// Map dress code type to a more readable format
const dressCodeTypeMap = {
  formal: 'Formal',
  'semi-formal': 'Semi-formal',
  casual: 'Casual',
  thematic: 'Thematic',
  'black-tie': 'Black Tie'
}

const formattedDressCodeType = computed(() => {
  return dressCodeTypeMap[dressCode.value.dressCodeType] || dressCode.value.dressCodeType
})

const emit = defineEmits(['editDressCode'])

// Function to handle edit button click
const handleEdit = () => {
  emit('editDressCode')
}
</script>

<template>
  <CCard class="mb-6">
    <div class="p-6">
      <!-- Header with Edit Button -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
          <Shirt class="w-6 h-6 mr-2 text-primary-600" />
          Event Dress Code
        </h2>
        <CButton variant="outline" class="flex items-center" @click="handleEdit">
          <Pencil class="w-4 h-4 mr-2" />
          Edit
        </CButton>
      </div>

      <!-- Dress Code Content -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Dress Code Type -->
        <div class="col-span-1">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Dress Code Type</h3>
          <p class="text-lg font-medium text-gray-900 dark:text-white">
            {{ formattedDressCodeType }}
          </p>
        </div>

        <!-- Reserved Colors -->
        <div class="col-span-1">
          <h3 class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            <Palette class="w-4 h-4 mr-1" />
            Reserved Colors
          </h3>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="(color, index) in dressCode?.reservedColors"
              :key="index"
              class="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
              :style="{ backgroundColor: color }"
            ></div>
            <div v-if="!dressCode.reservedColors?.length" class="text-gray-500 dark:text-gray-400">
              No reserved colors
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="col-span-1 md:col-span-2 mt-4">
          <h3 class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            <FileText class="w-4 h-4 mr-1" />
            Description
          </h3>
          <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {{ dressCode.description || 'No description provided' }}
          </p>
        </div>

        <!-- Reference Images -->
        <div
          v-if="dressCode.dressCodeImages && dressCode.dressCodeImages.length"
          class="col-span-1 md:col-span-2 mt-4"
        >
          <h3 class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            <Image class="w-4 h-4 mr-1" />
            Reference Images
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
            <div
              v-for="(image, index) in dressCode.dressCodeImages"
              :key="index"
              class="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
            >
              <img
                :src="typeof image.imagePath === 'string' ? image.imagePath : ''"
                class="w-full h-full object-cover"
                alt="Dress code reference"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </CCard>
</template>

<style scoped>
/* Additional styling if needed */
</style>
