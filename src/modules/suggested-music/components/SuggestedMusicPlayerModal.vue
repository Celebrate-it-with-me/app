<script setup>
// All comments in code are in English, as requested.

import CModal from '@/components/UI/modals/CModal.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { Music } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  selectedSong: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'close'])

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<template>
  <CModal
    :model-value="props.modelValue"
    size="lg"
    show-close-icon
    @update:model-value="val => emit('update:modelValue', val)"
    @close="close"
  >
    <template #title>Now Playing</template>

    <div v-if="props.selectedSong" class="space-y-6">
      <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
        <iframe
          v-if="props.selectedSong.platformId"
          :src="`https://open.spotify.com/embed/track/${props.selectedSong.platformId}`"
          width="100%"
          height="352"
          allowtransparency="true"
          allow="encrypted-media"
          class="rounded-lg"
        ></iframe>

        <div v-else class="text-center py-10 text-gray-500 dark:text-gray-400">
          <Music class="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Unable to load player</p>
        </div>
      </div>

      <div class="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>🎵 Powered by Spotify</p>
        <p class="text-xs mt-1">
          {{
            props.selectedSong.previewUrl
              ? 'Playing 30-second preview'
              : 'Full playback requires Spotify Premium'
          }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end w-full">
        <CButton variant="outline" @click="close">Close</CButton>
      </div>
    </template>
  </CModal>
</template>
