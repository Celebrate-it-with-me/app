<script setup>
import CWMSuggestedMusic
  from '@/views/non-authenticated/templates/butterfly-vision/SuggestedMusic/CWMSuggestedMusic.vue'
import { computed } from 'vue'
import { useTemplateStore } from '@/stores/useTemplateStore'

const templateStore = useTemplateStore()

const suggestedMusic = computed(() => {
  return {
    isEnabled: true,
    backgroundColor: '#fff',
    title: 'Sugerencias de Canciones',
    subTitle: 'Envienos sus canciones preferidas para usarlas en el evento',
    mainColor: '#f3a40a',
    secondaryColor: '#B3A383FF',
    usePreview: true,
    useVoteSystem: true
  }
})

</script>

<template>
  <div
    id="sectionSong"
    v-if="suggestedMusic?.isEnabled"
    class="suggested-music w-full flex flex-col justify-start items-center h-full min-h-screen mb-20
          md:pt-20"
    :style="{backgroundColor: suggestedMusic.backgroundColor}"
  >
    <CWMSuggestedMusic
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
