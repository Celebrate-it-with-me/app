<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiButton } from '@/ui'
import { cropSquareToFile } from '@/utils/avatarCrop'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** Object URL of the chosen image. */
  src: { type: String, default: '' },
  busy: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'confirm', 'unreadable'])

const { t } = useI18n()
const imageEl = ref(null)
const ready = ref(false)
watch(() => props.src, () => (ready.value = false))

const confirm = async () => {
  try {
    emit('confirm', await cropSquareToFile(imageEl.value))
  } catch {
    emit('unreadable')
  }
}
</script>

<template>
  <UiModal :open="open" :title="t('account.profile.photo.title')" :description="t('account.profile.photo.text')" size="sm" @update:open="value => !busy && emit('update:open', value)">
    <div class="flex justify-center py-2">
      <div class="h-56 w-56 max-w-full overflow-hidden rounded-full bg-cream-200 ring-1 ring-line" data-testid="photo-preview">
        <img
          v-if="src"
          ref="imageEl"
          :src="src"
          :alt="t('account.profile.photo.preview')"
          class="h-full w-full object-cover"
          @load="ready = true"
          @error="emit('unreadable')"
        />
      </div>
    </div>
    <template #footer>
      <UiButton variant="ghost" :disabled="busy" @click="emit('update:open', false)">{{ t('account.profile.photo.cancel') }}</UiButton>
      <UiButton :loading="busy" :disabled="!ready" data-testid="photo-confirm" @click="confirm">{{ t('account.profile.photo.use') }}</UiButton>
    </template>
  </UiModal>
</template>
