<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiCard } from '@/ui'
import { formatMoney, barOf } from '../utils/budget'

const props = defineProps({
  summary: { type: Object, required: true }
})
const emit = defineEmits(['select'])
const { t, locale } = useI18n()

const money = value => formatMoney(value, props.summary.currency, locale.value)

const FILL = { complete: 'bg-success-500', partial: 'bg-rose-600', over: 'bg-danger-500' }

// Only categories that have something in them; the most expensive first. One bar each: what is paid over the category's cost.
const rows = computed(() => {
  const list = props.summary.categories.filter(c => c.itemCount > 0)
  if (props.summary.uncategorized.itemCount) {
    list.push({ id: 'none', name: t('app.budget.uncategorized'), totals: props.summary.uncategorized.totals })
  }
  return list.map(c => ({ ...c, bar: barOf(c.totals) })).sort((a, b) => b.bar.total - a.bar.total)
})

function noteOf(bar) {
  if (bar.tone === 'over') return { text: t('app.budget.categoryOver', { amount: money(bar.overpaid) }), class: 'text-danger-700' }
  if (bar.tone === 'complete') return { text: t('app.budget.categoryDone'), class: 'text-success-700' }
  return { text: t('app.budget.categoryLeft', { amount: money(bar.remaining) }), class: 'text-ink-500' }
}
</script>

<template>
  <UiCard v-if="rows.length" as="section" :aria-label="t('app.budget.byCategory')" data-testid="category-bars">
    <header class="mb-3 flex flex-col gap-0.5 md:flex-row md:items-baseline md:justify-between md:gap-3">
      <h2 class="font-heading text-xl text-ink-900">{{ t('app.budget.byCategory') }}</h2>
      <p class="text-xs text-ink-500">{{ t('app.budget.byCategoryHelp') }}</p>
    </header>
    <ul>
      <li v-for="row in rows" :key="row.id">
        <button
          type="button"
          class="grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-1.5 rounded-[10px] px-2 py-[9px] text-left hover:bg-cream-50 focus-visible:outline-2 focus-visible:outline-rose-600 md:grid-cols-[170px_minmax(0,1fr)_150px] md:gap-y-0"
          :data-row="row.id"
          @click="emit('select', row.id)"
        >
          <span class="min-w-0 truncate text-sm text-ink-900">{{ row.name }}</span>
          <span class="h-2 overflow-hidden rounded-full bg-cream-200 max-md:order-last max-md:col-span-2" aria-hidden="true">
            <span class="block h-full rounded-full" :class="FILL[row.bar.tone]" :style="{ width: `${row.bar.fill}%` }" data-testid="cat-fill" :data-tone="row.bar.tone"></span>
          </span>
          <span class="text-right text-[13px] tabular-nums text-ink-900">
            <b class="font-semibold">{{ money(row.bar.paid) }}</b> / {{ money(row.bar.total) }}
            <span class="block text-[11px] leading-tight" :class="noteOf(row.bar).class" data-testid="cat-note">{{ noteOf(row.bar).text }}</span>
          </span>
        </button>
      </li>
    </ul>
  </UiCard>
</template>
