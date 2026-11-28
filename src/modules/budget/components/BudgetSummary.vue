<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertTriangle } from 'lucide-vue-next'
import { UiCard, UiButton } from '@/ui'
import { formatMoney, coverageOf, overpaidOf } from '../utils/budget'

const props = defineProps({
  summary: { type: Object, required: true },
  /** Every item of the budget (to count what is still to pay and what was paid past its cost). */
  items: { type: Array, default: () => [] },
  canEdit: { type: Boolean, default: false },
  /** The list is showing only the overpaid expenses. */
  overpaidActive: { type: Boolean, default: false }
})
const emit = defineEmits(['cap', 'overpaid'])
const { t, locale } = useI18n()

const money = value => formatMoney(value, props.summary.currency, locale.value)
const totals = computed(() => props.summary.totals)
const coverage = computed(() => coverageOf(totals.value))
const overpaid = computed(() => overpaidOf(props.items))
const toPayCount = computed(() => props.items.filter(item => coverageOf(item).remaining > 0).length)
const itemCount = computed(() => props.items.length)

const cap = computed(() => (props.summary.cap === null || props.summary.cap === undefined ? null : Number(props.summary.cap)))
const capDelta = computed(() => (cap.value === null ? null : Math.round((cap.value - coverage.value.total) * 100) / 100))
const overCap = computed(() => capDelta.value !== null && capDelta.value < 0)

// The bar's scale leaves 2 % of air so the cap mark never sits on the edge.
const scale = computed(() => Math.max(coverage.value.total, cap.value ?? 0) * 1.02)
const pct = value => (scale.value > 0 ? Math.min(100, (value / scale.value) * 100) : 0)
const coveredPct = computed(() => pct(coverage.value.covered))
const remainingPct = computed(() => pct(coverage.value.remaining))
const capPct = computed(() => (cap.value === null ? null : pct(cap.value)))
</script>

<template>
  <UiCard :aria-label="t('app.budget.summary.label')" as="section" data-testid="budget-summary">
    <dl class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div class="min-w-0 rounded-[14px] bg-cream-50 p-3.5 sm:px-4" data-tile="owed">
        <dt class="text-xs text-ink-500">{{ t('app.budget.summary.owed') }}</dt>
        <dd class="mt-0.5 truncate font-heading text-[22px] tabular-nums text-ink-900 md:text-[26px]">{{ money(coverage.total) }}</dd>
        <dd class="text-xs text-ink-500">{{ t('app.budget.summary.owedSub', { n: itemCount }, itemCount) }}</dd>
      </div>
      <div class="min-w-0 rounded-[14px] bg-cream-50 p-3.5 sm:px-4" data-tile="paid">
        <dt class="text-xs text-ink-500">{{ t('app.budget.summary.paid') }}</dt>
        <dd class="mt-0.5 truncate font-heading text-[22px] tabular-nums text-success-700 md:text-[26px]">{{ money(coverage.paid) }}</dd>
        <dd class="text-xs text-ink-500">{{ t('app.budget.summary.paidSub', { percent: coverage.percent }) }}</dd>
      </div>
      <div class="min-w-0 rounded-[14px] bg-cream-50 p-3.5 sm:px-4" data-tile="remaining">
        <dt class="text-xs text-ink-500">{{ t('app.budget.summary.remaining') }}</dt>
        <dd class="mt-0.5 truncate font-heading text-[22px] tabular-nums text-ink-900 md:text-[26px]">{{ money(coverage.remaining) }}</dd>
        <dd class="text-xs text-ink-500">{{ t('app.budget.summary.remainingSub', { n: toPayCount }, toPayCount) }}</dd>
      </div>
      <div class="min-w-0 rounded-[14px] p-3.5 sm:px-4" :class="overCap ? 'bg-rose-50' : 'bg-cream-50'" data-tile="cap">
        <dt class="text-xs text-ink-500">{{ t('app.budget.summary.cap') }}</dt>
        <dd class="mt-0.5 truncate font-heading text-[22px] tabular-nums text-ink-900 md:text-[26px]">{{ cap === null ? '—' : money(cap) }}</dd>
        <dd v-if="cap === null" class="text-xs text-ink-500">{{ t('app.budget.summary.noCap') }}</dd>
        <dd v-else-if="overCap" class="text-xs font-semibold text-danger-700" role="status">{{ t('app.budget.summary.capOver', { amount: money(Math.abs(capDelta)) }) }}</dd>
        <dd v-else class="text-xs text-success-700">{{ t('app.budget.summary.capLeft', { amount: money(capDelta) }) }}</dd>
      </div>
    </dl>

    <div
      class="relative mt-[18px] h-3 rounded-full bg-cream-200"
      role="progressbar"
      :aria-valuenow="coverage.percent"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="t('app.budget.summary.progress')"
      data-testid="summary-bar"
    >
      <div class="absolute inset-0 flex overflow-hidden rounded-full">
        <div class="h-full bg-rose-600" :style="{ width: `${coveredPct}%` }" data-testid="bar-covered"></div>
        <div class="h-full bg-rose-200" :style="{ width: `${remainingPct}%` }" data-testid="bar-remaining"></div>
      </div>
      <div
        v-if="capPct !== null"
        class="absolute -top-[5px] -bottom-[5px] w-0.5 -translate-x-1/2 bg-ink-900"
        :style="{ left: `${capPct}%` }"
        data-testid="bar-cap"
      ></div>
    </div>

    <div class="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-700">
      <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-rose-600" aria-hidden="true"></span>{{ t('app.budget.summary.paid') }}</span>
      <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-rose-200" aria-hidden="true"></span>{{ t('app.budget.summary.remaining') }}</span>
      <span v-if="cap !== null" class="inline-flex items-center gap-1.5"><span class="h-3 w-0.5 bg-ink-900" aria-hidden="true"></span>{{ t('app.budget.summary.cap') }}</span>
      <button
        v-if="overpaid.count"
        type="button"
        class="touch-target relative inline-flex items-center gap-1 rounded-md font-semibold text-danger-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-rose-600"
        :class="overpaidActive && 'underline'"
        :aria-pressed="overpaidActive"
        data-testid="overpaid-link"
        @click="emit('overpaid')"
      >
        <AlertTriangle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {{ t('app.budget.summary.overpaid', { amount: money(overpaid.amount), n: overpaid.count }, overpaid.count) }}
      </button>
      <span v-if="totals.overdueCount" class="font-semibold text-danger-700">{{ t('app.budget.summary.overdue', { n: totals.overdueCount }, totals.overdueCount) }}</span>
      <UiButton v-if="canEdit" class="ml-auto" variant="secondary" size="sm" @click="emit('cap')">
        {{ t(cap === null ? 'app.budget.summary.setCap' : 'app.budget.summary.changeCap') }}
      </UiButton>
    </div>
  </UiCard>
</template>
