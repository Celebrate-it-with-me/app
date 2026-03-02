<script setup>
import { computed } from 'vue'
import HNCWMSuggestedMusic from '@/views/non-authenticated/templates/habana-nights-v2/SuggestedMusic/HNCWMSuggestedMusic.vue'
import bgMusicImg from '@/assets/images/SuggestedMusic/bgsm_6049.png'

const props = defineProps({
  config: { type: Object, default: () => ({}) }
})

const suggestedMusic = computed(() => ({
  isEnabled: true,
  backgroundColor: 'transparent',
  title: 'Suggested Music',
  subTitle: 'Sugiere canciones para que suenen durante la noche',
  mainColor: '#D4AF37',
  secondaryColor: '#E85D4A',
  usePreview: true,
  useVoteSystem: false
}))

const bgMusicStyle = computed(() => ({
  backgroundImage: `url(${bgMusicImg})`
}))

const event = computed(() => props.config?.event || null)
</script>

<template>
  <section
    v-if="suggestedMusic?.isEnabled"
    id="sectionSong"
    class="hn-parallax-section hn-music-section relative w-full"
    aria-label="Suggested Music"
  >
    <div class="hn-parallax-bg hn-music-bg absolute inset-0" :style="bgMusicStyle"></div>

    <div class="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 py-16 lg:py-20">
      <div class="hn-music-glass w-full">
        <HNCWMSuggestedMusic
          :mode="'normal'"
          :event="event"
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
/* deja tu CSS igual */
.hn-music-section {
  min-height: 100vh;
  overflow: hidden;
}

.hn-music-bg {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  filter: brightness(0.82) saturate(0.65);
}

.hn-music-glass {
  background: rgba(17, 24, 39, 0.52);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(212, 175, 55, 0.22);
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  overflow: visible;
  padding: 2.25rem 1.25rem;
}

@media (min-width: 640px) {
  .hn-music-glass {
    padding: 2.75rem 2rem;
  }
}

@media (min-width: 1024px) {
  .hn-music-glass {
    padding: 3.25rem 2.5rem;
  }
}
</style>
