<script setup>
/**
 * "Presupuesto": paid, left to pay, the cap and how far what is committed goes past it, plus one bar per category (the bar
 * is what is paid, the mark what is estimated; red when paid went past the estimate). Every amount uses one formatter
 * (`formatMoney`) in the event's currency.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Wallet } from 'lucide-vue-next'
import { UiButton, UiCard, UiEmptyState, UiSkeleton } from '@/ui'
import { formatMoney } from '@/modules/budget/utils/budget'
import DashboardBlock from './DashboardBlock.vue'
import { budgetBars, budgetFigures } from './dashboardLogic'

const props = defineProps({
  /** `GET budget` payload (null until it loads). */
  summary: { type: Object, default: null },
  /** loading | ready | error */
  status: { type: String, default: 'loading' },
  canEdit: { type: Boolean, default: false }
})
defineEmits(['retry'])

const { t, locale } = useI18n()
const figures = computed(() => budgetFigures(props.summary))
const bars = computed(() => budgetBars(props.summary))
const money = value => formatMoney(value, figures.value.currency, locale.value)
const empty = computed(() => figures.value.items === 0 && figures.value.cap === null)

const tiles = computed(() => {
  const f = figures.value
  return [
    { key: 'paid', label: t('app.dashboard.budget.paid'), value: f.paid },
    { key: 'remaining', label: t('app.dashboard.budget.remaining'), value: f.remaining },
    f.cap !== null && { key: 'cap', label: t('app.dashboard.budget.cap'), value: f.cap },
    f.overCap && f.overBy > 0 && { key: 'over', label: t('app.dashboard.budget.over'), value: f.overBy, warn: true }
  ].filter(Boolean)
})
const nameOf = bar => bar.name || t('app.dashboard.budget.uncategorized')
const noteOf = bar => (bar.over ? t('app.dashboard.budget.overEstimate', { amount: money(bar.overBy) }) : `${money(bar.paid)} / ${money(bar.estimated)}`)
const srOf = bar => t('app.dashboard.budget.barLabel', { paid: money(bar.paid), estimated: money(bar.estimated) })
</script>

<template>
  <UiCard as="section" :title="t('app.dashboard.budget.title')" heading-level="h2" class="mt-4" data-testid="dashboard-budget">
    <template #actions>
      <router-link
        to="/dashboard/budget"
        class="inline-flex min-h-11 items-center text-sm font-semibold text-rose-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-rose-600"
      >{{ t('app.dashboard.budget.open') }}</router-link>
    </template>

    <DashboardBlock :status="status" :error-text="t('app.dashboard.budget.error')" @retry="$emit('retry')">
      <template #skeleton>
        <div data-testid="budget-skeleton">
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <UiSkeleton v-for="n in 4" :key="n" height="4.25rem" />
          </div>
          <div class="mt-5 flex flex-col gap-4">
            <UiSkeleton v-for="n in 5" :key="n" height="1rem" />
          </div>
        </div>
      </template>

      <UiEmptyState v-if="empty" compact :title="t('app.dashboard.budget.emptyTitle')" :description="t('app.dashboard.budget.emptyText')" data-testid="budget-empty">
        <template #icon><Wallet class="h-6 w-6" aria-hidden="true" /></template>
        <UiButton v-if="canEdit" to="/dashboard/budget">{{ t('app.dashboard.budget.emptyCta') }}</UiButton>
      </UiEmptyState>

      <template v-else>
        <dl class="grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="budget-tiles">
          <div
            v-for="tile in tiles"
            :key="tile.key"
            class="min-w-0 rounded-lg px-3.5 py-3"
            :class="tile.warn ? 'bg-danger-50' : 'bg-cream-100'"
            :data-tile="tile.key"
          >
            <dt class="text-xs" :class="tile.warn ? 'font-semibold text-danger-700' : 'text-ink-500'">{{ tile.label }}</dt>
            <dd class="mt-0.5 truncate font-heading text-xl tabular-nums sm:text-2xl" :class="tile.warn ? 'text-danger-700' : 'text-ink-900'">{{ money(tile.value) }}</dd>
          </div>
        </dl>

        <ul v-if="bars.length" class="mt-5 flex flex-col gap-3.5" data-testid="budget-bars">
          <li
            v-for="bar in bars"
            :key="bar.key"
            class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[9.5rem_minmax(0,1fr)_8.5rem]"
            :data-bar="bar.key"
            :data-over="bar.over"
          >
            <span class="min-w-0 truncate text-sm text-ink-900">{{ nameOf(bar) }}</span>
            <span
              class="text-right text-[0.8125rem] tabular-nums sm:order-last"
              :class="bar.over ? 'font-semibold text-danger-700' : 'text-ink-500'"
              data-testid="bar-note"
            >{{ noteOf(bar) }}<span class="sr-only"> ({{ srOf(bar) }})</span></span>
            <span class="relative col-span-2 h-3 rounded-full bg-cream-300 sm:col-span-1" aria-hidden="true">
              <span class="absolute inset-y-0 left-0 rounded-full" :class="bar.over ? 'bg-danger-500' : 'bg-success-500'" :style="{ width: `${bar.paidPct}%` }" data-testid="bar-paid"></span>
              <span
                v-if="bar.estimated > 0"
                class="absolute -top-[3px] h-[18px] w-0.5 -translate-x-1/2 rounded-full bg-ink-900"
                :style="{ left: `${bar.estimatedPct}%` }"
                data-testid="bar-estimated"
              ></span>
            </span>
          </li>
        </ul>
        <p v-else class="mt-5 text-sm text-ink-500" data-testid="budget-no-bars">{{ t('app.dashboard.budget.noItems') }}</p>

        <p v-if="bars.length" class="mt-4 text-xs text-ink-500">{{ t('app.dashboard.budget.legend') }}</p>
      </template>
    </DashboardBlock>
  </UiCard>
</template>
