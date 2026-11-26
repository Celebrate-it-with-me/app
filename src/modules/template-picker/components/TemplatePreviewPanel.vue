<script setup>
/**
 * Right zone of the selector: the template being looked at, drawn with the event's real data in a phone. The phone is a
 * picture of the cover (inert: no scroll of its own); the whole invitation opens in a full-screen view. The parent owns
 * what is shown (template, palette, language, stage) and the payloads; this lays it out and speaks the states (skeleton,
 * error). "Compare" puts the invitation as it is saved now next to the chosen one.
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Columns2, Lock, Maximize2 } from 'lucide-vue-next'
import { UiBadge, UiButton, UiSkeleton } from '@/ui'
import { pickText } from '../utils/templatePicker'
import TemplatePreviewFrame from './TemplatePreviewFrame.vue'
import SegmentedControl from './SegmentedControl.vue'
import PaletteSwatches from './PaletteSwatches.vue'

const props = defineProps({
  template: { type: Object, default: null },
  payload: { type: Object, default: null },
  /** idle | loading | ready | error */
  status: { type: String, default: 'idle' },
  error: { type: String, default: null },
  language: { type: String, default: 'es' },
  stage: { type: String, default: 'invitation' },
  /** Normalized palettes of the template (`templatePresets`) and the one chosen ('' = the template's own). */
  presets: { type: Array, default: () => [] },
  preset: { type: String, default: '' },
  /** Compare with the current invitation: only offered when the chosen one is not the current one. */
  canCompare: { type: Boolean, default: false },
  comparing: { type: Boolean, default: false },
  comparePayload: { type: Object, default: null },
  compareStatus: { type: String, default: 'idle' },
  /** What the premium box lists as included. */
  included: { type: Array, default: () => [] },
  paidNow: { type: Boolean, default: false }
})
const emit = defineEmits(['update:language', 'update:stage', 'update:preset', 'update:comparing', 'retry', 'full', 'hover-preset'])

const { t, locale } = useI18n()
const framed = computed(() => !!props.payload)
// The skeleton waits for the first drawn payload only; after that the previous one stays under a thin veil while the next arrives.
const painted = ref(false)
const compared = ref(false)
const waiting = computed(() => props.status === 'loading' || (framed.value && !painted.value))
const languageOptions = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' }
]
const stageOptions = computed(() => [
  { value: 'invitation', label: t('templatePicker.preview.states.invitation') },
  { value: 'save_the_date', label: t('templatePicker.preview.states.saveTheDate') }
])
const failedText = computed(() => (props.error === 'forbidden' ? t('templatePicker.errors.previewForbidden') : t('templatePicker.preview.failed')))
const isPremium = computed(() => props.template?.tier === 'premium')
const phone = 'relative aspect-[390/844] shrink-0 overflow-hidden rounded-[1.5rem] border-4 border-ink-900 bg-cream-100 shadow-card'
</script>

<template>
  <section class="flex min-h-0 shrink-0 flex-col gap-4 bg-cream-50 p-4 sm:p-5 lg:overflow-y-auto lg:border-l lg:border-line" :aria-label="t('templatePicker.panel.label')" data-testid="template-panel">
    <div class="flex flex-wrap items-center justify-center gap-2">
      <SegmentedControl :model-value="language" :options="languageOptions" :label="t('templatePicker.preview.language')" @update:model-value="emit('update:language', $event)" />
      <SegmentedControl :model-value="stage" :options="stageOptions" :label="t('templatePicker.preview.state')" @update:model-value="emit('update:stage', $event)" />
    </div>

    <div class="flex items-start justify-center gap-3" :class="comparing ? 'px-1' : ''">
      <figure v-if="comparing" class="m-0 flex min-w-0 flex-1 flex-col items-center gap-1.5" data-testid="compare-current" :aria-label="t('templatePicker.compare.label')">
        <div :class="[phone, 'h-[clamp(10rem,28dvh,19rem)]']">
          <TemplatePreviewFrame v-if="comparePayload" scaled inert :payload="comparePayload" :title="t('templatePicker.compare.current')" @ready="compared = true" />
          <div v-if="compareStatus === 'loading' && !compared" class="absolute inset-0" role="status" :aria-label="t('templatePicker.preview.loading')"><UiSkeleton height="100%" /></div>
          <p v-else-if="compareStatus === 'error'" class="absolute inset-0 flex items-center justify-center bg-cream-100 px-3 text-center text-xs text-ink-700" role="alert">{{ t('templatePicker.compare.failed') }}</p>
        </div>
        <figcaption class="text-xs font-semibold text-ink-700">{{ t('templatePicker.compare.current') }}</figcaption>
      </figure>

      <figure class="m-0 flex min-w-0 flex-col items-center gap-1.5" :class="comparing ? 'flex-1' : ''">
        <div :class="[phone, comparing ? 'h-[clamp(10rem,28dvh,19rem)]' : 'h-[clamp(12rem,36dvh,25rem)]']" data-testid="template-phone">
          <TemplatePreviewFrame v-if="framed" scaled inert :payload="payload" :title="t('templatePicker.preview.frameTitle', { name: template?.name ?? '' })" @ready="painted = true" />
          <div v-if="waiting && status !== 'error'" class="absolute inset-0" :class="framed ? 'bg-cream-100/60' : ''" role="status" :aria-label="t('templatePicker.preview.loading')" data-testid="phone-skeleton">
            <UiSkeleton v-if="!framed" height="100%" />
          </div>
          <div v-if="status === 'error'" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-cream-100 px-4 text-center" role="alert">
            <p class="text-sm text-ink-700">{{ failedText }}</p>
            <UiButton v-if="error !== 'forbidden'" size="sm" variant="secondary" @click="emit('retry')">{{ t('templatePicker.retry') }}</UiButton>
          </div>
        </div>
        <figcaption v-if="comparing" class="text-xs font-semibold text-ink-700">{{ t('templatePicker.compare.chosen') }}</figcaption>
      </figure>
    </div>

    <div v-if="template" class="flex flex-col gap-3">
      <div class="flex items-start justify-between gap-2">
        <h3 class="min-w-0 break-words font-heading text-xl leading-tight text-ink-900">{{ template.name }}</h3>
        <UiBadge class="shrink-0" :tone="template.current ? 'rose' : isPremium ? 'gold' : 'neutral'" size="sm">
          {{ template.current ? t('templatePicker.currentBadge') : isPremium ? t('templatePicker.premium') : t('templatePicker.free') }}
        </UiBadge>
      </div>
      <PaletteSwatches :presets="presets" :model-value="preset" @update:model-value="emit('update:preset', $event)" @hover="emit('hover-preset', $event)" />
      <div class="flex flex-wrap items-center gap-2">
      <UiButton variant="secondary" size="sm" :disabled="!payload" data-testid="full-view" @click="emit('full')">
        <Maximize2 class="h-4 w-4" aria-hidden="true" />
        {{ t('templatePicker.fullView.open') }}
      </UiButton>
      <UiButton v-if="canCompare" variant="ghost" size="sm" :aria-pressed="comparing" data-testid="compare-toggle" @click="emit('update:comparing', !comparing)">
        <Columns2 class="h-4 w-4" aria-hidden="true" />
        {{ comparing ? t('templatePicker.compare.hide') : t('templatePicker.compare.toggle') }}
      </UiButton>
      </div>
      <p v-if="pickText(template.description, locale)" class="text-sm text-ink-600">{{ pickText(template.description, locale) }}</p>
      <div v-if="template.locked" class="rounded-xl bg-gold-100 p-3">
        <p class="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Lock class="h-4 w-4 text-gold-700" aria-hidden="true" />
          {{ t('templatePicker.preview.premiumTitle') }}
        </p>
        <p class="mt-1 text-sm text-ink-700">{{ t('templatePicker.preview.premiumText') }}</p>
        <ul v-if="included.length" class="mt-2 flex flex-col gap-1">
          <li v-for="item in included" :key="item" class="flex items-start gap-2 text-sm text-ink-700">
            <Check class="mt-0.5 h-4 w-4 shrink-0 text-success-500" aria-hidden="true" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
      <p v-else-if="paidNow" class="rounded-xl bg-success-50 p-3 text-sm text-success-700" role="status">{{ t('templatePicker.preview.paid', { name: template.name }) }}</p>
    </div>
  </section>
</template>
