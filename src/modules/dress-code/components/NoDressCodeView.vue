<script setup>
import { Plus, Shirt } from 'lucide-vue-next'
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'

const emit = defineEmits(['showDressCodeForm'])

const createDressCode = () => {
  emit('showDressCodeForm', true)
}
</script>

<template>
  <CCard class="mb-6">
    <div class="flex flex-col items-center justify-center py-12">
      <Shirt class="w-16 h-16 text-gray-400 mb-4" />
      <h3 class="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
        No dress code has been defined for this event yet.
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
        Define a dress code to help your guests know what to wear to your event.
      </p>
      <CButton variant="gradient" class="mt-2" @click="createDressCode">
        <Plus class="w-4 h-4 mr-2" />
        Create Dress Code
      </CButton>
    </div>
  </CCard>
</template>

<style scoped></style>
