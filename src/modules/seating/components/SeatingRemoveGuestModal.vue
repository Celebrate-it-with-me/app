<script setup>
import { useI18n } from 'vue-i18n'
import { UiButton, UiModal } from '@/ui'

defineProps({
  guest: { type: Object, default: null },
  table: { type: Object, default: null },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'confirm'])
const { t } = useI18n()
</script>

<template>
  <UiModal
    :open="!!guest"
    :title="t('app.seating.removeGuest.title')"
    :description="t('app.seating.removeGuest.text', { guest: guest?.name ?? '', table: table?.name ?? '' })"
    size="sm"
    @update:open="val => !val && emit('close')"
  >
    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <UiButton variant="secondary" :disabled="saving" @click="emit('close')">{{ t('app.seating.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="saving" @click="emit('confirm')">{{ t('app.seating.removeGuest.confirm') }}</UiButton>
      </div>
    </template>
  </UiModal>
</template>
