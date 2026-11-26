<script setup>
/**
 * The grid of templates with its states: loading skeletons, load error with retry, nothing available, nothing matches the
 * filters, and the cards. `auto-fill` columns: one template is one card, two are two, six fill the rows (no phantom columns).
 */
import { RotateCcw } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { UiButton, UiEmptyState, UiSkeleton } from '@/ui'
import TemplateCard from './TemplateCard.vue'

defineProps({
  /** idle | loading | ready | error */
  status: { type: String, default: 'idle' },
  /** The templates to draw (already filtered). */
  templates: { type: Array, default: () => [] },
  /** How many exist before filtering: 0 = nothing available. */
  total: { type: Number, default: 0 },
  selectedId: { type: [Number, String], default: null },
  eventId: { type: [Number, String], default: null },
  eventName: { type: String, default: '' },
  dateLabel: { type: String, default: '' },
  canFavorite: { type: Boolean, default: false },
  isFavorite: { type: Function, default: () => false }
})
const emit = defineEmits(['select', 'favorite', 'hover', 'retry', 'clear'])
const { t } = useI18n()
</script>

<template>
  <div class="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3" role="status" :aria-label="t('templatePicker.loading')" v-if="status === 'loading' || status === 'idle'" data-testid="template-skeleton">
    <div v-for="n in 4" :key="n" class="overflow-hidden rounded-xl border border-line bg-white">
      <UiSkeleton height="12rem" />
      <div class="p-3"><UiSkeleton width="70%" height="1.25rem" /></div>
    </div>
  </div>
  <UiEmptyState v-else-if="status === 'error'" compact :title="t('templatePicker.loadFailed')" :description="t('templatePicker.loadFailedHint')">
    <UiButton variant="secondary" @click="emit('retry')">
      <RotateCcw class="h-4 w-4" aria-hidden="true" />
      {{ t('templatePicker.retry') }}
    </UiButton>
  </UiEmptyState>
  <UiEmptyState v-else-if="!total" compact :title="t('templatePicker.empty')" />
  <UiEmptyState v-else-if="!templates.length" compact :title="t('templatePicker.noResults.title')" :description="t('templatePicker.noResults.text')" data-testid="template-no-results">
    <UiButton variant="secondary" @click="emit('clear')">{{ t('templatePicker.filters.clear') }}</UiButton>
  </UiEmptyState>
  <ul v-else class="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3" data-testid="template-grid">
    <li v-for="template in templates" :key="template.id" class="flex">
      <TemplateCard
        :template="template"
        :event-id="eventId"
        :event-name="eventName"
        :date-label="dateLabel"
        :selected="String(template.id) === String(selectedId)"
        :favorite="isFavorite(template.id)"
        :can-favorite="canFavorite"
        @select="emit('select', $event)"
        @favorite="emit('favorite', $event)"
        @hover="emit('hover', $event)"
      />
    </li>
  </ul>
</template>
