<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { Image as ImageIcon } from 'lucide-vue-next'

const emit = defineEmits(['addFirstMemory'])

const addFirstMemory = () => {
  emit('addFirstMemory')
}
</script>

<template>
  <CCard class="mb-6">
    <div class="p-8 text-center">
      <ImageIcon class="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No memories yet</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Start creating your sweet memories timeline by adding your first memory.
      </p>
      <CButton variant="primary" class="flex items-center mx-auto" @click="addFirstMemory">
        <Plus class="w-5 h-5 mr-2" />
        Add Your First Memory
      </CButton>
    </div>
  </CCard>
</template>

<style scoped></style>
