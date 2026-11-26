<script setup>
/**
 * "Confirmaciones": the answers ring, people per answer, the totals line, a way to remind the pending invitations (opens
 * the send wizard with them preselected; nothing is sent from here) and the latest answers (`rsvp/stats.recent`).
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { BellRing, Send, UserPlus, Users } from 'lucide-vue-next'
import { UiBadge, UiButton, UiCard, UiEmptyState, UiSkeleton } from '@/ui'
import DashboardBlock from './DashboardBlock.vue'
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
const dateOf = row => formatEventDate(row.statusDate, 'dayMonthShort', locale.value, props.timezone || undefined)
</script>

<template>
  <UiCard as="section" :title="t('app.dashboard.rsvp.title')" heading-level="h2" data-testid="dashboard-rsvp">
    <template v-if="canViewGuests" #actions>
      <router-link
        to="/dashboard/guests"
        class="inline-flex min-h-11 items-center text-sm font-semibold text-rose-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-rose-600"
      >{{ t('app.dashboard.rsvp.viewAll') }}</router-link>
    </template>

    <DashboardBlock :status="status" :error-text="t('app.dashboard.rsvp.error')" @retry="$emit('retry')">
      <template #skeleton>
        <div class="flex flex-wrap items-center gap-6 sm:gap-7" data-testid="rsvp-skeleton">
          <UiSkeleton circle width="8.5rem" height="8.5rem" class="shrink-0" />
          <div class="flex min-w-0 flex-1 basis-56 flex-col gap-3">
            <UiSkeleton v-for="n in 3" :key="n" height="1.25rem" />
            <UiSkeleton height="2.75rem" class="mt-2" />
          </div>
        </div>
      </template>

      <UiEmptyState v-if="!rsvp.people" compact :title="t('app.dashboard.rsvp.emptyTitle')" :description="t('app.dashboard.rsvp.emptyText')" data-testid="rsvp-empty">
        <template #icon><Users class="h-6 w-6" aria-hidden="true" /></template>
        <UiButton v-if="canEdit && canViewGuests" to="/dashboard/guests">
          <UserPlus class="h-4 w-4 shrink-0" aria-hidden="true" />
          {{ t('app.dashboard.rsvp.emptyCta') }}
        </UiButton>
      </UiEmptyState>

      <template v-else>
        <div class="flex flex-wrap items-center gap-x-7 gap-y-5">
          <RsvpRing class="mx-auto sm:mx-0" :attending="rsvp.attending" :pending="rsvp.pending" :declined="rsvp.declined" :rate="rsvp.responseRate" />
          <div class="flex min-w-0 flex-1 basis-56 flex-col gap-2.5 text-sm">
            <ul class="flex flex-col gap-2.5" data-testid="rsvp-rows">
              <li v-for="row in rows" :key="row.key" class="flex items-center justify-between gap-3" :data-row="row.key">
                <span class="flex items-center gap-2 text-ink-700">
                  <span class="h-2.5 w-2.5 shrink-0 rounded-full" :class="row.dot" aria-hidden="true"></span>
                  {{ t(`app.dashboard.rsvp.${row.key}`) }}
                </span>
                <strong class="font-semibold text-ink-900 tabular-nums">{{ t('app.dashboard.rsvp.persons', { n: row.value }, row.value) }}</strong>
              </li>
            </ul>
            <p class="border-t border-cream-300 pt-2.5 text-ink-500" data-testid="rsvp-totals">{{ totalsLine }}</p>
            <UiButton v-if="sendAction?.kind === 'remind'" :to="sendAction.to" variant="secondary" block class="mt-1" data-testid="rsvp-remind">
              <BellRing class="h-4 w-4 shrink-0" aria-hidden="true" />
              {{ t('app.dashboard.rsvp.remind', { n: sendAction.n }, sendAction.n) }}
            </UiButton>
            <UiButton v-else-if="sendAction?.kind === 'invite'" :to="sendAction.to" variant="secondary" block class="mt-1" data-testid="rsvp-invite">
              <Send class="h-4 w-4 shrink-0" aria-hidden="true" />
              {{ t('app.dashboard.rsvp.sendInvitations') }}
            </UiButton>
          </div>
        </div>

        <div v-if="recent.length" class="mt-5 border-t border-cream-300 pt-3" data-testid="rsvp-recent">
          <h3 class="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">{{ t('app.dashboard.rsvp.recentTitle') }}</h3>
          <ul class="mt-1">
            <li v-for="row in recent" :key="`${row.name}-${row.statusDate}`" class="flex min-h-11 items-center justify-between gap-3 py-1">
              <span class="min-w-0 truncate text-base font-medium text-ink-900">{{ row.name }}</span>
              <span class="flex shrink-0 items-center gap-2.5">
                <span class="text-sm text-ink-500 tabular-nums">{{ dateOf(row) }}</span>
                <UiBadge :tone="row.status === 'attending' ? 'success' : 'neutral'" size="sm">{{ t(`app.dashboard.rsvp.recent.${row.status}`) }}</UiBadge>
              </span>
            </li>
          </ul>
        </div>
      </template>
    </DashboardBlock>
  </UiCard>
</template>
