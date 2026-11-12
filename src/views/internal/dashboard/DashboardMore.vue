<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiCard } from '@/ui'

defineProps({
  budgetEnabled: { type: Boolean, default: false },
  budget: { type: Object, default: () => ({ cap: 0, estimated: 0, paid: 0, items: 0 }) },
  /** Next moments of the day, already sorted: `[{ id, title, time }]`. */
  program: { type: Array, default: () => [] },
  /** `[{ id, message, createdAt }]`. */
  activity: { type: Array, default: () => [] }
})

const { t, locale } = useI18n()
const money = computed(() => value =>
  new Intl.NumberFormat(locale.value === 'es' ? 'es-US' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value || 0)
)
</script>

<template>
  <section aria-labelledby="more-title" class="pt-10">
    <h2 id="more-title" class="font-heading text-2xl text-ink-900">{{ t('app.dashboard.more.title') }}</h2>
    <p class="mt-1 text-sm text-ink-600">{{ t('app.dashboard.more.subtitle') }}</p>

    <div class="mt-4 grid gap-4 lg:grid-cols-3">
      <UiCard v-if="budgetEnabled" :title="t('app.dashboard.more.budget')" heading-level="h3" padding="sm" flat>
        <p v-if="!budget.items" class="text-sm text-ink-600">{{ t('app.dashboard.more.budgetEmpty') }}</p>
        <dl v-else class="space-y-1.5 text-sm">
          <div v-if="budget.cap" class="flex justify-between gap-3">
            <dt class="text-ink-600">{{ t('app.dashboard.more.budgetCap') }}</dt>
            <dd class="tabular-nums text-ink-900">{{ money(budget.cap) }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-ink-600">{{ t('app.dashboard.more.budgetEstimated') }}</dt>
            <dd class="tabular-nums text-ink-900">{{ money(budget.estimated) }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-ink-600">{{ t('app.dashboard.more.budgetPaid') }}</dt>
            <dd class="tabular-nums text-ink-900">{{ money(budget.paid) }}</dd>
          </div>
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

      <UiCard :title="t('app.dashboard.more.activity')" heading-level="h3" padding="sm" flat>
        <p v-if="!activity.length" class="text-sm text-ink-600">{{ t('app.dashboard.more.activityEmpty') }}</p>
        <ul v-else class="space-y-2 text-sm">
          <li v-for="item in activity" :key="item.id">
            <p class="text-ink-900">{{ item.message }}</p>
            <p class="text-xs text-ink-500">{{ item.createdAt }}</p>
          </li>
        </ul>
      </UiCard>
    </div>
  </section>
</template>
