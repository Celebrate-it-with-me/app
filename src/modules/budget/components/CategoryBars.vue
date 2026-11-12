<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiCard } from '@/ui'
import { formatMoney, percent } from '../utils/budget'

const props = defineProps({
  summary: { type: Object, required: true }
})
const { t, locale } = useI18n()

const money = value => formatMoney(value, props.summary.currency, locale.value)

// Only categories that have something in them; the biggest share first.
const rows = computed(() => {
  const list = props.summary.categories.filter(c => c.itemCount > 0)
  if (props.summary.uncategorized.itemCount) {
    list.push({ id: 'none', name: t('app.budget.uncategorized'), totals: props.summary.uncategorized.totals })
  }
  const biggest = Math.max(1, ...list.map(c => c.totals.owed))
  return list
    .map(c => ({ ...c, share: percent(c.totals.owed, biggest), paidShare: percent(c.totals.paid, c.totals.owed) }))
    .sort((a, b) => b.totals.owed - a.totals.owed)
})
</script>

<template>
  <UiCard v-if="rows.length" :title="t('app.budget.byCategory')" heading-level="h2">
    <ul class="space-y-4">
      <li v-for="row in rows" :key="row.id">
        <div class="flex items-baseline justify-between gap-3 text-sm">
          <span class="font-medium text-ink-900">{{ row.name }}</span>
          <span class="tabular-nums text-ink-700">{{ money(row.totals.paid) }} <span class="text-ink-500">/ {{ money(row.totals.owed) }}</span></span>
        </div>
        <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-cream-100" aria-hidden="true">
          <div class="h-full origin-left rounded-full bg-gold-300 transition-transform duration-500 ease-out" :style="{ width: row.share + '%' }">
            <div class="h-full origin-left rounded-full bg-rose-600" :style="{ width: row.paidShare + '%' }" />
          </div>
        </div>
      </li>
    </ul>
  </UiCard>
</template>
