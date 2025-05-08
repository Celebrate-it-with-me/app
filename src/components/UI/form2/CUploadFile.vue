<template>
  <div class="flex justify-center">
    <input
      type="file"
      ref="fileInput"
      multiple
      accept="image/jpeg,image/png,image/webp"
      class="hidden"
      @change="handleFileChange"
    />
    <CButton @click="triggerFileInput" variant="outline">
      {{ buttonLabel }}
    </CButton>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CButton from '@/components/UI/buttons/CButton.vue'

const emit = defineEmits(['addPhotos'])

defineProps({
  buttonLabel: {
    type: String,
    default: 'Add Custom Photos',
  }
})

const fileInput = ref(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (event) => {
  const files = Array.from(event.target.files)

  const uploadedPhotos = files
    .filter(file => file && file.type.startsWith('image/'))
    .map(file => ({
      type: 'uploaded',
      file: file,
      url: URL.createObjectURL(file),
    }))

  emit('addPhotos', uploadedPhotos)

  event.target.value = '' // Reset input
}
</script>
