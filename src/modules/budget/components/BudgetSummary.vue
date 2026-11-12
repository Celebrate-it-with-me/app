<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertTriangle } from 'lucide-vue-next'
import { UiCard, UiButton } from '@/ui'
import { formatMoney, percent } from '../utils/budget'

const props = defineProps({
  summary: { type: Object, required: true },
  canEdit: { type: Boolean, default: false }
})
const emit = defineEmits(['cap'])
const { t, locale } = useI18n()

const money = value => formatMoney(value, props.summary.currency, locale.value)
const totals = computed(() => props.summary.totals)
const paidPercent = computed(() => percent(totals.value.paid, totals.value.owed))
</script>

<template>
  <UiCard :aria-label="t('app.budget.summary.label')" as="section">
    <dl class="grid grid-cols-3 gap-3 text-center sm:gap-6 sm:text-left">
      <div>
        <dt class="text-xs text-ink-500 sm:text-sm">{{ t('app.budget.summary.owed') }}</dt>
        <dd class="mt-1 font-heading text-xl tabular-nums text-ink-900 sm:text-3xl">{{ money(totals.owed) }}</dd>
      </div>
      <div>
        <dt class="text-xs text-ink-500 sm:text-sm">{{ t('app.budget.summary.paid') }}</dt>
        <dd class="mt-1 font-heading text-xl tabular-nums text-success-700 sm:text-3xl">{{ money(totals.paid) }}</dd>
      </div>
      <div>
        <dt class="text-xs text-ink-500 sm:text-sm">{{ t('app.budget.summary.remaining') }}</dt>
        <dd class="mt-1 font-heading text-xl tabular-nums text-ink-900 sm:text-3xl">{{ money(totals.remaining) }}</dd>
      </div>
    </dl>

    <div
      class="mt-5 h-2.5 overflow-hidden rounded-full bg-cream-100"
      role="progressbar"
      :aria-valuenow="paidPercent"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="t('app.budget.summary.progress')"
    >
      <div class="h-full origin-left rounded-full bg-rose-600 transition-transform duration-500 ease-out" :style="{ transform: `scaleX(${paidPercent / 100})` }" />
    </div>
    <p class="mt-2 text-sm text-ink-500">{{ t('app.budget.summary.paidOf', { percent: paidPercent }) }}</p>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
      <p v-if="summary.cap === null" class="text-sm text-ink-500">{{ t('app.budget.summary.noCap') }}</p>
      <p v-else-if="totals.overCap" class="flex items-center gap-2 text-sm font-medium text-danger-700" role="status">
        <AlertTriangle class="h-4 w-4 shrink-0" aria-hidden="true" />
        {{ t('app.budget.summary.overCap', { cap: money(summary.cap), over: money(Math.abs(totals.capLeft)) }) }}
      </p>
      <p v-else class="text-sm text-ink-700">{{ t('app.budget.summary.capLeft', { cap: money(summary.cap), left: money(totals.capLeft) }) }}</p>
      <UiButton v-if="canEdit" variant="secondary" size="sm" @click="emit('cap')">
        {{ t(summary.cap === null ? 'app.budget.summary.setCap' : 'app.budget.summary.changeCap') }}
      </UiButton>
    </div>
    <p v-if="totals.overdueCount" class="mt-2 text-sm text-danger-700">{{ t('app.budget.summary.overdue', { n: totals.overdueCount }, totals.overdueCount) }}</p>
  </UiCard>
</template>
