<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isPlaying = ref(true)
let audio = null

onMounted(() => {
  const audioSrc = new URL('@/assets/sound/enchanted.mp3', import.meta.url).href

  audio = new Audio(audioSrc)

  audio.loop = true
  audio.volume = 0.5
  audio.play()
})

onUnmounted(() => {
  audio.pause()
  audio = null
})

const togglePlayPause = () => {
  if (isPlaying.value) {
    audio.pause()
  } else {
    audio.play()
  }
  isPlaying.value = !isPlaying.value
}
</script>

<template>
  <div class="fixed bottom-5 right-5 flex items-center rounded-lg">
    <button
      class="w-10 h-10 bg-gradient-to-r from-pink-400 to-red-400 flex items-center justify-center rounded-full text-white opacity-30 hover:opacity-30 transition-opacity"
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
