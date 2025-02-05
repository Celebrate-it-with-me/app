<script setup>
import CWMSuggestedMusic from '@/components/authenticated/suggest-music/SuggestedMusic/CWMSuggestedMusic.vue'
import CWMSuggestedMusicCreator
  from '@/components/authenticated/suggest-music/SuggestedMusic/CWMSuggestedMusicCreator.vue'
import { ref } from 'vue'


const suggestedMusic = ref(false)

const handleUpdatedMusic = (newValue) => {
  suggestedMusic.value = newValue
}
</script>

<template>
  <section class="event-rsvp">
    <div
      class="my-events-container mt-2 border-2 border-gray-200/10 p-10 rounded-md min-h-[300px] h-full"
    >
      <div
        class="flex flex-row gap-x-4 "
      >
        <CWMSuggestedMusicCreator
          @update:updated-state="handleUpdatedMusic"
        />

        <CWMSuggestedMusic
          v-if="suggestedMusic.useSuggestedMusic"

          :mode="'normal'"
          :title="suggestedMusic.title"
          :sub-title="suggestedMusic.subTitle"
          :main-color="suggestedMusic.mainColor"
          :secondary-color="suggestedMusic.secondaryColor"
          :use-preview="suggestedMusic.usePreview"
          :use-vote-system="suggestedMusic.useVoteSystem"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>

</style>
