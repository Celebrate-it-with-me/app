<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarDays, Eye, Pencil, Send, Share2 } from 'lucide-vue-next'
import { UiBadge, UiButton } from '@/ui'
import InvitationPreviewSheet from '@/modules/template-picker/components/InvitationPreviewSheet.vue'
import DashboardPhone from './DashboardPhone.vue'
import { parseEventDate, daysUntil, countdownInfo } from './dashboardLogic'

const props = defineProps({
  eventId: { type: [Number, String], default: null },
  name: { type: String, default: '' },
  startDate: { type: String, default: '' },
  /** 0..1 as sent by the API (`setupProgress`). */
  progress: { type: Number, default: 0 },
  published: { type: Boolean, default: false },
  /** Sending goes through the guest list (each invitation has its own code): needs `view_guests`. */
  canViewGuests: { type: Boolean, default: false },
  /** Preview image of the active template; empty draws the fallback card. */
  image: { type: String, default: '' },
  /** Only owners and editors change or publish the event; viewers just look. */
  canEdit: { type: Boolean, default: false },
  /** Route to the event form, where the invitation is published. */
  editTo: { type: [String, Object], default: null }
})

const { t, locale } = useI18n()

const date = computed(() => parseEventDate(props.startDate))
const countdown = computed(() => countdownInfo(daysUntil(date.value)))
const dateLabel = computed(() =>
  date.value
    ? new Intl.DateTimeFormat(locale.value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date.value)
    : t('app.dashboard.noDate')
)
const percent = computed(() => Math.round(Math.min(1, Math.max(0, props.progress)) * 100))

const previewOpen = ref(false)
</script>

<template>
  <header class="grid gap-6 pb-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-10" data-testid="dashboard-hero">
    <DashboardPhone :event-id="eventId" :live="canEdit && eventId != null" :image="image" :name="name" :date-label="date ? dateLabel : ''" class="mx-auto sm:mx-0" />

    <div class="min-w-0">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p class="flex items-center gap-2 text-sm text-ink-600">
          <CalendarDays class="h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
          <span class="first-letter:uppercase">{{ dateLabel }}</span>
        </p>
        <UiBadge :tone="published ? 'success' : 'warning'" size="sm" dot data-testid="hero-status">
          {{ t(published ? 'app.dashboard.invitation.published' : 'app.dashboard.invitation.draft') }}
        </UiBadge>
      </div>

      <h1 class="mt-2 font-heading text-3xl text-ink-900 text-balance sm:text-5xl">{{ name }}</h1>

      <p class="mt-4 flex items-baseline gap-2 text-ink-700" data-testid="hero-countdown" :data-kind="countdown.kind">
        <template v-if="countdown.kind === 'future'">
          <span class="font-heading text-5xl leading-none text-rose-700 tabular-nums sm:text-6xl">{{ countdown.n }}</span>
          <span class="text-base">{{ t('app.dashboard.hero.daysLeft', { n: countdown.n }, countdown.n) }}</span>
        </template>
        <span v-else-if="countdown.kind === 'today'" class="font-heading text-4xl leading-none text-rose-700 sm:text-5xl">{{ t('app.dashboard.hero.today') }}</span>
        <span v-else-if="countdown.kind === 'past'" class="font-heading text-3xl leading-none text-ink-700">{{ t('app.dashboard.past') }}</span>
        <template v-else>
          <span class="text-base">{{ t('app.dashboard.noDate') }}</span>
          <router-link v-if="canEdit && editTo" :to="editTo" class="inline-flex min-h-11 items-center text-sm font-semibold text-rose-700 underline-offset-4 hover:underline">{{ t('app.dashboard.hero.setDate') }}</router-link>
        </template>
      </p>

      <div class="mt-4 max-w-md">
        <p class="text-sm text-ink-700">{{ t('app.dashboard.setup', { n: percent }) }}</p>
        <div
          class="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-300"
          role="progressbar"
          :aria-valuenow="percent"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="t('app.dashboard.setup', { n: percent })"
        >
          <div class="h-full rounded-full bg-gold-500" :style="{ width: percent + '%' }"></div>
        </div>
      </div>

      <div class="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        <UiButton v-if="published && canViewGuests" to="/dashboard/guests" class="col-span-2 sm:col-span-1" data-testid="hero-share">
          <Share2 class="h-4 w-4" aria-hidden="true" />
          {{ t('app.dashboard.hero.share') }}
        </UiButton>
        <UiButton v-if="!published && canEdit && editTo" :to="editTo" class="col-span-2 sm:col-span-1" data-testid="hero-publish">
          <Send class="h-4 w-4" aria-hidden="true" />
          {{ t('app.dashboard.hero.publish') }}
        </UiButton>
        <UiButton v-if="canEdit && eventId != null" variant="secondary" data-testid="hero-view" @click="previewOpen = true">
          <Eye class="h-4 w-4" aria-hidden="true" />
          {{ t('app.dashboard.hero.view') }}
        </UiButton>
        <UiButton v-if="canEdit && editTo" :to="editTo" variant="secondary" data-testid="hero-edit">
          <Pencil class="h-4 w-4" aria-hidden="true" />
          {{ t('app.dashboard.edit') }}
        </UiButton>
      </div>
      <p v-if="!published" class="mt-3 max-w-md text-sm text-ink-600" data-testid="hero-draft-hint">{{ t('app.dashboard.hero.draftHint') }}</p>
    </div>

    <InvitationPreviewSheet v-if="canEdit && eventId != null" v-model:open="previewOpen" :event-id="eventId" />
  </header>
</template>
