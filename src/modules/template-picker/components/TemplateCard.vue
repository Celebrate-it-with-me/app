<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Lock, Puzzle } from 'lucide-vue-next'
import { UiBadge } from '@/ui'
import InvitationMiniature from './InvitationMiniature.vue'
import { missingModulesOf, moduleNames, pickText } from '../utils/templatePicker'

const props = defineProps({
  template: { type: Object, required: true },
  /** Event whose real cover is drawn with this template; without it the miniature falls back to the image or the stationery card. */
  eventId: { type: [Number, String], default: null },
  /** Skip the live cover (roles that cannot call the preview). */
  live: { type: Boolean, default: true },
  /** ms before the miniature's single quiet retry after a failure. */
  retryDelay: { type: Number, default: 8000 }
})
defineEmits(['select'])

const { t, te, locale } = useI18n()
const description = computed(() => pickText(props.template.description, locale.value))
const missing = computed(() => moduleNames(missingModulesOf(props.template), { t, te }).join(', '))
const label = computed(() =>
  [props.template.name, props.template.tier === 'premium' ? t('templatePicker.premium') : t('templatePicker.free'), props.template.current ? t('templatePicker.inUse') : '', props.template.locked ? t('templatePicker.lockedShort') : '', missing.value ? t('templatePicker.missing.label', { names: missing.value }) : '']
    .filter(Boolean)
    .join(', ')
)
</script>

<template>
  <button
    type="button"
    class="group flex w-full flex-col overflow-hidden rounded-xl border bg-white text-left transition-shadow hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
    :class="template.current ? 'border-rose-600 ring-1 ring-rose-600' : 'border-line'"
    :aria-label="label"
    @click="$emit('select', template)"
  >
    <span class="relative block aspect-[390/844] w-full overflow-hidden bg-cream-200">
      <InvitationMiniature
        :event-id="eventId"
        :template-id="template.id"
        :fallback-image="template.previewImage || ''"
        :name="template.name"
        :live="live"
        :timeout="20000"
        :retry-delay="retryDelay"
        pooled
      />
      <span v-if="template.locked" class="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gold-700 shadow-card" aria-hidden="true">
        <Lock class="h-4 w-4" />
      </span>
      <span v-if="template.current" class="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-rose-600 px-2 py-1 text-xs font-semibold text-white" aria-hidden="true">
        <Check class="h-3.5 w-3.5" />
        {{ t('templatePicker.inUse') }}
      </span>
    </span>
    <span class="flex flex-1 flex-col gap-1.5 p-3">
      <span class="flex items-start justify-between gap-2">
        <span class="font-heading text-lg leading-tight text-ink-900">{{ template.name }}</span>
        <UiBadge :tone="template.tier === 'premium' ? 'gold' : 'neutral'" size="sm">
          {{ template.tier === 'premium' ? t('templatePicker.premium') : t('templatePicker.free') }}
        </UiBadge>
      </span>
      <span v-if="description" class="line-clamp-2 text-sm text-ink-600">{{ description }}</span>
      <span v-if="missing" class="flex items-start gap-1.5 text-xs text-warning-700" data-testid="template-missing">
        <Puzzle class="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{{ t('templatePicker.missing.label', { names: missing }) }}</span>
      </span>
      <span v-if="template.locked" class="mt-auto pt-1 text-xs font-medium text-gold-700">{{ t('templatePicker.lockedHint') }}</span>
    </span>
  </button>
</template>
