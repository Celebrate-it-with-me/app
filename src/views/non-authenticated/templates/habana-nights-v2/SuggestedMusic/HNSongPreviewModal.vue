<script setup>
import { computed, nextTick, watch } from 'vue'
import { X, ExternalLink } from 'lucide-vue-next'

const emit = defineEmits(['close'])

const props = defineProps({
  open: { type: Boolean, required: true },
  song: { type: Object, default: null }
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
  if (e.target === e.currentTarget) emit('close')
}

const onEsc = e => {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  async isOpen => {
    if (!isOpen) return
    await nextTick()
    // Focus container so @keydown works reliably
    const el = document.getElementById('hn-preview-modal-root')
    if (el) el.focus()
  }
)
</script>

<template>
  <teleport to="body">
    <div
      v-if="open"
      id="hn-preview-modal-root"
      class="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6"
      tabindex="0"
      @click="onBackdropClick"
      @keydown="onEsc"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 hn-backdrop"></div>

      <!-- Modal -->
      <div
        class="relative w-full max-w-2xl overflow-hidden rounded-2xl hn-shell"
        role="dialog"
        aria-modal="true"
      >
        <!-- Top glow -->
        <div class="absolute inset-0 hn-glow" aria-hidden="true"></div>
        <div class="absolute inset-0 hn-border" aria-hidden="true"></div>

        <!-- Header -->
        <div class="relative px-5 py-4 sm:px-6 sm:py-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="hn-title truncate">
                {{ title || 'Reproduciendo' }}
              </p>
              <p v-if="subtitle" class="hn-subtitle truncate">
                {{ subtitle }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="hn-btn hn-btn--ghost"
                title="Abrir en Spotify"
                @click="openOnSpotify"
              >
                <ExternalLink class="h-4 w-4" />
                <span class="hidden sm:inline">Spotify</span>
              </button>

              <button
                type="button"
                class="hn-btn hn-btn--icon"
                title="Cerrar"
                @click="emit('close')"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="relative px-5 pb-5 sm:px-6 sm:pb-6">
          <div class="hn-frame">
            <iframe
              v-if="embedSrc"
              :src="embedSrc"
              width="100%"
              height="152"
              class="hn-iframe"
              allow="encrypted-media"
            ></iframe>

            <div v-else class="hn-empty">No hay preview disponible para esta canción.</div>
          </div>

          <div class="mt-5 flex justify-end">
            <button type="button" class="hn-btn hn-btn--primary" @click="emit('close')">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.hn-backdrop {
  background: rgba(2, 6, 23, 0.62);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.hn-shell {
  background: rgba(17, 24, 39, 0.62);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.55);
}

.hn-glow {
  background:
    radial-gradient(70% 90% at 15% 35%, rgba(212, 175, 55, 0.14) 0%, transparent 60%),
    radial-gradient(65% 90% at 85% 45%, rgba(232, 93, 74, 0.14) 0%, transparent 62%),
    radial-gradient(90% 120% at 50% 120%, rgba(0, 0, 0, 0.35) 0%, transparent 55%);
  pointer-events: none;
}

.hn-border {
  border: 1px solid rgba(212, 175, 55, 0.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  pointer-events: none;
}

.hn-title {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #f8f1e7;
  font-size: 1.05rem;
}

.hn-subtitle {
  margin-top: 0.25rem;
  font-family: 'Montserrat', sans-serif;
  color: rgba(148, 163, 184, 0.95);
  font-size: 0.85rem;
}

.hn-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.18);
  background: rgba(11, 18, 32, 0.35);
  color: rgba(248, 241, 231, 0.92);
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    box-shadow 160ms ease;
}

.hn-btn:hover {
  transform: translateY(-1px);
  color: rgba(212, 175, 55, 0.50);
  border-color: rgba(212, 175, 55, 0.32);
  background: rgba(11, 18, 32, 0.5);
  box-shadow: 0 0 26px rgba(212, 175, 55, 0.1);
}

.hn-btn--ghost {
  padding: 0.55rem 0.8rem;
}

.hn-btn--icon {
  height: 42px;
  width: 42px;
}

.hn-btn--primary {
  padding: 0.65rem 1.05rem;
  border-color: rgba(212, 175, 55, 0.28);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.95) 0%, rgba(184, 150, 46, 0.95) 100%);
  color: rgba(11, 18, 32, 0.95);
}

.hn-btn--primary:hover {
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.18);
}

.hn-frame {
  border-radius: 16px;
  border: 1px solid rgba(212, 175, 55, 0.18);
  background: rgba(11, 18, 32, 0.25);
  padding: 0.75rem;
}

.hn-iframe {
  border-radius: 12px;
}

.hn-empty {
  border-radius: 12px;
  background: rgba(17, 24, 39, 0.55);
  color: rgba(148, 163, 184, 0.95);
  padding: 1rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem;
}
</style>
