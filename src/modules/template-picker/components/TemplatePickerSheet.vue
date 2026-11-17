<script setup>
/**
 * The template selector as one sheet with four views: the grid of templates, the live preview of one of them, the
 * confirmation of the change (what is kept and reset) and the "already published" notice. The API decides what is
 * locked or allowed; this screen only dresses its answers (contract: docs/plans/template-stage5-contract-draft.md, 3.2, 3.3, 3.5, 8).
 */
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, Check, Lock, RotateCcw } from 'lucide-vue-next'
import { UiButton, UiEmptyState, UiModal, UiSkeleton, useToast } from '@/ui'
import { SUPPORT_EMAIL, mailtoLink } from '@/config/brand'
import PaymentsService from '@/modules/payments/services/PaymentsService'
import { formatMoney } from '@/modules/payments/utils/money'
import { useTemplatePicker } from '../composables/useTemplatePicker'
import { conflictingModules, moduleNames, pickText } from '../utils/templatePicker'
import TemplateCard from './TemplateCard.vue'
import TemplatePreviewFrame from './TemplatePreviewFrame.vue'
import SegmentedControl from './SegmentedControl.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  eventId: { type: [Number, String], required: true },
  /** Open straight on the preview of this template (coming back from the payment, or a deep link). */
  initialTemplateId: { type: [Number, String], default: null },
  /** True when she just came back from paying: the preview offers "use it now". */
  fromPayment: { type: Boolean, default: false },
  /** Slugs of the event's active modules: changing to a template that lacks one asks for confirmation first. */
  activeModules: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:open', 'changed', 'unlock', 'undone'])

const { t, te, tm, rt, locale } = useI18n()
const toast = useToast()
const picker = useTemplatePicker(() => props.eventId)

const view = ref('list') // list | preview | confirm | published
const body = ref(null)
const selected = ref(null)
const previewLocale = ref('es')
const previewState = ref('invitation')
const previewPreset = ref('')
const confirmError = ref('') // '' or the key of templatePicker.errors.*
const quote = ref(null)
const missingAsk = ref(false) // the "this template lacks a module you use" dialog

const conflictNames = computed(() => moduleNames(conflictingModules(selected.value, props.activeModules), { t, te }).join(', '))
const isCurrent = computed(() => !!selected.value?.current)
const isLocked = computed(() => !!selected.value?.locked)
const paidNow = computed(() => props.fromPayment && !isCurrent.value && !isLocked.value && selected.value?.tier === 'premium')
const included = computed(() => tm('pricing.full.items').slice(0, 4).map(item => rt(item)))
const price = computed(() => (quote.value ? formatMoney(quote.value.amountCents, quote.value.currency, locale.value) : ''))
const presets = computed(() => (Array.isArray(selected.value?.presets) ? selected.value.presets : []))
const presetOptions = computed(() => presets.value.map(preset => ({ value: preset.value, label: pickText(preset.label, locale.value) })))
const previewErrorText = computed(() =>
  picker.previewError.value === 'forbidden' ? t('templatePicker.errors.previewForbidden') : t('templatePicker.preview.failed')
)
const mailHref = computed(() => mailtoLink({ subject: t('templatePicker.published.mailSubject') }))

const title = computed(() => {
  if (view.value === 'confirm') return t('templatePicker.confirm.title', { name: selected.value?.name ?? '' })
  if (view.value === 'preview') return selected.value?.name ?? ''
  if (view.value === 'published') return t('templatePicker.published.title')
  return t('templatePicker.title')
})
const description = computed(() => (view.value === 'list' ? t('templatePicker.subtitle') : ''))

const languageOptions = computed(() => [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' }
])
const stateOptions = computed(() => [
  { value: 'invitation', label: t('templatePicker.preview.states.invitation') },
  { value: 'save_the_date', label: t('templatePicker.preview.states.saveTheDate') },
  { value: 'no_photo', label: t('templatePicker.preview.states.noPhoto') }
])

function renderPreview() {
  if (!selected.value) return
  picker.loadPreview(selected.value, { locale: previewLocale.value, state: previewState.value, preset: previewPreset.value || undefined })
}

async function loadQuote() {
  quote.value = null
  try {
    quote.value = await PaymentsService.quote(props.eventId)
  } catch {
    /* the price is a courtesy: the unlock screen shows it */
  }
}

function openPreview(template) {
  selected.value = template
  previewLocale.value = locale.value === 'en' ? 'en' : 'es'
  previewState.value = 'invitation'
  previewPreset.value = ''
  picker.resetPreview()
  view.value = 'preview'
  renderPreview()
  if (template.locked) loadQuote()
}

function backToList() {
  view.value = 'list'
  picker.resetPreview()
}

function startUse() {
  if (!missingAsk.value && conflictNames.value) {
    missingAsk.value = true
    return
  }
  continueUse()
}

/** She accepted losing the module in this template (or there is nothing to lose): on to the usual confirmation. */
function continueUse() {
  missingAsk.value = false
  confirmError.value = ''
  view.value = 'confirm'
  picker.loadImpact(selected.value)
}

function goUnlock() {
  emit('unlock', selected.value)
  emit('update:open', false)
}

async function confirm() {
  confirmError.value = ''
  const result = await picker.apply(selected.value)
  if (result.ok) {
    emit('changed', result.data, selected.value, picker.undo.value)
    emit('update:open', false)
    return
  }
  if (result.code === 'plan_required') return goUnlock()
  if (result.code === 'template_locked') {
    view.value = 'published'
    return
  }
  if (result.code === 'template_not_available' || result.code === 'template_not_found') {
    toast.error(t('templatePicker.errors.notAvailable'))
    view.value = 'list'
    await picker.load()
    return
  }
  confirmError.value = result.code === 'event_archived' ? 'archived' : result.code === 'forbidden' ? 'forbidden' : 'generic'
}

async function undo() {
  const name = picker.undo.value?.name
  const result = await picker.undoLast()
  if (result.ok) {
    emit('undone', result.data)
    toast.success(t('templatePicker.undone', { name }))
  } else {
    const key = { event_archived: 'archived', forbidden: 'forbidden' }[result.code]
    toast.error(result.code === 'template_locked' ? t('templatePicker.published.text') : t(`templatePicker.errors.${key ?? 'generic'}`))
  }
  return result
}

function kindText(group, item) {
  const key = `templatePicker.confirm.${group}.${item.kind}`
  return te(key) ? t(key, { count: item.count ?? 0 }) : t(`templatePicker.confirm.${group}.other`)
}

async function begin() {
  view.value = 'list'
  selected.value = null
  picker.resetPreview()
  await picker.load()
  const wanted = props.initialTemplateId != null ? picker.templates.value.find(item => String(item.id) === String(props.initialTemplateId)) : null
  if (wanted) openPreview(wanted)
}

watch(
  () => props.open,
  open => {
    if (open) begin()
  },
  { immediate: true }
)
// A new view starts at its top, not where the previous one was scrolled to.
watch(view, async () => {
  await nextTick()
  body.value?.closest('.overflow-y-auto')?.scrollTo?.({ top: 0 })
})
watch([previewLocale, previewState, previewPreset], () => {
  if (view.value === 'preview') renderPreview()
})

defineExpose({ undo, picker })
</script>

<template>
  <UiModal :open="open" :title="title" :description="description" size="full" @update:open="value => emit('update:open', value)">
    <span ref="body" class="sr-only" aria-hidden="true" />
    <!-- 1. the grid -->
    <div v-if="view === 'list'">
      <div v-if="picker.status.value === 'loading' || picker.status.value === 'idle'" class="grid grid-cols-2 gap-3 sm:grid-cols-3" role="status" :aria-label="t('templatePicker.loading')">
        <UiSkeleton v-for="n in 4" :key="n" height="16rem" />
      </div>
      <UiEmptyState v-else-if="picker.status.value === 'error'" :title="t('templatePicker.loadFailed')" :description="t('templatePicker.loadFailedHint')">
        <UiButton variant="secondary" @click="picker.load()">
          <RotateCcw class="h-4 w-4" aria-hidden="true" />
          {{ t('templatePicker.retry') }}
        </UiButton>
      </UiEmptyState>
      <UiEmptyState v-else-if="!picker.templates.value.length" :title="t('templatePicker.empty')" />
      <ul v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <li v-for="template in picker.templates.value" :key="template.id" class="flex">
          <TemplateCard :template="template" @select="openPreview" />
        </li>
      </ul>
    </div>

    <!-- 2. live preview -->
    <div v-else-if="view === 'preview' && selected" class="grid gap-5 sm:grid-cols-[minmax(0,22rem)_1fr]">
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <SegmentedControl v-model="previewLocale" :options="languageOptions" :label="t('templatePicker.preview.language')" />
          <SegmentedControl v-model="previewState" :options="stateOptions" :label="t('templatePicker.preview.state')" />
          <SegmentedControl v-if="presetOptions.length" v-model="previewPreset" :options="presetOptions" :label="t('templatePicker.preview.preset')" />
        </div>
        <div class="relative mx-auto h-[min(60dvh,38rem)] w-full max-w-[22rem] overflow-hidden rounded-[1.75rem] border-4 border-ink-900 bg-cream-100 shadow-card sm:h-[36rem]">
          <TemplatePreviewFrame v-if="picker.previewPayload.value" :payload="picker.previewPayload.value" :title="t('templatePicker.preview.frameTitle', { name: selected.name })" />
          <div v-if="picker.previewStatus.value === 'loading'" class="absolute inset-0 flex items-center justify-center bg-cream-100/80 text-sm text-ink-600" role="status">
            {{ t('templatePicker.preview.loading') }}
          </div>
          <div v-else-if="picker.previewStatus.value === 'error'" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-cream-100 px-6 text-center" role="alert">
            <p class="text-ink-700">{{ previewErrorText }}</p>
            <UiButton v-if="picker.previewError.value !== 'forbidden'" size="sm" variant="secondary" @click="renderPreview">{{ t('templatePicker.retry') }}</UiButton>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <p class="text-base text-ink-600">{{ pickText(selected.description, locale) }}</p>
        <div v-if="isLocked" class="rounded-xl bg-gold-100 p-4">
          <p class="flex items-center gap-2 font-semibold text-ink-900">
            <Lock class="h-4 w-4 text-gold-700" aria-hidden="true" />
            {{ t('templatePicker.preview.premiumTitle') }}
          </p>
          <p class="mt-1 text-sm text-ink-700">{{ t('templatePicker.preview.premiumText') }}</p>
          <p v-if="price" class="mt-2 text-sm font-semibold text-ink-900">{{ t('templatePicker.preview.price', { price }) }}</p>
          <ul class="mt-3 flex flex-col gap-1.5">
            <li v-for="item in included" :key="item" class="flex items-start gap-2 text-sm text-ink-700">
              <Check class="mt-0.5 h-4 w-4 shrink-0 text-success-500" aria-hidden="true" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
        <p v-else-if="paidNow" class="rounded-xl bg-success-50 p-4 text-sm text-success-700" role="status">
          {{ t('templatePicker.preview.paid', { name: selected.name }) }}
        </p>
        <p v-if="isCurrent" class="text-sm font-medium text-success-700">{{ t('templatePicker.preview.inUse') }}</p>
      </div>
    </div>

    <!-- 3. confirm -->
    <div v-else-if="view === 'confirm' && selected" class="flex flex-col gap-4">
      <div v-if="picker.impactStatus.value === 'loading'" role="status" :aria-label="t('templatePicker.confirm.loading')">
        <UiSkeleton :lines="4" />
      </div>
      <div v-else-if="picker.impactStatus.value === 'error'" class="rounded-xl bg-danger-50 p-4" role="alert">
        <p class="text-danger-700">{{ t('templatePicker.confirm.failed') }}</p>
        <UiButton class="mt-3" size="sm" variant="secondary" @click="picker.loadImpact(selected)">{{ t('templatePicker.retry') }}</UiButton>
      </div>
      <template v-else-if="picker.impact.value">
        <section v-if="picker.impact.value.keeps?.length">
          <h3 class="text-sm font-semibold text-ink-700">{{ t('templatePicker.confirm.keepsTitle') }}</h3>
          <ul class="mt-2 flex flex-col gap-1.5">
            <li v-for="(item, index) in picker.impact.value.keeps" :key="`k${index}`" class="flex items-start gap-2 text-base text-ink-800">
              <Check class="mt-1 h-4 w-4 shrink-0 text-success-500" aria-hidden="true" />
              <span>{{ kindText('keeps', item) }}</span>
            </li>
          </ul>
        </section>
        <section v-if="picker.impact.value.resets?.length">
          <h3 class="text-sm font-semibold text-ink-700">{{ t('templatePicker.confirm.resetsTitle') }}</h3>
          <ul class="mt-2 flex flex-col gap-1.5">
            <li v-for="(item, index) in picker.impact.value.resets" :key="`r${index}`" class="flex items-start gap-2 text-base text-ink-800">
              <RotateCcw class="mt-1 h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
              <span>{{ kindText('resets', item) }}</span>
            </li>
          </ul>
        </section>
        <p v-if="picker.impact.value.restoresFromStash" class="rounded-xl bg-success-50 p-3 text-sm text-success-700">{{ t('templatePicker.confirm.restores') }}</p>
        <p v-if="picker.impact.value.changesPublishedLook" class="rounded-xl bg-warning-50 p-3 text-sm text-warning-700" role="note">{{ t('templatePicker.confirm.publishedLook') }}</p>
        <p class="text-sm text-ink-500">{{ t('templatePicker.confirm.undoHint') }}</p>
      </template>
      <p v-if="confirmError" class="rounded-xl bg-danger-50 p-3 text-sm text-danger-700" role="alert">{{ t(`templatePicker.errors.${confirmError}`) }}</p>
    </div>

    <!-- 4. already published -->
    <div v-else-if="view === 'published'" class="flex flex-col gap-3">
      <p class="text-base text-ink-700" role="alert">{{ t('templatePicker.published.text') }}</p>
      <p class="text-sm text-ink-500">{{ t('templatePicker.published.hint', { email: SUPPORT_EMAIL }) }}</p>
    </div>

    <template v-if="view !== 'list'" #footer>
      <template v-if="view === 'preview' && selected">
        <UiButton variant="ghost" @click="backToList">
          <ArrowLeft class="h-4 w-4" aria-hidden="true" />
          {{ t('templatePicker.preview.back') }}
        </UiButton>
        <UiButton v-if="isCurrent" disabled>{{ t('templatePicker.preview.inUseButton') }}</UiButton>
        <UiButton v-else-if="isLocked" variant="primary" @click="goUnlock">
          <Lock class="h-4 w-4" aria-hidden="true" />
          {{ t('templatePicker.preview.unlock') }}
        </UiButton>
        <UiButton v-else @click="startUse">{{ paidNow ? t('templatePicker.preview.useNow') : t('templatePicker.preview.use') }}</UiButton>
      </template>
      <template v-else-if="view === 'confirm'">
        <UiButton variant="ghost" :disabled="picker.applying.value" @click="view = 'preview'">{{ t('templatePicker.confirm.cancel') }}</UiButton>
        <UiButton v-if="picker.impact.value?.locked" @click="goUnlock">
          <Lock class="h-4 w-4" aria-hidden="true" />
          {{ t('templatePicker.preview.unlock') }}
        </UiButton>
        <UiButton v-else :loading="picker.applying.value" :disabled="picker.impactStatus.value !== 'ready'" @click="confirm">{{ t('templatePicker.confirm.apply') }}</UiButton>
      </template>
      <template v-else-if="view === 'published'">
        <UiButton variant="ghost" @click="emit('update:open', false)">{{ t('templatePicker.published.close') }}</UiButton>
        <UiButton :href="mailHref">{{ t('templatePicker.published.contact') }}</UiButton>
      </template>
    </template>

    <UiModal :open="missingAsk" :title="t('templatePicker.missing.title')" size="sm" @update:open="value => (missingAsk = value)">
      <p class="text-base text-ink-700" data-testid="missing-ask">{{ t('templatePicker.missing.ask', { names: conflictNames }) }}</p>
      <template #footer>
        <UiButton variant="ghost" @click="missingAsk = false">{{ t('templatePicker.missing.cancel') }}</UiButton>
        <UiButton data-testid="missing-accept" @click="continueUse">{{ t('templatePicker.missing.accept') }}</UiButton>
      </template>
    </UiModal>
  </UiModal>
</template>
