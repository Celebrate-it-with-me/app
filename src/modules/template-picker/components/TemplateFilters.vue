<script setup>
/** Search and filters of the grid. The parent decides whether to show it (only with more than two templates). */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Heart, Search } from 'lucide-vue-next'
import { UiInput } from '@/ui'

defineProps({
  access: { type: String, default: 'all' },
  tag: { type: String, default: '' },
  query: { type: String, default: '' },
  favoritesOnly: { type: Boolean, default: false },
  tags: { type: Array, default: () => [] },
  count: { type: Number, default: 0 },
  hasFavorites: { type: Boolean, default: false }
})
const emit = defineEmits(['update:access', 'update:tag', 'update:query', 'update:favoritesOnly'])

const { t, te } = useI18n()
const accessOptions = computed(() => [
  { value: 'all', label: t('templatePicker.filters.all') },
  { value: 'free', label: t('templatePicker.filters.free') },
  { value: 'premium', label: t('templatePicker.filters.premium') }
])
const tagLabel = tag => (te(`templatePicker.styles.${tag}`) ? t(`templatePicker.styles.${tag}`) : tag)
const chip = on => (on ? 'border-rose-600 bg-rose-50 text-rose-800' : 'border-line-strong bg-white text-ink-700 hover:bg-cream-100')
const chipBase =
  'inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rose-600'
</script>

<template>
  <div class="flex flex-col gap-3" data-testid="template-filters">
    <UiInput :model-value="query" type="search" :placeholder="t('templatePicker.search.placeholder')" :aria-label="t('templatePicker.search.label')" @update:model-value="value => emit('update:query', String(value))">
      <template #leading><Search class="h-4 w-4 text-ink-500" aria-hidden="true" /></template>
    </UiInput>
    <div class="flex flex-wrap items-center gap-x-2 gap-y-2">
      <div class="flex flex-wrap items-center gap-2" role="group" :aria-label="t('templatePicker.filters.access')">
        <button
          v-for="option in accessOptions"
          :key="option.value"
          type="button"
          :class="[chipBase, chip(access === option.value)]"
          :aria-pressed="access === option.value"
          @click="emit('update:access', option.value)"
        >
          {{ option.label }}
        </button>
        <button v-if="hasFavorites" type="button" :class="[chipBase, chip(favoritesOnly)]" :aria-pressed="favoritesOnly" @click="emit('update:favoritesOnly', !favoritesOnly)">
          <Heart class="h-4 w-4" aria-hidden="true" />
          {{ t('templatePicker.filters.favorites') }}
        </button>
      </div>
      <span v-if="tags.length" class="hidden h-6 w-px bg-line-strong sm:block" aria-hidden="true"></span>
      <div v-if="tags.length" class="flex flex-wrap items-center gap-2" role="group" :aria-label="t('templatePicker.filters.style')" data-testid="template-tags">
        <button v-for="item in tags" :key="item" type="button" :class="[chipBase, chip(tag === item)]" :aria-pressed="tag === item" @click="emit('update:tag', tag === item ? '' : item)">
          {{ tagLabel(item) }}
        </button>
      </div>
    </div>
    <p class="text-sm text-ink-600" role="status" data-testid="template-count">{{ t('templatePicker.count', { count }, count) }}</p>
  </div>
</template>
