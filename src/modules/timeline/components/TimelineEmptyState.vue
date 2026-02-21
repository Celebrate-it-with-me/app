<template>
  <CCard class="mb-6">
    <div class="flex flex-col items-center justify-center py-12 px-4">
      <Calendar class="w-16 h-16 text-gray-400 mb-4" />
      <h3 class="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
        You haven't added any timeline items yet.
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
        Create a timeline to help your guests know what to expect during your event.
      </p>
      <CButton variant="gradient" class="mt-2" @click="$emit('add')">
        <PlusCircle class="w-4 h-4 mr-2" />
        Add First Timeline Entry
      </CButton>
    </div>
  </CCard>
</template>

<script setup>
import { Calendar, PlusCircle } from 'lucide-vue-next'
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'

defineEmits(['add'])
</script>
