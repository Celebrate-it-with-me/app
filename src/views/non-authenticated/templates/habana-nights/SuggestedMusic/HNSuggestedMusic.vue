<script setup>
import { computed } from 'vue'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import CFCWMSuggestedMusic from '@/views/non-authenticated/templates/habana-nights/SuggestedMusic/CFCWMSuggestedMusic.vue'

const templateStore = useTemplateStore()

const suggestedMusic = computed(() => {
  return {
    isEnabled: true,
    backgroundColor: '#fff',
    title: 'Music',
    subTitle: 'Compartan sus canciones favoritas para que suenen en el evento',
    mainColor: '#FECACA',
    secondaryColor: '#B3A383FF',
    usePreview: true,
    useVoteSystem: true
  }
})
</script>

<template>
  <div
    v-if="suggestedMusic?.isEnabled"
    id="sectionSong"
    class="suggested-music w-full flex flex-col justify-start items-center h-full min-h-screen mb-20 md:pt-20"
    :style="{ backgroundColor: suggestedMusic.backgroundColor }"
  >
    <CFCWMSuggestedMusic
      :mode="'normal'"
      :event="templateStore.event"
      :title="suggestedMusic.title"
      :sub-title="suggestedMusic.subTitle"
      :main-color="suggestedMusic.mainColor"
      :secondary-color="suggestedMusic.secondaryColor"
      :use-preview="suggestedMusic.usePreview"
      :use-vote-system="suggestedMusic.useVoteSystem"
    />
  </div>
</template>
