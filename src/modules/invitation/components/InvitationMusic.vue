<script setup>
/**
 * Background music: a small floating button. The audio never starts by itself. The element is
 * created on the first tap and `play()` is only called from that tap, with `preload="none"`.
 * It pauses when the tab is hidden and does not resume on its own.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Pause, Play } from 'lucide-vue-next'
import { useInvitationContext } from '../composables/useInvitation'

const props = defineProps({
  section: { type: Object, required: true }
})

const { tt, preview } = useInvitationContext()

const playing = ref(false)
const failed = ref(false)
let audio = null

const url = computed(() => props.section.data?.url ?? '')
const title = computed(() => props.section.data?.title || props.section.settings?.title || tt('music.fallbackTitle'))
const label = computed(() => `${tt(playing.value ? 'music.pause' : 'music.play')}: ${title.value}`)
const unavailable = computed(() => preview || failed.value || !url.value)

function fail() {
  playing.value = false
  failed.value = true
}

function ensureAudio() {
  if (audio) return audio
  audio = new Audio()
  audio.preload = 'none'
  audio.loop = props.section.data?.loop !== false
  audio.addEventListener('play', () => (playing.value = true))
  audio.addEventListener('pause', () => (playing.value = false))
  audio.addEventListener('ended', () => (playing.value = false))
  audio.addEventListener('error', fail)
  audio.src = url.value
  return audio
}

/** Always called straight from the tap: browsers only allow sound after a gesture. */
async function toggle() {
  if (unavailable.value) return
  const element = ensureAudio()
  if (!element.paused) {
    element.pause()
    return
  }
  try {
    await element.play()
  } catch {
    fail()
  }
}

function onVisibility() {
  if (document.hidden && audio && !audio.paused) audio.pause()
}

onMounted(() => document.addEventListener('visibilitychange', onVisibility))
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibility)
  if (!audio) return
  audio.pause()
  audio.removeAttribute('src')
  audio = null
})
</script>

<template>
  <div class="pointer-events-none fixed bottom-4 right-4 z-20 flex flex-col items-end gap-2">
    <p
      role="status"
      aria-live="polite"
      :class="failed ? 'pointer-events-auto max-w-56 rounded-2xl bg-inv-surface px-3 py-2 text-sm text-danger-700 shadow-card ring-1 ring-inv-ink/10' : 'sr-only'"
    >
      {{ failed ? tt('music.error') : '' }}
    </p>
    <button
      type="button"
      class="pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full bg-inv-primary text-inv-on-primary shadow-card transition-[opacity,scale] duration-150 ease-out hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary active:scale-[0.97] disabled:opacity-50"
      :aria-label="label"
      :aria-pressed="playing"
      :disabled="unavailable"
      @click="toggle"
    >
      <span
        v-if="playing"
        aria-hidden="true"
        class="absolute inset-0 rounded-full ring-2 ring-inv-accent motion-safe:animate-pulse"
      />
      <component :is="playing ? Pause : Play" class="relative h-5 w-5" aria-hidden="true" />
    </button>
  </div>
</template>
