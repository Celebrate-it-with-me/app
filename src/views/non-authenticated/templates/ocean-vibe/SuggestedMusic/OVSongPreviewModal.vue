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
      <div class="absolute inset-0 bg-[#071A2A]/50 backdrop-blur-md"></div>

      <!-- Modal -->
      <div
        class="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white/75 backdrop-blur-md shadow-[0_18px_50px_-25px_rgba(7,26,42,0.45)] border border-[#7FB9C9]/30"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="relative px-6 py-5 border-b border-[#7FB9C9]/20">
          <div class="relative flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="truncate text-lg font-bold text-[#123B5A]">
                {{ title || 'Reproduciendo' }}
              </p>
              <p v-if="subtitle" class="truncate text-sm text-[#2F6F8F]">
                {{ subtitle }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-[#123B5A] border border-[#2F6F8F]/30 transition hover:bg-white hover:text-[#2F6F8F] active:scale-[0.98]"
                title="Open in Spotify"
                @click="openOnSpotify"
              >
                <ExternalLink class="h-4 w-4" />
                <span class="hidden sm:inline">Spotify</span>
              </button>

              <button
                type="button"
                class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/70 text-[#123B5A] border border-[#2F6F8F]/30 transition hover:bg-white hover:text-[#2F6F8F] active:scale-[0.98]"
                title="Close"
                @click="emit('close')"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="px-6 py-6">
          <div class="rounded-2xl border border-[#7FB9C9]/30 bg-white/50 p-4 shadow-inner">
            <iframe
              v-if="embedSrc"
              :src="embedSrc"
              width="100%"
              height="152"
              class="rounded-xl shadow-sm"
              allow="encrypted-media"
            ></iframe>

            <div v-else class="rounded-xl bg-white p-4 text-sm text-[#2F6F8F] text-center italic">
              No hay vista previa disponible para esta canción.
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              type="button"
              class="rounded-xl bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
              @click="emit('close')"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped></style>
