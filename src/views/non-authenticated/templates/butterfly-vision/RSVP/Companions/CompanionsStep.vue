<script setup>
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import { computed } from 'vue'
import NoCompanions from '@/views/non-authenticated/templates/butterfly-vision/RSVP/Companions/NoCompanions.vue'
import Companions from '@/views/non-authenticated/templates/butterfly-vision/RSVP/Companions/Companions.vue'

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
    <NoCompanions v-if="!hasCompanions" @go-to-previous="handlePrevious" @go-to-next="handleNext" />

    <Companions v-if="hasCompanions" @go-to-previous="handlePrevious" @go-to-next="handleNext" />
  </div>
</template>

<style scoped></style>
