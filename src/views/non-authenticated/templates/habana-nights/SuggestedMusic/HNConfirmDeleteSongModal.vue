<script setup>
import { computed, nextTick, watch } from 'vue'
import { AlertTriangle, X } from 'lucide-vue-next'

const emit = defineEmits(['confirm', 'cancel'])

const props = defineProps({
  open: { type: Boolean, required: true },
  song: { type: Object, default: null }
})

const songTitle = computed(() => props.song?.title ?? 'esta canción')
const songSubtitle = computed(() => {
  const artist = props.song?.artist ?? ''
  const album = props.song?.album ?? ''
  if (!artist) return ''
  return album ? `${artist} — ${album}` : artist
})

const onBackdropClick = e => {
  if (e.target === e.currentTarget) emit('cancel')
}

const onEsc = e => {
  if (e.key === 'Escape') emit('cancel')
}

watch(
  () => props.open,
  async isOpen => {
    if (!isOpen) return
    await nextTick()
    const el = document.getElementById('hn-delete-modal-root')
    if (el) el.focus()
  }
)
</script>

<template>
  <teleport to="body">
    <div
      v-if="open"
      id="hn-delete-modal-root"
      class="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6"
      tabindex="0"
      @click="onBackdropClick"
      @keydown="onEsc"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 hn-backdrop"></div>

      <!-- Modal -->
      <div
        class="relative w-full max-w-md overflow-hidden rounded-2xl hn-shell"
        role="dialog"
        aria-modal="true"
      >
        <div class="absolute inset-0 hn-glow" aria-hidden="true"></div>
        <div class="absolute inset-0 hn-border" aria-hidden="true"></div>

        <!-- Header -->
        <div class="relative px-5 py-4">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <div class="hn-icon-wrap">
                <AlertTriangle class="h-5 w-5" />
              </div>
              <p class="hn-title">Eliminar canción</p>
            </div>

            <button type="button" class="hn-x" title="Cerrar" @click="emit('cancel')">
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="relative px-5 pb-2 text-sm">
          <p class="hn-copy">
            ¿Seguro que quieres eliminar <span class="hn-strong">{{ songTitle }}</span> de la lista?
          </p>

          <div v-if="song" class="hn-card mt-4">
            <p class="hn-song-title truncate">{{ song.title }}</p>
            <p v-if="songSubtitle" class="hn-song-sub truncate">{{ songSubtitle }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="relative flex justify-end gap-3 px-5 pb-5 pt-4">
          <button type="button" class="hn-btn hn-btn--ghost" @click="emit('cancel')">
            Cancelar
          </button>

          <button type="button" class="hn-btn hn-btn--danger" @click="emit('confirm')">
            Eliminar
          </button>
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
    radial-gradient(70% 90% at 15% 35%, rgba(212, 175, 55, 0.12) 0%, transparent 60%),
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
  color: #f8f1e7;
  letter-spacing: 0.02em;
}

.hn-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  width: 38px;
  border-radius: 12px;
  border: 1px solid rgba(232, 93, 74, 0.26);
  background: rgba(232, 93, 74, 0.12);
  color: rgba(248, 241, 231, 0.92);
}

.hn-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  width: 42px;
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.18);
  background: rgba(11, 18, 32, 0.35);
  color: rgba(248, 241, 231, 0.92);
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}

.hn-x:hover {
  transform: translateY(-1px);
  border-color: rgba(212, 175, 55, 0.32);
  background: rgba(11, 18, 32, 0.5);
}

.hn-copy {
  font-family: 'Montserrat', sans-serif;
  color: rgba(148, 163, 184, 0.95);
  line-height: 1.5;
}

.hn-strong {
  color: rgba(212, 175, 55, 0.95);
  font-weight: 700;
}

.hn-card {
  border-radius: 14px;
  border: 1px solid rgba(212, 175, 55, 0.18);
  background: rgba(11, 18, 32, 0.28);
  padding: 0.9rem 0.95rem;
}

.hn-song-title {
  font-family: 'Montserrat', sans-serif;
  color: #f8f1e7;
  font-weight: 700;
  font-size: 0.95rem;
}

.hn-song-sub {
  margin-top: 0.25rem;
  font-family: 'Montserrat', sans-serif;
  color: rgba(148, 163, 184, 0.95);
  font-size: 0.82rem;
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
  font-weight: 700;
  padding: 0.65rem 1rem;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    box-shadow 160ms ease;
}

.hn-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(212, 175, 55, 0.32);
  background: rgba(11, 18, 32, 0.5);
  box-shadow: 0 0 26px rgba(212, 175, 55, 0.1);
}

.hn-btn--ghost {
  border-color: rgba(148, 163, 184, 0.22);
  color: rgba(148, 163, 184, 0.95);
}

.hn-btn--ghost:hover {
  border-color: rgba(148, 163, 184, 0.32);
  box-shadow: 0 0 22px rgba(148, 163, 184, 0.08);
}

.hn-btn--danger {
  border-color: rgba(232, 93, 74, 0.28);
  background: rgba(232, 93, 74, 0.14);
  color: rgba(248, 241, 231, 0.95);
}

.hn-btn--danger:hover {
  border-color: rgba(232, 93, 74, 0.42);
  background: rgba(232, 93, 74, 0.18);
  box-shadow: 0 0 26px rgba(232, 93, 74, 0.12);
}
</style>
