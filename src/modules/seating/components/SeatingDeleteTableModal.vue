<script setup>
import { useI18n } from 'vue-i18n'
import { UiButton, UiModal } from '@/ui'
import { assignedCount, namesPreview } from '@/modules/seating/utils/seating'

const props = defineProps({
  table: { type: Object, default: null },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'confirm'])
const { t } = useI18n()
const names = () => namesPreview((props.table?.assigned_guests || []).map(g => g.name), 4, n => t('app.seating.sheet.more', { n }))
</script>

<template>
  <UiModal
    :open="!!table"
    :title="t('app.seating.delete.title')"
    :description="t('app.seating.delete.text', { name: table?.name ?? '' })"
    size="sm"
    @update:open="val => !val && emit('close')"
  >
    <p v-if="table && assignedCount(table) > 0" class="rounded-lg bg-warning-50 p-3 text-sm text-warning-700">
      {{ t('app.seating.delete.withGuests', { count: assignedCount(table) }, assignedCount(table)) }}
      <span v-if="names()" class="mt-1 block font-medium">{{ names() }}</span>
    </p>
    <p v-else-if="table" class="text-sm text-ink-500">{{ t('app.seating.delete.empty') }}</p>
    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <UiButton variant="secondary" :disabled="saving" @click="emit('close')">{{ t('app.seating.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="saving" @click="emit('confirm')">{{ t('app.seating.delete.confirm') }}</UiButton>
      </div>
    </template>
  </UiModal>
</template>
