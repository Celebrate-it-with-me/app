<script setup>
import { AlertTriangle, X } from 'lucide-vue-next'

const emit = defineEmits(['confirm', 'cancel'])

defineProps({
  open: {
    type: Boolean,
    required: true
  },
  song: {
    type: Object,
    default: null
  }
})

const onBackdropClick = e => {
  if (e.target === e.currentTarget) emit('cancel')
}

const onEsc = e => {
  if (e.key === 'Escape') emit('cancel')
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
        class="relative w-full max-w-md overflow-hidden rounded-2xl bg-white/75 backdrop-blur-md shadow-[0_18px_50px_-25px_rgba(7,26,42,0.45)] border border-[#7FB9C9]/30"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="relative px-6 py-4 border-b border-[#7FB9C9]/20">
          <div class="relative flex items-center justify-between">
            <div class="flex items-center gap-2 text-[#123B5A] font-bold">
              <AlertTriangle class="h-5 w-5 text-[#8B1E2D]" />
              Eliminar sugerencia
            </div>
            <button class="text-[#2F6F8F] hover:text-[#123B5A] transition" @click="emit('cancel')">
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 text-sm text-[#2F6F8F]">
          ¿Estás seguro de que deseas eliminar esta canción de la lista de sugerencias?
          <div
            v-if="song"
            class="mt-4 rounded-xl bg-white/50 border border-[#7FB9C9]/20 p-4 text-[#123B5A]"
          >
            <p class="font-bold">{{ song.title }}</p>
            <p class="text-xs text-[#2F6F8F]">
              {{ song.artist }} <span v-if="song.album">— {{ song.album }}</span>
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 px-6 pb-6">
          <button
            class="rounded-xl px-5 py-2 text-sm font-bold text-[#123B5A] border border-[#2F6F8F]/30 bg-white/70 hover:bg-white transition"
            @click="emit('cancel')"
          >
            Cancelar
          </button>

          <button
            class="rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#A32A3B] px-5 py-2 text-sm font-bold text-white shadow-md hover:scale-[1.02] transition active:scale-[0.98]"
            @click="emit('confirm')"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>
