<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiCard } from '@/ui'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'
import { ITEM_TYPES, courseRows, respondedPercent } from '@/modules/menus/utils/menus'

const { t } = useI18n()
const menuStore = useMenusStore()

const summary = computed(() => menuStore.summary)
const percent = computed(() => respondedPercent(summary.value))
const courses = computed(() => ITEM_TYPES.map(type => ({ type, rows: courseRows(summary.value, type) })))
</script>

<template>
  <UiCard v-if="summary && summary.total > 0" padding="sm" data-testid="menu-summary" class="space-y-0">
    <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <p class="font-heading text-2xl text-ink-900" data-testid="summary-ratio">{{ t('app.menus.summaryRatio', { responded: summary.responded, total: summary.total }) }}</p>
      <p class="text-sm text-ink-500">{{ t('app.menus.summaryLabel', {}, summary.responded) }}</p>
    </div>
    <div
      class="mt-2.5 h-2 overflow-hidden rounded-full bg-cream-200"
      role="progressbar"
      :aria-valuenow="percent"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="t('app.menus.summaryProgress')"
    >
      <div class="h-full rounded-full bg-rose-600 transition-[width]" :style="{ width: `${percent}%` }" />
    </div>
    <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
      <section v-for="course in courses" :key="course.type" data-testid="summary-course" class="min-w-0 rounded-xl bg-cream-50 px-3.5 py-3">
        <h3 class="text-[11px] font-semibold uppercase tracking-[.06em] text-ink-500">{{ t(`app.menus.types.${course.type}`) }}</h3>
        <ul v-if="course.rows.length" class="mt-1.5 space-y-1">
          <li v-for="row in course.rows" :key="row.dishId" class="flex justify-between gap-3 text-[13px] text-ink-900">
            <span class="min-w-0 [overflow-wrap:anywhere]">{{ row.name }}</span>
            <span class="shrink-0 font-bold tabular-nums">×{{ row.count }}</span>
          </li>
        </ul>
        <p v-else class="mt-1.5 text-[13px] italic text-ink-500">{{ t('app.menus.nobodyYet') }}</p>
      </section>
    </div>
  </UiCard>
</template>
