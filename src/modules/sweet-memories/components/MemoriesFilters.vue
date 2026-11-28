<script setup>
import { useI18n } from 'vue-i18n'
import { Search } from 'lucide-vue-next'
import { ALL_YEARS } from '@/modules/sweet-memories/utils/memories'

defineProps({
  search: { type: String, default: '' },
  year: { type: String, default: ALL_YEARS },
  sort: { type: String, default: 'oldest' },
  years: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:search', 'update:year', 'toggle-sort'])
const { t } = useI18n()

const CHIP =
  'inline-flex h-[34px] shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-rose-600 relative touch-target motion-reduce:transition-none'
const chipClass = active =>
  active ? `${CHIP} border-ink-900 bg-ink-900 text-white` : `${CHIP} border-cream-300 bg-white text-ink-700 hover:bg-cream-100`
</script>

<template>
  <div class="flex flex-wrap items-center gap-2.5">
    <div class="relative basis-full md:min-w-[200px] md:flex-1 md:basis-0">
      <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
      <input
        type="search"
        :value="search"
        :placeholder="t('app.memories.filters.searchPlaceholder')"
        :aria-label="t('app.memories.filters.searchPlaceholder')"
        autocomplete="off"
        class="h-11 w-full rounded-full border border-cream-300 bg-white pl-[38px] pr-4 text-base text-ink-900 outline-none placeholder:text-ink-400 focus-visible:ring-2 focus-visible:ring-rose-600 md:h-10"
        @input="emit('update:search', $event.target.value)"
      />
    </div>

    <div
      v-if="years.length > 1"
      role="group"
      :aria-label="t('app.memories.filters.years')"
      class="flex min-w-0 max-w-full items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button type="button" :class="chipClass(year === ALL_YEARS)" :aria-pressed="year === ALL_YEARS" @click="emit('update:year', ALL_YEARS)">
        {{ t('app.memories.filters.allYears') }}
      </button>
      <button
        v-for="y in years"
        :key="y"
        type="button"
        :class="chipClass(String(y) === year)"
        :aria-pressed="String(y) === year"
        @click="emit('update:year', String(y))"
      >
        {{ y }}
      </button>
    </div>

    <button type="button" :class="chipClass(false)" @click="emit('toggle-sort')">
      {{ t(`app.memories.filters.${sort}`) }}
    </button>
  </div>
</template>
