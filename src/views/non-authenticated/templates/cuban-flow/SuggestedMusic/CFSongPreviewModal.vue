<script setup>
import { computed } from 'vue'
import { X, ExternalLink } from 'lucide-vue-next'

const emit = defineEmits(['close'])

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  song: {
    type: Object,
    default: null
  }
})

const embedSrc = computed(() => {
  const id = props.song?.platformId
  if (!id) return ''
  return `https://open.spotify.com/embed/track/${id}`
})

const title = computed(() => props.song?.title ?? '')
const subtitle = computed(() => {
  const artist = props.song?.artist ?? ''
  const album = props.song?.album ?? ''
  if (!artist) return ''
  return album ? `${artist} — ${album}` : artist
})

const openOnSpotify = () => {
  const id = props.song?.platformId
  if (!id) return
  window.open(`https://open.spotify.com/track/${id}`, '_blank', 'noopener,noreferrer')
}

const onBackdropClick = e => {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

const onEsc = e => {
  if (e.key === 'Escape') {
    emit('close')
  }
}
</script>

<template>
  <teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      tabindex="0"
      @click="onBackdropClick"
      @keydown="onEsc"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>

      <!-- Modal -->
      <div
        class="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header (soft blue<->red gradient) -->
        <div class="relative px-5 py-4">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-red-50"></div>
          <div class="relative flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="truncate text-base font-semibold text-slate-900">
                {{ title || 'Now playing' }}
              </p>
              <p v-if="subtitle" class="truncate text-sm text-slate-600">
                {{ subtitle }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900 active:scale-[0.98]"
                title="Open in Spotify"
                @click="openOnSpotify"
              >
                <ExternalLink class="h-4 w-4" />
                <span class="hidden sm:inline">Spotify</span>
              </button>

              <button
                type="button"
                class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/70 text-slate-700 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900 active:scale-[0.98]"
                title="Close"
                @click="emit('close')"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="px-5 pb-5">
          <div
            class="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/60 via-white to-red-50/60 p-3"
          >
            <iframe
              v-if="embedSrc"
              :src="embedSrc"
              width="100%"
              height="152"
              class="rounded-xl"
              allow="encrypted-media"
            ></iframe>

            <div v-else class="rounded-xl bg-white p-4 text-sm text-slate-600">
              No preview available for this song.
            </div>
          </div>

          <div class="mt-4 flex justify-end">
            <button
              type="button"
              class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
              @click="emit('close')"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped></style>
