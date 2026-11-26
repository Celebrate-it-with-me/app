<script setup>
/**
 * Right zone of the selector: the template being looked at, drawn with the event's real data in a phone. The phone is a
 * picture of the cover (inert: no scroll of its own); the whole invitation opens in a full-screen view. The parent owns
 * what is shown (template, language, stage) and the payload; this lays it out and speaks the states (skeleton, error).
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Lock } from 'lucide-vue-next'
import { UiBadge, UiButton, UiSkeleton } from '@/ui'
import { pickText } from '../utils/templatePicker'
import TemplatePreviewFrame from './TemplatePreviewFrame.vue'
import SegmentedControl from './SegmentedControl.vue'

const props = defineProps({
  template: { type: Object, default: null },
  payload: { type: Object, default: null },
  /** idle | loading | ready | error */
  status: { type: String, default: 'idle' },
  error: { type: String, default: null },
  language: { type: String, default: 'es' },
  stage: { type: String, default: 'invitation' },
  /** What the premium box lists as included. */
  included: { type: Array, default: () => [] },
  paidNow: { type: Boolean, default: false }
})
const emit = defineEmits(['update:language', 'update:stage', 'retry'])

const { t, locale } = useI18n()
const framed = computed(() => !!props.payload)
// The skeleton waits for the first drawn payload only; after that the previous one stays under a thin veil while the next arrives.
const painted = ref(false)
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
</script>

<template>
  <section class="flex min-h-0 shrink-0 flex-col gap-4 bg-cream-50 p-4 sm:p-5 lg:overflow-y-auto lg:border-l lg:border-line" :aria-label="t('templatePicker.panel.label')" data-testid="template-panel">
    <div class="flex flex-wrap items-center justify-center gap-2">
      <SegmentedControl :model-value="language" :options="languageOptions" :label="t('templatePicker.preview.language')" @update:model-value="emit('update:language', $event)" />
      <SegmentedControl :model-value="stage" :options="stageOptions" :label="t('templatePicker.preview.state')" @update:model-value="emit('update:stage', $event)" />
    </div>

    <div class="flex justify-center">
      <div
        class="relative aspect-[390/844] h-[clamp(13rem,40dvh,25rem)] shrink-0 overflow-hidden rounded-[1.5rem] border-4 border-ink-900 bg-cream-100 shadow-card"
        data-testid="template-phone"
      >
        <TemplatePreviewFrame v-if="framed" scaled inert :payload="payload" :title="t('templatePicker.preview.frameTitle', { name: template?.name ?? '' })" @ready="painted = true" />
        <div v-if="waiting && status !== 'error'" class="absolute inset-0" :class="framed ? 'bg-cream-100/60' : ''" role="status" :aria-label="t('templatePicker.preview.loading')" data-testid="phone-skeleton">
          <UiSkeleton v-if="!framed" height="100%" />
        </div>
        <div v-if="status === 'error'" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-cream-100 px-4 text-center" role="alert">
          <p class="text-sm text-ink-700">{{ failedText }}</p>
          <UiButton v-if="error !== 'forbidden'" size="sm" variant="secondary" @click="emit('retry')">{{ t('templatePicker.retry') }}</UiButton>
        </div>
      </div>
    </div>

    <div v-if="template" class="flex flex-col gap-2">
      <div class="flex items-start justify-between gap-2">
        <h3 class="min-w-0 break-words font-heading text-xl leading-tight text-ink-900">{{ template.name }}</h3>
        <UiBadge class="shrink-0" :tone="template.current ? 'rose' : isPremium ? 'gold' : 'neutral'" size="sm">
          {{ template.current ? t('templatePicker.currentBadge') : isPremium ? t('templatePicker.premium') : t('templatePicker.free') }}
        </UiBadge>
      </div>
      <p v-if="pickText(template.description, locale)" class="text-sm text-ink-600">{{ pickText(template.description, locale) }}</p>
      <slot name="details" />
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
