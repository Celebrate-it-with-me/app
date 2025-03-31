<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useBackgroundMusicStore } from '@/stores/useBackgroundMusicStore'

const props = defineProps({
  origin: {
    type: String,
    default: 'admin'
  }
})

const backgroundMusicStore = useBackgroundMusicStore()
const isPlaying = ref(null)
let audio = null

const containerClasses = computed(() => {
  if (props.origin === 'admin') {
    return `w-full h-full m-2 flex ${buildPositions()}`
  }

  return 'fixed bottom-5 left-5 flex items-center rounded-lg'
})

const buttonClasses = computed(() => {
  if (props.origin === 'admin') {
    return `flex items-center justify-center rounded-full text-white hover:opacity-80
            transition-opacity`
  }

  return `w-10 h-10 bg-gradient-to-r from-pink-400 to-red-400 flex items-center
          justify-center rounded-full text-white hover:opacity-80 transition-opacity`
})

const buttonStyles = computed(() => {
  if (props.origin === 'admin') {
    return `width: ${backgroundMusicStore.iconSize};
            height: ${backgroundMusicStore.iconSize};
            background-color: ${backgroundMusicStore.iconColor};`
  }

  return ''
})

onMounted(() => {
  if (backgroundMusicStore.autoplay && backgroundMusicStore.songFile !== null) {
    initAudioInstance()
  }
})

onUnmounted(() => {
  if (audio != null) {
    audio.pause()
    audio = null
  }
})

const initAudioInstance = () => {
  let audioSrc = ''
  if (backgroundMusicStore.songFile instanceof File) {
    audioSrc = URL.createObjectURL(backgroundMusicStore.songFile)
  } else {
    audioSrc = backgroundMusicStore.songFile
  }

  if (audioSrc) {
    audio = new Audio(audioSrc)

    audio.loop = true
    audio.volume = 0.5
    isPlaying.value = false
    isPlaying.value = true
    audio.play()
  }
}

const destroyAudioInstance = () => {
    if (audio != null) {
      audio.pause() // Stop the playback
      audio.src = '' // Clear the audio source
      audio = null // Dereference for garbage collection
    }
}

const buildPositions = () => {
  if (backgroundMusicStore.iconPosition === 'top-left') {
    return 'justify-start items-start'
  }
  if (backgroundMusicStore.iconPosition === 'top-right') {
    return 'justify-end items-start'
  }
  if (backgroundMusicStore.iconPosition === 'bottom-left') {
    return 'justify-start items-end'
  }
  if (backgroundMusicStore.iconPosition === 'bottom-right') {
    return 'justify-end items-end'
  }

  return ''
}

const togglePlayPause = () => {
  if (isPlaying.value) {
    audio.pause()
  } else {
    audio.play()
  }
  isPlaying.value = !isPlaying.value
}

watch(
  () => backgroundMusicStore.songFile,
  () => {
    if (backgroundMusicStore.songFile !== null) {
      destroyAudioInstance()
      initAudioInstance()
    }
  }
)
</script>

<template>
  <div :class="containerClasses">
    <button
      v-if="backgroundMusicStore.songFile"
      :class="buttonClasses"
      :style="buttonStyles"
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
