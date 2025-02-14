<script setup>
import CWMModal from '@/views/non-authenticated/templates/butterfly-vision/Modal/CWMModal.vue'
import { ref, watch } from 'vue'
import { useTemplateStore } from '@/stores/useTemplateStore'

const emit = defineEmits(['close'])
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})
const showModal = ref(props.show)
const templateStore = useTemplateStore()
const { guest } = templateStore

const handleClose = () => {
  emit('close')
}

watch(() => props.show, (newValue) => {
  showModal.value = newValue
})

</script>

<template>
  <CWMModal
    :show-modal="showModal"
    @close="handleClose"
  >
    <template #header>
      <div class="flex items-center text-lg text-gray-800 dark:text-gray-200">
        Companions Details
      </div>
    </template>



  </CWMModal>
</template>

<style scoped>

</style>
