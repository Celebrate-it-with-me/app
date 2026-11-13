<script setup>
import { useI18n } from 'vue-i18n'
import { UiButton, UiModal } from '@/ui'

defineProps({
  memory: { type: Object, default: null },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'confirm'])
const { t } = useI18n()
</script>

<template>
  <UiModal
    :open="!!memory"
    :title="t('app.memories.delete.title')"
    :description="t('app.memories.delete.text', { title: memory?.title || t('app.memories.card.untitled') })"
    size="sm"
    @update:open="val => !val && emit('close')"
  >
    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <UiButton variant="secondary" :disabled="saving" @click="emit('close')">{{ t('app.memories.delete.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="saving" @click="emit('confirm')">{{ t('app.memories.delete.confirm') }}</UiButton>
      </div>
    </template>
  </UiModal>
</template>
