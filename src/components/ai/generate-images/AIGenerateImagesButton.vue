<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import { Sparkles } from 'lucide-vue-next'
import { ref } from 'vue'
import { useDressCodeStore } from '@/modules/dress-code/stores/useDressCodeStore'

const emit = defineEmits(['imagesGenerated', 'images-generated'])
const props = defineProps({
  dressType: {
    type: String,
    required: false,
    default: ''
  }
})

const dressCodeStore = useDressCodeStore()
const loading = ref(false)

const generateImages = async () => {
  try {
    loading.value = true

    const response = await dressCodeStore.generateAIImages(props.dressType)

    emit('images-generated', response)
  } catch (error) {
    console.error('Error generating AI images:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <CButton
      :disabled="loading"
      variant="primary"
      class="flex items-center gap-2"
      @click="generateImages"
    >
      <Sparkles class="w-4 h-4" />
      {{ loading ? 'Generating...' : 'Generate with AI' }}
    </CButton>
  </div>
</template>
