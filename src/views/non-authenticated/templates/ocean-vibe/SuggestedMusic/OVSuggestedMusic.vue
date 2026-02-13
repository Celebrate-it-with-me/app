<script setup>
import { computed, onMounted, watch } from 'vue'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import OVCWMSuggestedMusic from '@/views/non-authenticated/templates/ocean-vibe/SuggestedMusic/OVCWMSuggestedMusic.vue'
import { useSuggestedMusicPublicStore } from '@/stores/publicEvents/useSuggestedMusicPublicStore'

const templateStore = useTemplateStore()
const suggestedMusicStore = useSuggestedMusicPublicStore()

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

const getAvailableVotes = async (eventId, guestCode) => {
  if (guestCode) {
    return await suggestedMusicStore.getAvailableVotes(eventId, guestCode)
  }
}

watch(
  () => templateStore.accessCode,
  async newValue => {
    await getAvailableVotes(templateStore.eventId, newValue)
  }
)

onMounted(async () => {
  await getAvailableVotes(templateStore.eventId, templateStore.accessCode)
})
</script>

<template>
  <div
    v-if="suggestedMusic?.isEnabled"
    id="sectionSong"
    class="suggested-music w-full flex flex-col justify-start items-center min-h-[50vh] pb-10 md:pt-20"
    :style="{ backgroundColor: suggestedMusic.backgroundColor }"
  >
    <OVCWMSuggestedMusic
      :mode="'normal'"
      :event="templateStore.event"
      :title="suggestedMusic.title"
      :sub-title="suggestedMusic.subTitle"
      :main-color="suggestedMusic.mainColor"
      :secondary-color="suggestedMusic.secondaryColor"
      :use-preview="suggestedMusic.usePreview"
      :use-vote-system="suggestedMusic.useVoteSystem"
      class="relative z-10"
    />
  </div>
</template>
