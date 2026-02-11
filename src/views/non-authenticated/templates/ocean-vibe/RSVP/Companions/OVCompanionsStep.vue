<script setup>
import { useTemplateStore } from '@/stores/useTemplateStore'
import { computed } from 'vue'
import OVNoCompanions from '@/views/non-authenticated/templates/ocean-vibe/RSVP/Companions/OVNoCompanions.vue'
import OVCompanions from '@/views/non-authenticated/templates/ocean-vibe/RSVP/Companions/OVCompanions.vue'

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
    <OVNoCompanions
      v-if="!hasCompanions"
      @go-to-previous="handlePrevious"
      @go-to-next="handleNext"
    />

    <OVCompanions v-if="hasCompanions" @go-to-previous="handlePrevious" @go-to-next="handleNext" />
  </div>
</template>

<style scoped></style>
