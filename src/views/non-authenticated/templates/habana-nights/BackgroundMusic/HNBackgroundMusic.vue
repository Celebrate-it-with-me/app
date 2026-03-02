<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

const props = defineProps({
  config: { type: Object, default: () => ({}) }
})

const musicConfig = computed(() => props.config?.sections?.backgroundMusic || {})

const isEnabled = computed(() => musicConfig.value?.isEnabled ?? true)
const autoplay = computed(() => musicConfig.value?.autoplay ?? true)
const volume = computed(() => musicConfig.value?.volume ?? 0.5)
const src = computed(() => {
  return musicConfig.value?.src || new URL('@/assets/sound/red.mp3', import.meta.url).href
})

const isPlaying = ref(false)
let audio = null

const initAudio = () => {
  if (!isEnabled.value) return

  audio = new Audio(src.value)
  audio.loop = true
  audio.volume = volume.value

  if (autoplay.value) {
    audio
      .play()
      .then(() => {
        isPlaying.value = true
      })
      .catch(() => {
        isPlaying.value = false
      })
  }
}

onMounted(() => {
  initAudio()
})

onUnmounted(() => {
  if (audio) {
    audio.pause()
    audio = null
  }
})

watch(volume, newVal => {
  if (audio) audio.volume = newVal
})

const togglePlayPause = () => {
  if (!audio) return

  if (isPlaying.value) {
    audio.pause()
  } else {
    audio.play()
  }

  isPlaying.value = !isPlaying.value
}
</script>

<template>
  <div v-if="isEnabled" class="fixed bottom-5 left-5 flex items-center rounded-lg z-50">
    <button
      class="w-10 h-10 bg-[var(--hn-coral)] border border-[color:rgba(212,175,55,0.45)] flex items-center justify-center rounded-full text-white shadow-lg hover:bg-[var(--hn-gold)] hover:text-black transition-all focus:outline-none"
      @click="togglePlayPause"
    >
      <span v-if="!isPlaying">▶</span>
      <span v-else>⏸</span>
    </button>
  </div>
</template>

<style scoped>
@media (max-width: 600px) {
  div {
    font-size: 0.9rem;
  }
}
</style>
