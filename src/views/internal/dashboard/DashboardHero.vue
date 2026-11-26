<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiSkeleton } from '@/ui'
import InvitationPreviewSheet from '@/modules/template-picker/components/InvitationPreviewSheet.vue'
import DashboardPhone from './DashboardPhone.vue'
import DashboardBlock from './DashboardBlock.vue'
import DashboardCard from './DashboardCard.vue'
import DashboardAction from './DashboardAction.vue'
import { LINK } from './dashboardUi'
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
const planArgs = computed(() => ({ done: props.plan?.done ?? 0, total: props.plan?.total ?? 0, percent: percent.value }))
const planLabel = computed(() => t('app.dashboard.planSteps', planArgs.value))
// The phone's line is shorter ("13 de 33 · 39 %"); the bar's accessible text keeps the long one.
const planShort = computed(() => t('app.dashboard.planStepsShort', planArgs.value))
const CHIP = 'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-semibold'
// The phone only exists from 640 px up (the phone layout has no thumbnail): do not even load it below.
const wide = useMinWidth(640)

const previewOpen = ref(false)
</script>

<template>
  <DashboardCard
    as="header"
    :padded="false"
    class="grid gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8 sm:p-8 lg:p-6 xl:p-8"
    data-testid="dashboard-hero"
  >
    <div class="flex min-w-0 flex-col gap-3.5">
      <div class="flex flex-wrap items-center gap-2.5 text-sm text-ink-500">
        <span class="first-letter:uppercase" data-testid="hero-date">{{ dateLabel }}</span>
        <span :class="[CHIP, published ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700']" data-testid="hero-status">
          {{ t(published ? 'app.dashboard.invitation.published' : 'app.dashboard.invitation.draft') }}
        </span>
        <!-- The template's chip is a desktop detail (the phone layout has no thumbnail either). -->
        <UiSkeleton v-if="templateStatus === 'loading'" width="6.5rem" height="1.375rem" class="max-sm:hidden" data-testid="hero-template-skeleton" />
        <span v-else-if="templateName" :class="[CHIP, 'max-w-full bg-cream-200 text-gold-700 max-sm:hidden']" data-testid="hero-template">
          <span class="sr-only">{{ t('app.dashboard.hero.template') }}: </span>
          <span class="truncate">{{ templateName }}</span>
        </span>
      </div>

      <h1 class="font-heading text-[32px] font-semibold leading-[1.05] text-ink-900 text-balance sm:text-[44px]">{{ name }}</h1>

      <p class="flex items-baseline gap-2 sm:gap-2.5" data-testid="hero-countdown" :data-kind="countdown.kind">
        <template v-if="countdown.kind === 'future'">
          <span class="font-heading text-[56px] leading-none text-rose-700 tabular-nums sm:text-7xl">{{ countdown.n }}</span>
          <span class="text-[15px] text-ink-500 sm:text-base">{{ t('app.dashboard.hero.daysLeft', { n: countdown.n }, countdown.n) }}</span>
        </template>
        <span v-else-if="countdown.kind === 'today'" class="font-heading text-4xl leading-none text-rose-700 sm:text-5xl">{{ t('app.dashboard.hero.today') }}</span>
        <span v-else-if="countdown.kind === 'past'" class="font-heading text-3xl leading-none text-ink-700">{{ t('app.dashboard.past') }}</span>
        <template v-else>
          <span class="text-base text-ink-500">{{ t('app.dashboard.noDate') }}</span>
          <router-link v-if="canEdit && editTo" :to="editTo" :class="LINK">{{ t('app.dashboard.hero.setDate') }}</router-link>
        </template>
      </p>

      <div class="max-w-[520px]" data-testid="hero-plan-slot">
        <DashboardBlock :status="planStatus" :error-text="t('app.dashboard.hero.planError')" @retry="$emit('retry-plan')">
          <template #skeleton>
            <div class="flex flex-col gap-2" data-testid="hero-plan-skeleton">
              <UiSkeleton width="55%" height="1rem" />
              <UiSkeleton height="0.625rem" />
            </div>
          </template>
          <div v-if="plan && plan.total > 0" class="flex flex-col gap-1.5 sm:gap-2" data-testid="hero-plan">
            <p class="flex flex-wrap justify-between gap-x-3 text-[13px]">
              <strong class="font-semibold text-ink-900">{{ t('app.dashboard.plan') }}</strong>
              <span class="text-ink-500"><span class="sm:hidden" data-testid="hero-plan-short">{{ planShort }}</span><span class="max-sm:hidden" data-testid="hero-plan-label">{{ planLabel }}</span></span>
            </p>
            <div
              class="h-2.5 overflow-hidden rounded-full bg-cream-300"
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

      <!-- Phone: the main action and "Ver invitación" side by side, "Editar evento" under them; one row from 640 px. -->
      <div class="mt-1.5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
        <DashboardAction v-if="published && canViewGuests" to="/dashboard/guests" size="hero" class="only:col-span-2" data-testid="hero-share">
          <span class="xl:hidden">{{ t('app.dashboard.hero.share') }}</span>
          <span class="hidden xl:inline">{{ t('app.dashboard.hero.shareLong') }}</span>
        </DashboardAction>
        <DashboardAction v-if="!published && canEdit && editTo" :to="editTo" size="hero" data-testid="hero-publish">
          {{ t('app.dashboard.hero.publish') }}
        </DashboardAction>
        <DashboardAction v-if="canEdit && eventId != null" variant="secondary" size="hero" data-testid="hero-view" @click="previewOpen = true">
          {{ t('app.dashboard.hero.view') }}
        </DashboardAction>
        <DashboardAction v-if="canEdit && editTo" :to="editTo" variant="secondary" size="hero" class="col-span-2" data-testid="hero-edit">
          {{ t('app.dashboard.edit') }}
        </DashboardAction>
      </div>
      <p v-if="!published" class="max-w-md text-[13px] text-ink-500" data-testid="hero-draft-hint">{{ t('app.dashboard.hero.draftHint') }}</p>
    </div>

    <div v-if="wide" class="flex flex-col items-center gap-2.5" data-testid="hero-thumb">
      <DashboardPhone :event-id="eventId" :live="canEdit && eventId != null" :image="image" :name="name" :date-label="hasDate ? dateLabel : ''" />
      <router-link v-if="canEdit && templateTo" :to="templateTo" :class="[LINK, 'px-2']" data-testid="hero-change-template">{{ t('app.dashboard.hero.changeTemplate') }}</router-link>
    </div>

    <InvitationPreviewSheet v-if="canEdit && eventId != null" v-model:open="previewOpen" :event-id="eventId" />
  </DashboardCard>
</template>
