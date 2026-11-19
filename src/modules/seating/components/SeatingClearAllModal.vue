<script setup>
import { useI18n } from 'vue-i18n'
import { UiButton, UiModal } from '@/ui'

defineProps({
  open: { type: Boolean, default: false },
  /** How many people would lose their seat. */
  count: { type: Number, default: 0 },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'confirm'])
const { t } = useI18n()
</script>

<template>
  <UiModal
    :open="open"
    :title="t('app.seating.clearAll.title')"
    :description="t('app.seating.clearAll.text', { count }, count)"
    size="sm"
    @update:open="val => !val && emit('close')"
  >
    <p class="rounded-lg bg-warning-50 p-3 text-sm text-warning-700">{{ t('app.seating.clearAll.note') }}</p>
    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <UiButton variant="secondary" :disabled="saving" @click="emit('close')">{{ t('app.seating.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="saving" @click="emit('confirm')">
          {{ t('app.seating.clearAll.confirm', { count }, count) }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
