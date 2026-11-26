<script setup>
/**
 * "Confirmaciones": the answers ring, people per answer, the totals line, a way to remind the pending invitations (opens
 * the send wizard with them preselected; nothing is sent from here) and the latest answers (`rsvp/stats.recent`).
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Users } from 'lucide-vue-next'
import { UiEmptyState, UiSkeleton } from '@/ui'
import DashboardBlock from './DashboardBlock.vue'
import DashboardCard from './DashboardCard.vue'
import DashboardAction from './DashboardAction.vue'
import { HEADER_LINK } from './dashboardUi'
import RsvpRing from './RsvpRing.vue'
import { recentResponses, summarizeRsvp } from './dashboardLogic'
import { formatEventDate } from '@/utils/eventDateTime'

const props = defineProps({
  /** `GET rsvp/stats` payload (null until it loads). */
  stats: { type: Object, default: null },
  /** loading | ready | error */
  status: { type: String, default: 'loading' },
  /** Adds guests and sends reminders (owners and editors). */
  canEdit: { type: Boolean, default: false },
  /** The guest list is behind `view_guests`. */
  canViewGuests: { type: Boolean, default: false },
  /** The send wizard's counts (`sendCounts` in sendFamilies.js), null while unknown, failed or not asked for. */
  sendCounts: { type: Object, default: null },
  /** The event's zone, for the answer dates. */
  timezone: { type: String, default: '' }
})
defineEmits(['retry'])

const { t, locale } = useI18n()
const rsvp = computed(() => summarizeRsvp(props.stats))
const recent = computed(() => recentResponses(props.stats, 4))
const rows = computed(() => [
  { key: 'attending', value: rsvp.value.attending, dot: 'bg-success-500' },
  { key: 'pending', value: rsvp.value.pending, dot: 'bg-gold-500' },
  { key: 'declined', value: rsvp.value.declined, dot: 'bg-ink-400' }
])
const totalsLine = computed(() => {
  const { people, mainGuests, companions } = rsvp.value
  return `${t('app.dashboard.rsvp.persons', { n: people }, people)} ${t('app.dashboard.rsvp.inInvitations', { n: mainGuests }, mainGuests)} · ${t('app.dashboard.rsvp.companions', { n: companions }, companions)}`
})
/**
 * The button under the totals, from the send wizard's own counts (never `pending.guests`, which also counts families the
 * invitation never reached): "Recordar a N" when N families can get a reminder; "Enviar invitaciones" when nobody can be
 * reminded because the pending ones never got the invitation; nothing otherwise (closed RSVP, archived event, no counts).
 */
const sendAction = computed(() => {
  const counts = props.sendCounts
  if (!props.canEdit || !props.canViewGuests || rsvp.value.pendingGuests === 0 || !counts || !counts.rsvpOpen || counts.archived) return null
  if (counts.pending > 0) return { kind: 'remind', n: counts.pending, to: { path: '/dashboard/guests', query: { send: 'pending' } } }
  if (counts.pendingUnsent > 0) return { kind: 'invite', to: { path: '/dashboard/guests', query: { send: 'unsent' } } }
  return null
})
const CHIP = 'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold'
const dateOf = row => formatEventDate(row.statusDate, 'dayMonthShort', locale.value, props.timezone || undefined)
</script>

<template>
  <DashboardCard :title="t('app.dashboard.rsvp.title')" class="@container" data-testid="dashboard-rsvp">
    <template v-if="canViewGuests" #actions>
      <router-link to="/dashboard/guests" :class="HEADER_LINK">{{ t('app.dashboard.rsvp.viewAll') }}</router-link>
    </template>

    <DashboardBlock :status="status" :error-text="t('app.dashboard.rsvp.error')" @retry="$emit('retry')">
      <template #skeleton>
        <div class="flex items-center gap-[18px] @md:gap-7" data-testid="rsvp-skeleton">
          <UiSkeleton circle width="7.5rem" height="7.5rem" class="shrink-0" />
          <div class="flex min-w-0 flex-1 flex-col gap-3">
            <UiSkeleton v-for="n in 3" :key="n" height="1.25rem" />
            <UiSkeleton height="2.75rem" class="mt-2" />
          </div>
        </div>
      </template>

      <UiEmptyState v-if="!rsvp.people" compact :title="t('app.dashboard.rsvp.emptyTitle')" :description="t('app.dashboard.rsvp.emptyText')" data-testid="rsvp-empty">
        <template #icon><Users class="h-6 w-6" aria-hidden="true" /></template>
        <DashboardAction v-if="canEdit && canViewGuests" to="/dashboard/guests">{{ t('app.dashboard.rsvp.emptyCta') }}</DashboardAction>
      </UiEmptyState>

      <template v-else>
        <!-- The ring always sits next to its legend (120 px in a narrow card, 150 px in a wide one); in a narrow card the
             totals and the button go under both, full width. -->
        <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-[18px] gap-y-3 text-sm @md:gap-x-7 @md:gap-y-2.5" data-testid="rsvp-summary">
          <RsvpRing class="@md:row-span-3" :attending="rsvp.attending" :pending="rsvp.pending" :declined="rsvp.declined" :rate="rsvp.responseRate" />
          <div class="contents">
            <ul class="flex min-w-0 flex-col gap-2 @md:gap-2.5" data-testid="rsvp-rows">
              <li v-for="row in rows" :key="row.key" class="flex items-center justify-between gap-3" :data-row="row.key">
                <span class="flex items-center gap-2 text-ink-900">
                  <span class="h-2.5 w-2.5 shrink-0 rounded-full" :class="row.dot" aria-hidden="true"></span>
                  {{ t(`app.dashboard.rsvp.${row.key}`) }}
                </span>
                <!-- A narrow card shows just the number (like the prototype's phone); the word stays for screen readers. -->
                <strong class="font-semibold text-ink-900 tabular-nums">
                  <span class="@md:hidden" aria-hidden="true">{{ row.value }}</span>
                  <span class="sr-only @md:not-sr-only">{{ t('app.dashboard.rsvp.persons', { n: row.value }, row.value) }}</span>
                </strong>
              </li>
            </ul>
            <p class="col-span-2 border-t border-cream-200 pt-2.5 text-ink-500 @md:col-span-1" data-testid="rsvp-totals">{{ totalsLine }}</p>
            <DashboardAction v-if="sendAction?.kind === 'remind'" :to="sendAction.to" variant="outline" block class="col-span-2 @md:col-span-1" data-testid="rsvp-remind">
              {{ t('app.dashboard.rsvp.remind', { n: sendAction.n }, sendAction.n) }}
            </DashboardAction>
            <DashboardAction v-else-if="sendAction?.kind === 'invite'" :to="sendAction.to" variant="outline" block class="col-span-2 @md:col-span-1" data-testid="rsvp-invite">
              {{ t('app.dashboard.rsvp.sendInvitations') }}
            </DashboardAction>
          </div>
        </div>

        <div v-if="recent.length" class="mt-4 border-t border-cream-200 pt-3 lg:mt-[18px]" data-testid="rsvp-recent">
          <h3 class="mb-1 font-body text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">{{ t('app.dashboard.rsvp.recentTitle') }}</h3>
          <ul>
            <li v-for="row in recent" :key="`${row.name}-${row.statusDate}`" class="flex min-h-12 items-center justify-between gap-2 sm:min-h-11 sm:gap-2.5">
              <span class="min-w-0 truncate text-sm font-medium text-ink-900 sm:text-[15px]">{{ row.name }}</span>
              <span class="flex shrink-0 items-center gap-2 sm:gap-2.5">
                <span class="text-xs text-ink-500 tabular-nums sm:text-[13px]">{{ dateOf(row) }}</span>
                <span :class="[CHIP, row.status === 'attending' ? 'bg-success-50 text-success-700' : 'bg-cream-200 text-ink-700']">{{ t(`app.dashboard.rsvp.recent.${row.status}`) }}</span>
              </span>
            </li>
          </ul>
        </div>
      </template>
    </DashboardBlock>
  </DashboardCard>
</template>
