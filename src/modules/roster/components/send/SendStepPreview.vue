<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RotateCcw, TriangleAlert } from 'lucide-vue-next'
import { UiButton, UiRadioGroup, UiSelect, UiSkeleton, UiTabs, UiTextarea } from '@/ui'
import SendLinkCard from './SendLinkCard.vue'
import InvitationMiniature from '@/modules/template-picker/components/InvitationMiniature.vue'
import WhatsappService from '../../services/WhatsappService'
import { allowedTemplates, keepsLink, localeCounts, renderMessage, wizardSendErrorKey } from '../../utils/sendWizard'
import { sendErrorKey } from '../../utils/whatsapp'

/**
 * Step 2 · Preview (contract 3.4): the real cover, the message as it will arrive (a bubble), the template and the
 * language. Automatic: the message comes from `POST whatsapp/preview` and is fixed (Meta templates). Manual: the text is
 * the organizer's own (`wa.me`), editable here, rendered locally with the example family.
 */
const props = defineProps({
  eventId: { type: [Number, String], required: true },
  eventName: { type: String, default: '' },
  eventDateLabel: { type: String, default: '' },
  /** Families that will receive it (after steps 1 and the exclusions). */
  families: { type: Array, required: true },
  template: { type: String, required: true },
  /** Message text with {name}, {event} and {link} (manual mode). */
  text: { type: String, default: '' },
  customized: { type: Boolean, default: false },
  mode: { type: String, default: 'manual' },
  rsvpOpen: { type: Boolean, default: true },
  /** Families that would fail whole because their language has no approved template (decision 12). */
  missing: { type: Array, default: () => [] },
  canEdit: { type: Boolean, default: true }
})
const emit = defineEmits(['update:template', 'update:text', 'restore', 'exclude', 'unapproved'])
const { t } = useI18n()

const automatic = computed(() => props.mode === 'automatic')
const choosing = ref(false)
const editing = ref(false)
const exampleId = ref(null)
const sample = computed(() => props.families.find(f => f.id === exampleId.value) ?? props.families[0] ?? null)
watch(
  () => props.families,
  list => {
    if (!list.some(f => f.id === exampleId.value)) exampleId.value = list[0]?.id ?? null
  },
  { immediate: true }
)

const languages = computed(() => localeCounts(props.families))
const languageTabs = computed(() => languages.value.map(l => ({ value: l.locale, label: `${t(`app.whatsapp.wizard.preview.lang.${l.locale}`)} · ${l.n}` })))
const languageSummary = computed(() => languages.value.map(l => `${l.n} ${t(`app.whatsapp.wizard.preview.in.${l.locale}`)}`).join(' · '))
const viewOptions = computed(() => props.families.slice(0, 50).map(f => ({ value: f.id, label: f.name })))
const templateOptions = computed(() =>
  allowedTemplates({ rsvpOpen: props.rsvpOpen }).map(key => ({ value: key, label: t(`app.whatsapp.wizard.templates.${key}`), description: t(`app.whatsapp.wizard.preview.help.${key}`) }))
)

function pickLanguage(locale) {
  const first = props.families.find(f => f.locale === locale)
  if (first) exampleId.value = first.id
}

// The preview endpoint answers in both modes: automatic takes the message from it, manual only its `linkPreview` (the
// text there is the organizer's own, rendered locally). A failed call in manual mode just leaves the card out.
const loading = ref(false)
const result = ref(null)
const errorKey = ref(null)
let runId = 0
async function loadPreview() {
  if (!sample.value) return
  const id = ++runId
  loading.value = true
  errorKey.value = null
  try {
    const data = await WhatsappService.preview(props.eventId, { template: props.template, guestId: sample.value.id, locale: sample.value.locale })
    if (id !== runId) return
    result.value = data
  } catch (e) {
    if (id !== runId) return
    result.value = null
    if (automatic.value) {
      errorKey.value = wizardSendErrorKey(e, sendErrorKey)
      if (errorKey.value === 'templateNotApproved') emit('unapproved', sample.value.locale)
    }
  } finally {
    if (id === runId) loading.value = false
  }
}
watch([() => props.template, () => sample.value?.id, () => props.mode], loadPreview, { immediate: true })

const bubbleText = computed(() => {
  if (!sample.value) return ''
  if (automatic.value) return result.value?.body ?? ''
  return renderMessage(props.text, { name: sample.value.name, event: props.eventName, link: sample.value.link ?? '' })
})
const linkPreview = computed(() => result.value?.linkPreview ?? null)
const buttons = computed(() => (automatic.value ? result.value?.buttons ?? [] : []))
const time = computed(() => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date()))
const missingLocales = computed(() => [...new Set(props.missing.map(f => f.locale))])
</script>

<template>
  <div>
    <h3 class="font-heading text-xl text-ink-900" data-step-title tabindex="-1">{{ t('app.whatsapp.wizard.preview.title') }}</h3>

    <div class="mt-4 flex items-start gap-4">
      <InvitationMiniature
        :event-id="eventId"
        :width="150"
        :name="eventName"
        :date-label="eventDateLabel"
        :live="canEdit"
        class="shrink-0 rounded-2xl border border-line shadow-soft"
      />
      <div class="min-w-0 flex-1">
        <p class="font-heading text-lg leading-snug text-ink-900">{{ eventName }}</p>
        <p v-if="eventDateLabel" class="text-sm text-ink-500 first-letter:uppercase">{{ eventDateLabel }}</p>
        <label v-if="families.length" class="mt-3 block text-xs font-medium uppercase tracking-wide text-ink-500">
          {{ t('app.whatsapp.wizard.preview.viewAs') }}
          <UiSelect class="mt-1 normal-case" :model-value="exampleId" :options="viewOptions" :aria-label="t('app.whatsapp.wizard.preview.viewAs')" @update:model-value="exampleId = $event" />
        </label>
      </div>
    </div>

    <div v-if="languages.length > 1" class="mt-4 overflow-x-auto" role="group" :aria-label="t('app.whatsapp.wizard.preview.language')">
      <UiTabs :model-value="sample?.locale" :tabs="languageTabs" @update:model-value="pickLanguage" />
    </div>

    <div v-if="missing.length" class="mt-4 rounded-xl border border-danger-500/30 bg-danger-50 p-3" role="alert" data-testid="preview-missing">
      <div class="flex items-start gap-2">
        <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0 text-danger-700" aria-hidden="true" />
        <p class="text-sm text-danger-700">
          {{ t('app.whatsapp.wizard.preview.missing', { language: missingLocales.map(l => t(`app.whatsapp.wizard.preview.lang.${l}`)).join(', '), n: missing.length }, missing.length) }}
        </p>
      </div>
      <UiButton class="mt-2" size="sm" variant="secondary" @click="emit('exclude', missing.map(f => f.id))">
        {{ t('app.whatsapp.wizard.preview.exclude', { n: missing.length }, missing.length) }}
      </UiButton>
    </div>

    <!-- The message as a WhatsApp bubble. -->
    <section class="mt-4 rounded-2xl bg-cream-100 p-3" :aria-label="t('app.whatsapp.wizard.preview.bubbleLabel')" aria-live="polite" :aria-busy="automatic && loading">
      <div v-if="automatic && loading" class="space-y-2" data-testid="preview-loading" aria-hidden="true">
        <UiSkeleton height="1rem" width="90%" />
        <UiSkeleton height="1rem" width="75%" />
        <UiSkeleton height="1rem" width="60%" />
      </div>
      <div v-else-if="automatic && errorKey" class="text-sm text-ink-700" data-testid="preview-error">
        <p>{{ t(`app.whatsapp.errors.${errorKey}`) }} {{ t('app.whatsapp.wizard.preview.errorContinue') }}</p>
        <UiButton class="mt-2" size="sm" variant="secondary" @click="loadPreview">{{ t('app.whatsapp.wizard.retry') }}</UiButton>
      </div>
      <template v-else-if="sample">
        <div class="ml-auto max-w-[92%] rounded-2xl rounded-tr-sm border border-success-500/20 bg-success-50 px-3 py-2 shadow-soft" data-testid="preview-bubble">
          <p class="whitespace-pre-line break-words text-sm leading-relaxed text-ink-900">{{ bubbleText }}</p>
          <p class="mt-1 text-right text-[11px] text-ink-500">{{ time }}</p>
        </div>
        <div v-if="buttons.length" class="mt-2 flex flex-wrap justify-end gap-2" data-testid="preview-buttons">
          <span v-for="button in buttons" :key="button.id" class="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-info-700 shadow-soft">{{ button.text }}</span>
        </div>
        <p class="mt-2 text-right text-xs text-ink-500">{{ t('app.whatsapp.wizard.preview.sample', { name: sample.name }) }}</p>
      </template>
    </section>

    <SendLinkCard :link-preview="linkPreview" :link="result?.link ?? sample?.link ?? ''" :loading="loading && !!sample" />

    <div class="mt-3 flex items-center justify-between gap-2">
      <p class="min-w-0 text-sm font-medium text-ink-900">{{ t('app.whatsapp.wizard.preview.message', { template: t(`app.whatsapp.wizard.templates.${template}`) }) }}</p>
      <UiButton size="sm" variant="ghost" :aria-expanded="choosing" @click="choosing = !choosing">
        {{ choosing ? t('app.whatsapp.wizard.preview.hideChange') : t('app.whatsapp.wizard.preview.change') }}
      </UiButton>
    </div>
    <div v-if="choosing" class="mt-2" data-testid="preview-templates">
      <UiRadioGroup :model-value="template" :options="templateOptions" cards @update:model-value="emit('update:template', $event)" />
    </div>
    <p v-if="!rsvpOpen" class="mt-2 text-sm text-ink-500">{{ t('app.whatsapp.wizard.banner.rsvpClosed') }}</p>

    <!-- Manual: the text is the organizer's. Automatic: Meta's approved template, not editable. -->
    <section v-if="!automatic" class="mt-4 rounded-xl border border-line p-3" :aria-label="t('app.whatsapp.wizard.preview.editorLabel')">
      <div class="flex items-center justify-between gap-2">
        <p class="text-sm font-semibold text-ink-900">{{ t('app.whatsapp.wizard.preview.editorLabel') }}</p>
        <UiButton size="sm" variant="ghost" :aria-expanded="editing" @click="editing = !editing">
          {{ editing ? t('app.whatsapp.wizard.preview.hideEditor') : t('app.whatsapp.wizard.preview.editor') }}
        </UiButton>
      </div>
      <div v-if="editing" class="mt-2">
        <UiTextarea :model-value="text" :rows="4" :aria-label="t('app.whatsapp.wizard.preview.editorLabel')" @update:model-value="emit('update:text', $event)" />
        <p class="mt-1 text-xs text-ink-500">{{ t('app.whatsapp.wizard.preview.editorHelp', { name: '{name}', event: '{event}', link: '{link}' }) }}</p>
        <p v-if="!keepsLink(text)" role="alert" class="mt-1 text-xs text-danger-700">{{ t('app.whatsapp.wizard.preview.missingLink', { link: '{link}' }) }}</p>
        <UiButton v-if="customized" class="mt-2" size="sm" variant="secondary" @click="emit('restore')">
          <RotateCcw class="h-4 w-4" aria-hidden="true" />
          {{ t('app.whatsapp.wizard.preview.restore') }}
        </UiButton>
      </div>
    </section>
    <p v-else class="mt-3 text-xs text-ink-500" data-testid="preview-fixed">{{ t('app.whatsapp.wizard.preview.fixed') }}</p>

    <p v-if="languages.length" class="mt-4 text-sm text-ink-700" data-testid="preview-languages">{{ t('app.whatsapp.wizard.preview.languages', { list: languageSummary }) }}</p>
  </div>
</template>
