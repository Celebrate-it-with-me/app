<script setup>
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import { computed } from 'vue'
import HNNoCompanions from '@/views/non-authenticated/templates/habana-nights/RSVP/Companions/HNNoCompanions.vue'
import HNCompanions from '@/views/non-authenticated/templates/habana-nights/RSVP/Companions/HNCompanions.vue'

const emit = defineEmits(['goToPrevious', 'goToNext'])
const templateStore = useTemplateStore()

const hasCompanions = computed(() => {
  return !templateStore.guest?.companions.length <= 0
})

const handlePrevious = () => {
  emit('goToPrevious')
}

const handleNext = () => {
  emit('goToNext')
}
</script>

<template>
  <div class="w-full">
    <HNNoCompanions
      v-if="!hasCompanions"
      @go-to-previous="handlePrevious"
      @go-to-next="handleNext"
    />

    <HNCompanions v-if="hasCompanions" @go-to-previous="handlePrevious" @go-to-next="handleNext" />
  </div>
</template>

<style scoped></style>
