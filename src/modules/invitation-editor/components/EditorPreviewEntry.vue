<script setup>
/**
 * The "Vista previa" button of the action row. It opens the preview sheet of the template module with the edits of the
 * form that are not saved yet, so the person sees them before they are autosaved.
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Eye } from 'lucide-vue-next'
import { UiButton } from '@/ui'
import InvitationPreviewSheet from '@/modules/template-picker/components/InvitationPreviewSheet.vue'

defineProps({
  eventId: { type: [Number, String], default: null },
  /** `{ <fieldId>: value }` of the form's current edits (see `previewOverrides`). */
  overrides: { type: Object, default: () => ({}) }
})
const { t } = useI18n()
const open = ref(false)
</script>

<template>
  <div>
    <UiButton variant="secondary" block :disabled="eventId == null" @click="open = true">
      <Eye class="h-4 w-4" aria-hidden="true" />
      {{ t('invitationEditor.actions.preview') }}
    </UiButton>
    <InvitationPreviewSheet v-if="eventId != null" v-model:open="open" :event-id="eventId" :fields="overrides" />
  </div>
</template>
