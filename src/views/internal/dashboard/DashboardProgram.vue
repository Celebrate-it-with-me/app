<script setup>
/**
 * "Programa del día": the moments of `GET timeline` in time order, each with its time (12 h, in the app's language,
 * through `eventDateTime.js`), its title and its description. The first `max` show; a link opens the whole program.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarClock } from 'lucide-vue-next'
import { UiEmptyState, UiSkeleton } from '@/ui'
import { formatEventDate } from '@/utils/eventDateTime'
import DashboardBlock from './DashboardBlock.vue'
import DashboardCard from './DashboardCard.vue'
import DashboardAction from './DashboardAction.vue'
import { HEADER_LINK, LINK } from './dashboardUi'
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
</script>

<template>
  <DashboardCard :title="t('app.dashboard.program.title')" data-testid="dashboard-program">
    <template v-if="status === 'ready' && all.length" #actions>
      <router-link to="/dashboard/timeline" :class="HEADER_LINK">{{ t('app.dashboard.program.open') }}</router-link>
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
        <DashboardAction v-if="canEdit" to="/dashboard/timeline">{{ t('app.dashboard.program.emptyCta') }}</DashboardAction>
      </UiEmptyState>

      <template v-else>
        <ol class="flex flex-col" data-testid="program-list">
          <li v-for="(moment, i) in shown" :key="moment.id ?? `${moment.start}-${i}`" class="flex gap-3.5" data-testid="program-moment">
            <span class="w-[4.5rem] shrink-0 whitespace-nowrap pt-0.5 text-right text-sm font-semibold tabular-nums text-ink-900" data-testid="program-time">{{ timeOf(moment) }}</span>
            <span class="flex w-3.5 shrink-0 flex-col items-center" aria-hidden="true">
              <span class="mt-[5px] h-3 w-3 shrink-0 rounded-full bg-rose-700"></span>
              <span v-if="i < shown.length - 1" class="w-0.5 flex-1 bg-line"></span>
            </span>
            <div class="min-w-0 flex-1" :class="i < shown.length - 1 ? 'pb-4' : ''">
              <p class="text-[15px] font-medium leading-snug text-ink-900 break-words">{{ moment.title }}</p>
              <p v-if="moment.description" class="mt-0.5 text-[13px] leading-[1.4] text-ink-500 break-words" data-testid="program-description">{{ moment.description }}</p>
            </div>
          </li>
        </ol>
        <router-link v-if="hidden > 0" to="/dashboard/timeline" :class="[LINK, 'mt-1']" data-testid="program-more">
          {{ t('app.dashboard.program.more', { n: hidden }, hidden) }}
        </router-link>
      </template>
    </DashboardBlock>
  </DashboardCard>
</template>
