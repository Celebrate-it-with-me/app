<script setup>
/**
 * "Programa del día": the moments of `GET timeline` in time order, each with its time (12 h, in the app's language,
 * through `eventDateTime.js`), its title and its description. The first `max` show; a link opens the whole program.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarClock } from 'lucide-vue-next'
import { UiButton, UiCard, UiEmptyState, UiSkeleton } from '@/ui'
import { formatEventDate } from '@/utils/eventDateTime'
import DashboardBlock from './DashboardBlock.vue'
import { programMoments } from './dashboardLogic'

const props = defineProps({
  /** `GET timeline` payload (null until it loads). */
  moments: { type: Array, default: null },
  /** loading | ready | error */
  status: { type: String, default: 'loading' },
  canEdit: { type: Boolean, default: false },
  /** Moments drawn on the Inicio; the rest stay behind "Ver programa". */
  max: { type: Number, default: 6 }
})
defineEmits(['retry'])

const { t, locale } = useI18n()
const all = computed(() => programMoments(props.moments))
const shown = computed(() => all.value.slice(0, props.max))
const hidden = computed(() => all.value.length - shown.value.length)
const timeOf = moment => formatEventDate(moment.start, 'time', locale.value)
const linkClass = 'inline-flex min-h-11 items-center text-sm font-semibold text-rose-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-rose-600'
</script>

<template>
  <UiCard as="section" :title="t('app.dashboard.program.title')" heading-level="h2" data-testid="dashboard-program">
    <template v-if="status === 'ready' && all.length" #actions>
      <router-link to="/dashboard/timeline" :class="linkClass">{{ t('app.dashboard.program.open') }}</router-link>
    </template>

    <DashboardBlock :status="status" :error-text="t('app.dashboard.program.error')" @retry="$emit('retry')">
      <template #skeleton>
        <div class="flex flex-col gap-4" data-testid="program-skeleton">
          <div v-for="n in 4" :key="n" class="flex gap-3">
            <UiSkeleton width="4.5rem" height="1rem" />
            <div class="flex-1"><UiSkeleton :lines="2" /></div>
          </div>
        </div>
      </template>

      <UiEmptyState v-if="!all.length" compact :title="t('app.dashboard.program.emptyTitle')" :description="t('app.dashboard.program.emptyText')" data-testid="program-empty">
        <template #icon><CalendarClock class="h-6 w-6" aria-hidden="true" /></template>
        <UiButton v-if="canEdit" to="/dashboard/timeline">{{ t('app.dashboard.program.emptyCta') }}</UiButton>
      </UiEmptyState>

      <template v-else>
        <ol class="flex flex-col" data-testid="program-list">
          <li v-for="(moment, i) in shown" :key="moment.id ?? `${moment.start}-${i}`" class="flex gap-3" data-testid="program-moment">
            <span class="w-[4.75rem] shrink-0 whitespace-nowrap pt-px text-right text-sm font-semibold tabular-nums text-ink-900" data-testid="program-time">{{ timeOf(moment) }}</span>
            <span class="flex w-3 shrink-0 flex-col items-center" aria-hidden="true">
              <span class="mt-1.5 h-2.5 w-2.5 rounded-full bg-rose-600"></span>
              <span v-if="i < shown.length - 1" class="mt-1 w-0.5 flex-1 bg-cream-300"></span>
            </span>
            <div class="min-w-0 flex-1" :class="i < shown.length - 1 ? 'pb-4' : ''">
              <p class="text-base font-medium leading-snug text-ink-900 break-words">{{ moment.title }}</p>
              <p v-if="moment.description" class="mt-0.5 text-sm leading-snug text-ink-500 break-words" data-testid="program-description">{{ moment.description }}</p>
            </div>
          </li>
        </ol>
        <router-link v-if="hidden > 0" to="/dashboard/timeline" :class="[linkClass, 'mt-2']" data-testid="program-more">
          {{ t('app.dashboard.program.more', { n: hidden }, hidden) }}
        </router-link>
      </template>
    </DashboardBlock>
  </UiCard>
</template>
