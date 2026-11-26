<script setup>
/**
 * One template in the grid: its real miniature, one badge (Actual > Premium > Gratis), its name, how many palettes it has
 * and the heart. Choosing a card selects it (the preview shows it); it never closes anything. The heart is a sibling
 * button, not inside the card button (a button inside a button is invalid HTML).
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Heart, Lock, Puzzle } from 'lucide-vue-next'
import InvitationMiniature from './InvitationMiniature.vue'
import { missingModulesOf, moduleNames, templatePresets } from '../utils/templatePicker'

const props = defineProps({
  template: { type: Object, required: true },
  /** Event whose real cover is drawn with this template; without it the miniature falls back to the image or the stationery card. */
  eventId: { type: [Number, String], default: null },
  /** The card being previewed. */
  selected: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
  /** Show the heart (only worth it when there is a lot to choose from). */
  canFavorite: { type: Boolean, default: false },
  /** Real event data for the stationery fallback of the miniature. */
  eventName: { type: String, default: '' },
  dateLabel: { type: String, default: '' },
  /** Skip the live cover (roles that cannot call the preview). */
  live: { type: Boolean, default: true },
  /** ms before the miniature's single quiet retry after a failure. */
  retryDelay: { type: Number, default: 8000 }
})
const emit = defineEmits(['select', 'favorite', 'hover'])

const { t, te } = useI18n()
const presets = computed(() => templatePresets(props.template))
const missing = computed(() => moduleNames(missingModulesOf(props.template), { t, te }).join(', '))
const badge = computed(() => {
  if (props.template.current) return { key: 'current', text: t('templatePicker.currentBadge'), classes: 'bg-rose-600 text-white' }
  if (props.template.tier === 'premium') return { key: 'premium', text: t('templatePicker.premium'), classes: 'bg-gold-100 text-gold-700' }
  return { key: 'free', text: t('templatePicker.free'), classes: 'bg-white/95 text-ink-700' }
})
const label = computed(() =>
  [
    props.template.name,
    badge.value.text,
    props.template.locked && !props.template.current ? t('templatePicker.lockedShort') : '',
    presets.value.length > 1 ? t('templatePicker.palettes.count', { count: presets.value.length }) : '',
    missing.value ? t('templatePicker.missing.label', { names: missing.value }) : ''
  ]
    .filter(Boolean)
    .join(', ')
)
const heartLabel = computed(() => t(props.favorite ? 'templatePicker.favorite.remove' : 'templatePicker.favorite.add', { name: props.template.name }))
</script>

<template>
  <div class="relative flex w-full" @pointerenter="emit('hover', template)" @focusin="emit('hover', template)">
    <button
      type="button"
      class="group flex w-full flex-col overflow-hidden rounded-xl border bg-white text-left transition-shadow duration-150 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
      :class="selected ? 'border-rose-600 shadow-card ring-2 ring-rose-600' : 'border-line'"
      :aria-label="label"
      :aria-pressed="selected"
      @click="emit('select', template)"
    >
      <span class="relative block aspect-[4/5] w-full overflow-hidden bg-cream-200">
        <InvitationMiniature
          :event-id="eventId"
          :template-id="template.id"
          :fallback-image="template.previewImage || ''"
          :name="eventName || template.name"
          :date-label="dateLabel"
          :live="live"
          :timeout="20000"
          :retry-delay="retryDelay"
          pooled
        />
        <span class="absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold shadow-soft" :class="badge.classes" data-testid="template-badge" aria-hidden="true">
          <Check v-if="badge.key === 'current'" class="h-3.5 w-3.5" />
          <Lock v-else-if="template.locked" class="h-3.5 w-3.5" />
          {{ badge.text }}
        </span>
      </span>
      <span class="flex flex-1 flex-col gap-1 p-3">
        <span class="line-clamp-2 min-w-0 break-words font-heading text-lg leading-tight text-ink-900">{{ template.name }}</span>
        <span v-if="presets.length > 1" class="flex items-center gap-1.5 text-xs text-ink-600" data-testid="template-palettes">
          <span class="flex -space-x-1" aria-hidden="true">
            <span
              v-for="preset in presets.slice(0, 4)"
              :key="preset.key"
              class="h-3.5 w-3.5 rounded-full border border-white ring-1 ring-line"
              :style="{ background: preset.palette.accent || preset.palette.background || '#ccc' }"
            ></span>
          </span>
          {{ t('templatePicker.palettes.count', { count: presets.length }) }}
        </span>
        <span v-if="missing" class="flex items-start gap-1.5 text-xs text-warning-700" data-testid="template-missing">
          <Puzzle class="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{{ t('templatePicker.missing.label', { names: missing }) }}</span>
        </span>
      </span>
    </button>
    <button
      v-if="canFavorite"
      type="button"
      class="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full text-ink-700 focus-visible:outline-2 focus-visible:outline-rose-600"
      :aria-pressed="favorite"
      :aria-label="heartLabel"
      data-testid="template-favorite"
      @click.stop="emit('favorite', template)"
    >
      <span class="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-soft">
        <Heart class="h-4 w-4" :class="favorite ? 'fill-rose-600 text-rose-600' : ''" aria-hidden="true" />
      </span>
    </button>
  </div>
</template>
