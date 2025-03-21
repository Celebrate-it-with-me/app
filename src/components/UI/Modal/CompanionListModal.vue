<script setup>
import CWMModal from '@/components/UI/Modal/CWMModal.vue'
import { ref, watch } from 'vue'

const emit = defineEmits(['closeModal'])
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const showModal = ref(props.open)

const handleClose = () => {
  emit('closeModal')
}


watch(() => props.open, (newValue) => {
  showModal.value = newValue
})
</script>

<template>
  <CWMModal :show-modal="showModal" @close="handleClose">
    <template #header> Companions List </template>

    <template #body>
      This is the companion list component.
    </template>

    <template #footer>
      <div
        class="flex justify-end"
      >
        <div class="action-container flex gap-x-2">
          <button
            type="button"
            class="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-2 px-6 rounded-md"
            @click="handleClose"
          >
            Close
          </button>
        </div>
      </div>
    </template>
  </CWMModal>
</template>

<style scoped></style>
