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
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>

      <!-- Modal -->
      <div
        class="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="relative px-5 py-4">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-red-50"></div>
          <div class="relative flex items-center justify-between">
            <div class="flex items-center gap-2 text-slate-800 font-semibold">
              <AlertTriangle class="h-5 w-5 text-red-500" />
              Remove Song
            </div>
            <button class="text-slate-500 hover:text-slate-800" @click="emit('cancel')">
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="px-5 py-4 text-sm text-slate-600">
          Are you sure you want to remove this song from the event?
          <div v-if="song" class="mt-3 rounded-lg bg-slate-50 p-3 text-slate-700">
            <p class="font-semibold">{{ song.title }}</p>
            <p class="text-xs">
              {{ song.artist }} <span v-if="song.album">— {{ song.album }}</span>
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 px-5 pb-5">
          <button
            class="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 transition"
            @click="emit('cancel')"
          >
            Cancel
          </button>

          <button
            class="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition active:scale-[0.98]"
            @click="emit('confirm')"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>
