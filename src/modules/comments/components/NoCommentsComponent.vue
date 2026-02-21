<script setup>
import { MessageCircle, PlusCircle } from 'lucide-vue-next'
import CButton from '@/components/UI/buttons/CButton.vue'

const emit = defineEmits(['createComment'])

const addFirstComment = () => {
  emit('createComment')
}
</script>

<template>
  <div
    class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm"
  >
    <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
      <MessageCircle class="w-12 h-12 text-gray-400" />
    </div>
    <h3 class="text-2xl font-bold text-gray-900 mb-2">No comments yet</h3>
    <p class="text-gray-500 mb-8 text-center max-w-md">
      Add comments to communicate with your guests or keep notes about the event.
    </p>
    <CButton variant="gradient" class="px-8 h-12 rounded-xl" @click="addFirstComment">
      <PlusCircle class="w-5 h-5 mr-2" />
      Add First Comment
    </CButton>
  </div>
</template>

<style scoped></style>
