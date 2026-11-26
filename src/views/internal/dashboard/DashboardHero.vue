<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarDays, Eye, Pencil, Send, Share2 } from 'lucide-vue-next'
import { UiBadge, UiButton, UiCard, UiSkeleton } from '@/ui'
import InvitationPreviewSheet from '@/modules/template-picker/components/InvitationPreviewSheet.vue'
import DashboardPhone from './DashboardPhone.vue'
import DashboardBlock from './DashboardBlock.vue'
import { countdownInfo, planPercent } from './dashboardLogic'
import { daysUntilEvent, eventDay, formatClock, formatEventDate, hasClock } from '@/utils/eventDateTime'
import { useMinWidth } from '@/composables/useMinWidth'

const props = defineProps({
  eventId: { type: [Number, String], default: null },
  name: { type: String, default: '' },
  startDate: { type: String, default: '' },
  /** The organization plan's progress (`{ done, total }`, the assistant's number); null hides it. */
  plan: { type: Object, default: null },
  /** loading | error | ready: the state of the plan's request (the bar has its own skeleton and retry). */
  planStatus: { type: String, default: 'ready' },
  published: { type: Boolean, default: false },
  /** Sending goes through the guest list (each invitation has its own code): needs `view_guests`. */
  canViewGuests: { type: Boolean, default: false },
  /** Preview image of the active template; empty draws the fallback card. */
  image: { type: String, default: '' },
  /** Name of the template in use; empty hides the chip. */
  templateName: { type: String, default: '' },
  /** loading | error | ready: the template chip's request (an error just hides the chip). */
  templateStatus: { type: String, default: 'ready' },
  /** Only owners and editors change or publish the event; viewers just look. */
  canEdit: { type: Boolean, default: false },
  /** Zone of the event; only needed when `startDate` is an instant (ISO with offset). */
  timezone: { type: String, default: '' },
  /** Route to the event form, where the invitation is published. */
  editTo: { type: [String, Object], default: null },
  /** Where "Cambiar plantilla" leads: the invitation editor, which holds the template selector. */
  templateTo: { type: [String, Object], default: null }
})
defineEmits(['retry-plan'])

const { t, locale } = useI18n()

const moment = computed(() => ({ startDate: props.startDate, timezone: props.timezone }))
const hasDate = computed(() => !!eventDay(moment.value))
const countdown = computed(() => countdownInfo(daysUntilEvent(moment.value)))
const dateLabel = computed(() => {
  if (!hasDate.value) return t('app.dashboard.noDate')
  const day = formatEventDate(props.startDate, 'weekdayDate', locale.value, props.timezone)
  return hasClock(props.startDate) ? `${day} · ${formatClock(props.startDate, locale.value, props.timezone)}` : day
})
const percent = computed(() => planPercent(props.plan))
const planLabel = computed(() => t('app.dashboard.planSteps', { done: props.plan?.done ?? 0, total: props.plan?.total ?? 0, percent: percent.value }))
// The phone only exists from 640 px up (the phone layout has no thumbnail): do not even load it below.
const wide = useMinWidth(640)

const previewOpen = ref(false)
</script>

<template>
  <UiCard as="header" padding="none" class="grid gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-10 sm:p-8 lg:gap-6 lg:p-6 xl:gap-10 xl:p-8" data-testid="dashboard-hero">
    <div class="min-w-0">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p class="flex items-center gap-2 text-sm text-ink-500">
          <CalendarDays class="h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
          <span class="first-letter:uppercase" data-testid="hero-date">{{ dateLabel }}</span>
        </p>
        <UiBadge :tone="published ? 'success' : 'warning'" size="sm" dot data-testid="hero-status">
          {{ t(published ? 'app.dashboard.invitation.published' : 'app.dashboard.invitation.draft') }}
        </UiBadge>
        <UiSkeleton v-if="templateStatus === 'loading'" width="6.5rem" height="1.5rem" data-testid="hero-template-skeleton" />
        <UiBadge v-else-if="templateName" size="sm" class="max-w-full" data-testid="hero-template">
          <span class="sr-only">{{ t('app.dashboard.hero.template') }}: </span>
          <span class="truncate">{{ templateName }}</span>
        </UiBadge>
      </div>

      <h1 class="mt-3 font-heading text-3xl text-ink-900 text-balance sm:text-5xl">{{ name }}</h1>

      <p class="mt-4 flex items-baseline gap-2 text-ink-700" data-testid="hero-countdown" :data-kind="countdown.kind">
        <template v-if="countdown.kind === 'future'">
          <span class="font-heading text-6xl leading-none text-rose-700 tabular-nums sm:text-7xl">{{ countdown.n }}</span>
          <span class="text-base">{{ t('app.dashboard.hero.daysLeft', { n: countdown.n }, countdown.n) }}</span>
        </template>
        <span v-else-if="countdown.kind === 'today'" class="font-heading text-4xl leading-none text-rose-700 sm:text-5xl">{{ t('app.dashboard.hero.today') }}</span>
        <span v-else-if="countdown.kind === 'past'" class="font-heading text-3xl leading-none text-ink-700">{{ t('app.dashboard.past') }}</span>
        <template v-else>
          <span class="text-base">{{ t('app.dashboard.noDate') }}</span>
          <router-link v-if="canEdit && editTo" :to="editTo" class="inline-flex min-h-11 items-center text-sm font-semibold text-rose-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-rose-600">{{ t('app.dashboard.hero.setDate') }}</router-link>
        </template>
      </p>

      <div class="mt-4 max-w-lg" data-testid="hero-plan-slot">
        <DashboardBlock :status="planStatus" :error-text="t('app.dashboard.hero.planError')" @retry="$emit('retry-plan')">
          <template #skeleton>
            <div class="flex flex-col gap-2" data-testid="hero-plan-skeleton">
              <UiSkeleton width="55%" height="1rem" />
              <UiSkeleton height="0.625rem" />
            </div>
          </template>
          <div v-if="plan && plan.total > 0" data-testid="hero-plan">
            <p class="text-sm text-ink-700"><span class="font-semibold text-ink-900">{{ t('app.dashboard.plan') }}</span> · <span data-testid="hero-plan-label">{{ planLabel }}</span></p>
            <div
              class="mt-2 h-2.5 overflow-hidden rounded-full bg-cream-300"
              role="progressbar"
              :aria-valuenow="percent"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuetext="planLabel"
              :aria-label="t('app.dashboard.plan')"
            >
              <div class="h-full rounded-full bg-gold-500 motion-safe:transition-[width] motion-safe:duration-500 motion-safe:ease-out" :style="{ width: percent + '%' }"></div>
            </div>
          </div>
        </DashboardBlock>
      </div>

      <!-- Two buttons per row from 360 px (one under it, so nothing touches the card's edges); one row from 640 px. -->
      <div class="mt-5 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:flex sm:flex-wrap sm:gap-3 lg:gap-2 xl:gap-3">
        <UiButton v-if="published && canViewGuests" to="/dashboard/guests" class="min-[360px]:col-span-2 sm:col-span-1" data-testid="hero-share">
          <Share2 class="h-4 w-4 shrink-0" aria-hidden="true" />
          <span class="xl:hidden">{{ t('app.dashboard.hero.share') }}</span>
          <span class="hidden xl:inline">{{ t('app.dashboard.hero.shareLong') }}</span>
        </UiButton>
        <UiButton v-if="!published && canEdit && editTo" :to="editTo" class="min-[360px]:col-span-2 sm:col-span-1" data-testid="hero-publish">
          <Send class="h-4 w-4 shrink-0" aria-hidden="true" />
          {{ t('app.dashboard.hero.publish') }}
        </UiButton>
        <UiButton v-if="canEdit && eventId != null" variant="secondary" data-testid="hero-view" @click="previewOpen = true">
          <Eye class="h-4 w-4 shrink-0" aria-hidden="true" />
          {{ t('app.dashboard.hero.view') }}
        </UiButton>
        <UiButton v-if="canEdit && editTo" :to="editTo" variant="secondary" data-testid="hero-edit">
          <Pencil class="h-4 w-4 shrink-0" aria-hidden="true" />
          {{ t('app.dashboard.edit') }}
        </UiButton>
      </div>
      <p v-if="!published" class="mt-3 max-w-md text-sm text-ink-500" data-testid="hero-draft-hint">{{ t('app.dashboard.hero.draftHint') }}</p>
    </div>

    <div v-if="wide" class="flex flex-col items-center gap-2" data-testid="hero-thumb">
      <DashboardPhone :event-id="eventId" :live="canEdit && eventId != null" :image="image" :name="name" :date-label="hasDate ? dateLabel : ''" />
      <router-link
        v-if="canEdit && templateTo"
        :to="templateTo"
        class="inline-flex min-h-11 items-center rounded-md px-2 text-sm font-semibold text-rose-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-rose-600"
        data-testid="hero-change-template"
      >{{ t('app.dashboard.hero.changeTemplate') }}</router-link>
    </div>

    <InvitationPreviewSheet v-if="canEdit && eventId != null" v-model:open="previewOpen" :event-id="eventId" />
  </UiCard>
</template>
