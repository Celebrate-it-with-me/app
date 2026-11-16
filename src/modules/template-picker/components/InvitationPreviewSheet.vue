<script setup>
/**
 * "Vista previa" of the editor: the invitation as the guests will see it, with the edits not yet saved applied in memory
 * (`POST invitation/preview` with `fields`). Same frame and engine as the template selector's preview; nothing is written.
 *
 *   <InvitationPreviewSheet v-model:open="open" :event-id="id" :fields="{ cover_text: { es: '...', en: '...' } }" />
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiModal } from '@/ui'
import { useTemplatePicker } from '../composables/useTemplatePicker'
import TemplatePreviewFrame from './TemplatePreviewFrame.vue'
import SegmentedControl from './SegmentedControl.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  eventId: { type: [Number, String], required: true },
  /** `{ <fieldId>: value }`: the form's edits, sent to the preview without saving them. */
  fields: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:open'])

const { t, locale } = useI18n()
const picker = useTemplatePicker(() => props.eventId)
const previewLocale = ref('es')
const previewState = ref('invitation')

const languageOptions = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' }
]
const stateOptions = computed(() => [
  { value: 'invitation', label: t('templatePicker.preview.states.invitation') },
  { value: 'save_the_date', label: t('templatePicker.preview.states.saveTheDate') },
  { value: 'no_photo', label: t('templatePicker.preview.states.noPhoto') }
])
const failedText = computed(() => (picker.previewError.value === 'forbidden' ? t('templatePicker.errors.previewForbidden') : t('templatePicker.preview.failed')))

function render() {
  picker.loadPreview(null, { locale: previewLocale.value, state: previewState.value, fields: props.fields })
}

watch(
  () => props.open,
  open => {
    if (!open) return picker.resetPreview()
    previewLocale.value = locale.value === 'en' ? 'en' : 'es'
    previewState.value = 'invitation'
    render()
  },
  { immediate: true }
)
watch([previewLocale, previewState], () => props.open && render())
</script>

<template>
  <UiModal :open="open" :title="t('invitationEditor.actions.preview')" :description="t('invitationEditor.previewHint')" size="full" @update:open="value => emit('update:open', value)">
    <div class="flex flex-col items-center gap-3">
      <div class="flex flex-wrap items-center justify-center gap-2">
        <SegmentedControl v-model="previewLocale" :options="languageOptions" :label="t('templatePicker.preview.language')" />
        <SegmentedControl v-model="previewState" :options="stateOptions" :label="t('templatePicker.preview.state')" />
      </div>
      <div class="relative h-[min(60dvh,38rem)] w-full max-w-[22rem] overflow-hidden rounded-[1.75rem] border-4 border-ink-900 bg-cream-100 shadow-card sm:h-[36rem]" data-testid="editor-preview">
        <TemplatePreviewFrame v-if="picker.previewPayload.value" :payload="picker.previewPayload.value" :title="t('invitationEditor.previewFrameTitle')" />
        <div v-if="picker.previewStatus.value === 'loading'" class="absolute inset-0 flex items-center justify-center bg-cream-100/80 text-sm text-ink-600" role="status">
          {{ t('templatePicker.preview.loading') }}
        </div>
        <div v-else-if="picker.previewStatus.value === 'error'" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-cream-100 px-6 text-center" role="alert">
          <p class="text-ink-700">{{ failedText }}</p>
          <UiButton v-if="picker.previewError.value !== 'forbidden'" size="sm" variant="secondary" @click="render">{{ t('templatePicker.retry') }}</UiButton>
        </div>
      </div>
    </div>
    <template #footer>
      <UiButton @click="emit('update:open', false)">{{ t('invitationEditor.previewClose') }}</UiButton>
    </template>
  </UiModal>
</template>
