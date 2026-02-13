<script setup>
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import { computed } from 'vue'
import CFNoCompanions from '@/views/non-authenticated/templates/cuban-flow/RSVP/Companions/CFNoCompanions.vue'
import CFCompanions from '@/views/non-authenticated/templates/cuban-flow/RSVP/Companions/CFCompanions.vue'

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
    <CFNoCompanions
      v-if="!hasCompanions"
      @go-to-previous="handlePrevious"
      @go-to-next="handleNext"
    />

    <CFCompanions v-if="hasCompanions" @go-to-previous="handlePrevious" @go-to-next="handleNext" />
  </div>
</template>

<style scoped></style>
