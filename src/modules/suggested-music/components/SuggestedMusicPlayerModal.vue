<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Music } from 'lucide-vue-next'
import { UiModal, UiButton } from '@/ui'
import { spotifyEmbedUrl } from '@/modules/suggested-music/utils/music'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  selectedSong: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'close'])
const { t } = useI18n()

const embedUrl = computed(() => spotifyEmbedUrl(props.selectedSong?.platformId))

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const onOpenChange = open => {
  if (open) emit('update:modelValue', true)
  else close()
}
</script>

<template>
  <UiModal :open="props.modelValue" :title="t('app.music.player.title')" size="lg" @update:open="onOpenChange">
    <div v-if="props.selectedSong" class="space-y-4">
      <p class="truncate text-sm text-ink-700">{{ props.selectedSong.title }} · {{ props.selectedSong.artist }}</p>

      <iframe
        v-if="embedUrl"
        :src="embedUrl"
        :title="t('app.music.player.iframeTitle', { title: props.selectedSong.title })"
        width="100%"
        height="352"
        allowtransparency="true"
        allow="encrypted-media"
        class="rounded-lg"
      ></iframe>

      <div v-else class="py-10 text-center text-ink-500">
        <Music class="mx-auto mb-3 h-10 w-10" aria-hidden="true" />
        <p>{{ t('app.music.player.unavailable') }}</p>
      </div>

      <div class="text-center text-sm text-ink-500">
        <p>{{ t('app.music.player.powered') }}</p>
        <p class="mt-1 text-xs">
          {{ props.selectedSong.previewUrl ? t('app.music.player.preview') : t('app.music.player.premium') }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <UiButton variant="secondary" @click="close">{{ t('app.music.close') }}</UiButton>
      </div>
    </template>
  </UiModal>
</template>
