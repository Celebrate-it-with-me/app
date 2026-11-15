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

// On a phone the bar covers the bottom of the screen: focused fields and anchors must scroll clear of it.
const bar = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 639px)')?.matches
onMounted(() => {
  document.addEventListener('visibilitychange', onVisibility)
  if (bar) document.documentElement.style.scrollPaddingBottom = '5rem'
})
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibility)
  if (bar) document.documentElement.style.scrollPaddingBottom = ''
  if (!audio) return
  audio.pause()
  audio.removeAttribute('src')
  audio = null
})
</script>

<template>
  <!-- Phone: a slim bar docked at the bottom, so it never sits on top of the form; the spacer keeps the page end clear. -->
  <div class="h-16 sm:hidden" aria-hidden="true" />
  <div class="pointer-events-none fixed inset-x-0 bottom-0 z-20 sm:inset-x-auto sm:bottom-4 sm:right-4">
    <div
      class="pointer-events-auto flex items-center gap-3 border-t border-inv-ink/10 bg-inv-surface/95 px-4 py-2 backdrop-blur sm:flex-col-reverse sm:items-end sm:gap-2 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
    >
      <p
        role="status"
        aria-live="polite"
        :class="failed ? 'min-w-0 flex-1 text-sm text-danger-700 sm:max-w-56 sm:flex-none sm:rounded-2xl sm:bg-inv-surface sm:px-3 sm:py-2 sm:shadow-card sm:ring-1 sm:ring-inv-ink/10' : 'sr-only'"
      >
        {{ failed ? tt('music.error') : '' }}
      </p>
      <span v-if="!failed" class="min-w-0 flex-1 truncate text-sm text-inv-ink-soft sm:hidden" aria-hidden="true">{{ title }}</span>
      <button
        type="button"
        class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-inv-primary text-inv-on-primary shadow-card transition-[opacity,scale] duration-150 ease-out hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary active:scale-[0.97] disabled:opacity-50 sm:h-12 sm:w-12"
        :aria-label="label"
        :aria-pressed="playing"
        :disabled="unavailable"
        data-testid="invitation-music"
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
  </div>
</template>
