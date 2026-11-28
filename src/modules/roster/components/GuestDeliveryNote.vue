<script setup>
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/ui'
import { isUnknownDelivery } from '../utils/whatsapp'

/** What the chip cannot say: why a message failed (with a retry) or that the guest has no phone (with a way to add it). */
const props = defineProps({
  family: { type: Object, required: true },
  delivery: { type: Object, default: null },
  canEdit: { type: Boolean, default: false }
})
const emit = defineEmits(['edit', 'retry'])
const { t } = useI18n()
const failed = () => props.delivery?.key === 'failed'
const noPhone = () => props.delivery?.key === 'no_phone' && props.canEdit
</script>

<template>
  <div v-if="failed() || noPhone()" class="mt-1 flex flex-wrap items-center gap-x-2" data-testid="delivery-note" @click.stop>
    <template v-if="failed()">
      <span class="text-xs text-danger-700">{{ isUnknownDelivery(delivery.message) ? t('app.whatsapp.unknownDelivery') : delivery.message.errorMessage || t('app.whatsapp.failedHelp') }}</span>
      <UiButton v-if="canEdit" size="sm" variant="link" class="h-auto text-xs" @click.stop="emit('retry', delivery.message)">{{ t('app.whatsapp.retry') }}</UiButton>
    </template>
    <UiButton v-else size="sm" variant="link" class="h-auto text-xs" @click.stop="emit('edit', family)">{{ t('app.roster.addPhone') }}</UiButton>
  </div>
</template>
