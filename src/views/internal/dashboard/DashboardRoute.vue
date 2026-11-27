<script setup>
/**
 * "Ruta al evento": four milestones (Hoy, Fundamentos, Invitaciones, the event day). Their state comes from the phases of
 * `assistant/plan`; the event day from the event's date. Horizontal from 640 px, vertical on phones.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check } from 'lucide-vue-next'
import { UiSkeleton } from '@/ui'
import DashboardBlock from './DashboardBlock.vue'
import DashboardCard from './DashboardCard.vue'
import { LINK } from './dashboardUi'
import { planPercent, routeAvailability, routeMilestones } from './dashboardLogic'
import { daysUntilEvent, eventDay, formatEventDate, formatClock, hasClock } from '@/utils/eventDateTime'

const props = defineProps({
  /** The normalized `assistant/plan` (null until it loads). */
  plan: { type: Object, default: null },
  /** loading | error | ready */
  status: { type: String, default: 'loading' },
  startDate: { type: String, default: '' },
  timezone: { type: String, default: '' },
  /** Router location of the event form, to set the date. */
  editTo: { type: [String, Object], default: null },
  canEdit: { type: Boolean, default: false },
  /** Injected for tests; the real clock otherwise. */
  now: { type: Date, default: () => new Date() }
})
defineEmits(['retry'])

const { t, locale } = useI18n()

const moment = computed(() => ({ startDate: props.startDate, timezone: props.timezone }))
const hasDate = computed(() => !!eventDay(moment.value))
const days = computed(() => daysUntilEvent(moment.value, props.now))
const availability = computed(() => routeAvailability(props.plan))
const percent = computed(() => planPercent(props.plan?.progress))
const milestones = computed(() => routeMilestones(props.plan, days.value))

const todayLabel = computed(() => formatEventDate(props.now.toISOString(), 'dayMonth', locale.value, props.timezone || undefined))
const todayShort = computed(() => formatEventDate(props.now.toISOString(), 'dayMonthShort', locale.value, props.timezone || undefined))
const summary = computed(() => {
  const head = t('app.dashboard.route.summary', { date: todayLabel.value })
  return days.value !== null && days.value > 0 ? `${head} · ${t('app.dashboard.route.remaining', { n: days.value }, days.value)}` : head
})

// The day and its clock are the title, like the prototype ("Sáb 2 ene · 7:00 p. m."); the clock never splits in two.
const eventDayLabel = computed(() => (hasDate.value ? formatEventDate(props.startDate, 'weekdayDayMonth', locale.value, props.timezone) : t('app.dashboard.route.eventDay')))
const eventClock = computed(() => (hasDate.value && hasClock(props.startDate) ? formatClock(props.startDate, locale.value, props.timezone) : ''))

const cards = computed(() =>
  milestones.value.map(m => {
    const base = { key: m.key, state: m.state, reached: m.reached }
    if (m.key === 'today') return { ...base, title: t('app.dashboard.route.today', { date: todayShort.value }), sub: t('app.dashboard.route.planAt', { percent: percent.value }) }
    if (m.key === 'event') {
      const sub =
        days.value === null ? t('app.dashboard.route.eventNoDate') : days.value < 0 ? t('app.dashboard.route.eventPast') : days.value === 0 ? t('app.dashboard.route.eventToday') : t('app.dashboard.route.eventFuture')
      return { ...base, title: eventDayLabel.value, clock: eventClock.value, sub }
    }
    const sub = m.state === 'done' ? t('app.dashboard.route.phaseDone') : m.state === 'empty' ? t('app.dashboard.route.phaseEmpty') : m.pending[0] ?? ''
    const count = m.total > 0 && m.state !== 'done' ? t('app.dashboard.route.phaseCount', { done: m.done, total: m.total }, m.total) : ''
    return { ...base, title: t(`app.dashboard.route.${m.key}`), sub, count }
  })
)

/** Connector colours: filled when the milestone it leads to is reached. */
const filled = i => (cards.value[i]?.reached ? 'bg-rose-700' : 'bg-line')

const ringClass = card =>
  ({
    now: 'border-rose-700 bg-rose-700',
    done: 'border-success-500 bg-success-500',
    current: 'border-rose-700 bg-white',
    event: 'border-gold-500 bg-gold-500'
  })[card.state] ?? 'border-ink-300 bg-white'
</script>

<template>
  <DashboardCard v-if="availability !== 'none' || status !== 'ready'" :padded="false" class="p-5 lg:px-7 lg:py-6" data-testid="dashboard-route">
    <header class="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 lg:mb-3.5">
      <h2 class="font-heading text-xl font-semibold leading-tight text-ink-900 lg:text-[22px]">{{ t('app.dashboard.route.title') }}</h2>
      <p v-if="status === 'ready' && availability === 'ready'" class="text-[13px] text-ink-500" data-testid="route-summary">{{ summary }}</p>
    </header>

    <DashboardBlock :status="status" :error-text="t('app.dashboard.route.error')" @retry="$emit('retry')">
      <template #skeleton>
        <div class="grid gap-4 sm:grid-cols-4" data-testid="route-skeleton">
          <div v-for="n in 4" :key="n" class="flex gap-3.5 sm:flex-col sm:gap-2">
            <UiSkeleton circle width="1.375rem" height="1.375rem" />
            <div class="flex-1"><UiSkeleton :lines="2" /></div>
          </div>
        </div>
      </template>

      <p v-if="availability === 'no_date'" class="text-sm text-ink-700" data-testid="route-no-date">
        {{ t('app.dashboard.route.noDate') }}
        <router-link v-if="canEdit && editTo" :to="editTo" :class="LINK">{{ t('app.dashboard.hero.setDate') }}</router-link>
      </p>

      <ol v-else class="grid sm:grid-cols-4" data-testid="route-list">
        <li
          v-for="(card, i) in cards"
          :key="card.key"
          class="flex gap-3.5 sm:flex-col sm:gap-2"
          :data-state="card.state"
          :data-testid="`route-${card.key}`"
        >
          <div class="flex w-[22px] shrink-0 flex-col items-center sm:h-6 sm:w-auto sm:flex-row">
            <span class="hidden h-[3px] flex-1 sm:block" :class="i === 0 ? 'bg-transparent' : filled(i)" aria-hidden="true"></span>
            <span class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[3px]" :class="ringClass(card)" aria-hidden="true">
              <Check v-if="card.state === 'done'" class="h-3 w-3 text-white" stroke-width="4" />
            </span>
            <span class="min-h-[18px] w-[3px] flex-1 sm:h-[3px] sm:min-h-0 sm:w-auto" :class="i === cards.length - 1 ? 'bg-transparent' : filled(i + 1)" aria-hidden="true"></span>
          </div>
          <div class="min-w-0 flex-1 sm:pb-0 sm:pr-3" :class="i === cards.length - 1 ? 'pb-0' : 'pb-3'">
            <p class="text-sm font-semibold text-ink-900 first-letter:uppercase">
              {{ card.title }}<template v-if="card.clock"> · <span class="whitespace-nowrap">{{ card.clock }}</span></template>
              <span class="sr-only"> ({{ t(`app.dashboard.route.state.${card.state}`) }})</span>
            </p>
            <p class="mt-0.5 line-clamp-3 text-[13px] leading-[1.4] text-ink-500">{{ card.sub }}</p>
            <p v-if="card.count" class="mt-1 text-xs text-ink-500">{{ card.count }}</p>
          </div>
        </li>
      </ol>
    </DashboardBlock>
  </DashboardCard>
</template>
