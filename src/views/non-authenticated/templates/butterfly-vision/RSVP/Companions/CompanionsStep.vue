<script setup>
import { useTemplateStore } from '@/stores/useTemplateStore'
import { computed } from 'vue'
import NoCompanions from '@/views/non-authenticated/templates/butterfly-vision/RSVP/Companions/NoCompanions.vue'
import NamedCompanions from '@/views/non-authenticated/templates/butterfly-vision/RSVP/Companions/NamedCompanions.vue'

const emit = defineEmits(['goToPrevious', 'goToNext'])
const templateStore = useTemplateStore()

const companionType = computed(() => {
  return templateStore.guest?.companionType ?? ''
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
  <NoCompanions
    v-if="companionType === 'no-companions'"
  />

  <NamedCompanions
    v-if="companionType === 'named'"
    @go-to-previous="handlePrevious"
    @go-to-next="handleNext"
  />
</div>
</template>

<style scoped>

</style>
