<script setup>
/**
 * Where the preview sheet plugs in (Lira B, step 5.6): the "Vista previa" button of the action row.
 * Until the preview exists it explains itself instead of leading nowhere. Lira B replaces the body and keeps the props.
 */
import { useI18n } from 'vue-i18n'
import { Eye } from 'lucide-vue-next'
import { UiButton } from '@/ui'

defineProps({ eventId: { type: [Number, String], default: null } })
const emit = defineEmits(['open'])
const { t } = useI18n()
</script>

<template>
  <UiButton variant="secondary" block disabled :title="t('invitationEditor.actions.previewSoon')" @click="emit('open')">
    <Eye class="h-4 w-4" aria-hidden="true" />
    {{ t('invitationEditor.actions.preview') }}
  </UiButton>
</template>
