<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiCard } from '@/ui'
import { formatMoney } from '@/modules/budget/utils/budget'

const props = defineProps({
  budgetEnabled: { type: Boolean, default: false },
  budget: { type: Object, default: () => ({ cap: 0, estimated: 0, paid: 0, items: 0, overByCents: 0, paidOverByCents: 0 }) },
  /** Next moments of the day, already sorted: `[{ id, title, time }]`. */
  program: { type: Array, default: () => [] }
})

const { t, locale } = useI18n()
const money = computed(() => value =>
  new Intl.NumberFormat(locale.value === 'es' ? 'es-US' : 'en-US', {
    style: 'currency',
    currency: props.budget.currency || 'USD',
    maximumFractionDigits: 0
  }).format(value || 0)
)
// The overage comes in whole cents (no float maths); it shows cents only when there are some.
const overText = cents => t('app.dashboard.more.budgetOver', { amount: formatMoney(cents / 100, props.budget.currency, locale.value) })
</script>

<template>
  <section aria-labelledby="more-title" class="pt-10">
    <h2 id="more-title" class="font-heading text-2xl text-ink-900">{{ t('app.dashboard.more.title') }}</h2>
    <p class="mt-1 text-sm text-ink-600">{{ t('app.dashboard.more.subtitle') }}</p>

    <div class="mt-4 grid gap-4 md:grid-cols-2">
      <UiCard v-if="budgetEnabled" :title="t('app.dashboard.more.budget')" heading-level="h3" padding="sm" flat>
        <p v-if="!budget.items" class="text-sm text-ink-600">{{ t('app.dashboard.more.budgetEmpty') }}</p>
        <dl v-else class="space-y-1.5 text-sm">
          <div v-if="budget.cap" class="flex justify-between gap-3">
            <dt class="text-ink-600">{{ t('app.dashboard.more.budgetCap') }}</dt>
            <dd class="tabular-nums text-ink-900">{{ money(budget.cap) }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-ink-600">{{ t('app.dashboard.more.budgetEstimated') }}</dt>
            <dd class="tabular-nums" :class="budget.overByCents > 0 ? 'font-semibold text-warning-700' : 'text-ink-900'" data-testid="budget-estimated">{{ money(budget.estimated) }}</dd>
          </div>
          <p v-if="budget.overByCents > 0" class="text-right text-xs font-semibold text-warning-700" data-testid="budget-over">{{ overText(budget.overByCents) }}</p>
          <div class="flex justify-between gap-3">
            <dt class="text-ink-600">{{ t('app.dashboard.more.budgetPaid') }}</dt>
            <dd class="tabular-nums" :class="budget.paidOverByCents > 0 ? 'font-semibold text-warning-700' : 'text-ink-900'" data-testid="budget-paid">{{ money(budget.paid) }}</dd>
          </div>
          <p v-if="budget.paidOverByCents > 0" class="text-right text-xs font-semibold text-warning-700" data-testid="budget-paid-over">{{ overText(budget.paidOverByCents) }}</p>
        </dl>
        <router-link to="/dashboard/budget" class="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-rose-700 underline-offset-4 hover:underline">{{ t('app.dashboard.more.budgetOpen') }}</router-link>
      </UiCard>

      <UiCard :title="t('app.dashboard.more.program')" heading-level="h3" padding="sm" flat>
        <p v-if="!program.length" class="text-sm text-ink-600">{{ t('app.dashboard.more.programEmpty') }}</p>
        <ul v-else class="space-y-2 text-sm">
          <li v-for="item in program" :key="item.id" class="flex gap-3">
            <span class="w-[4.5rem] shrink-0 whitespace-nowrap tabular-nums text-ink-600">{{ item.time }}</span>
            <span class="min-w-0 text-ink-900">{{ item.title }}</span>
          </li>
        </ul>
        <router-link to="/dashboard/timeline" class="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-rose-700 underline-offset-4 hover:underline">{{ t('app.dashboard.more.programOpen') }}</router-link>
      </UiCard>
    </div>
  </section>
</template>
