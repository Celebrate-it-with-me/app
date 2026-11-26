<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useRsvpStore } from '@/modules/rsvp/stores/useRsvpStore'
import { useBudgetStore } from '@/modules/budget/stores/useBudgetStore'
import { useTimelineStore } from '@/modules/timeline/stores/timelineStore'
import { useActivityStore } from '@/stores/useActivityStore'
import TemplatePickerService from '@/modules/template-picker/services/TemplatePickerService'
import { useToast } from '@/ui'
import { useUserStore } from '@/stores/useUserStore'
import EmailVerifyNotice from '@/modules/email-verification/components/EmailVerifyNotice.vue'
import DashboardHero from './DashboardHero.vue'
import DashboardRoute from './DashboardRoute.vue'
import DashboardStats from './DashboardStats.vue'
import DashboardActivity from './DashboardActivity.vue'
import DashboardStartLink from './DashboardStartLink.vue'
import OnboardingService from '@/modules/onboarding/services/OnboardingService'
import { allDone, normalizeProgress } from '@/modules/onboarding/utils/steps'
import DashboardRsvp from './DashboardRsvp.vue'
import DashboardMore from './DashboardMore.vue'
import { useAssistantStore } from '@/modules/assistant/stores/useAssistantStore'
import { summarizeRsvp, planProgress, readableActivity } from './dashboardLogic'
import { eventMoment, formatEventDate } from '@/utils/eventDateTime'

const { t, locale } = useI18n()
const { error: showError } = useToast()
const eventsStore = useEventsStore()
const rsvpStore = useRsvpStore()
const budgetStore = useBudgetStore()
const timelineStore = useTimelineStore()
const activityStore = useActivityStore()
const assistantStore = useAssistantStore()

const event = computed(() => eventsStore.activeEvent)
// A module counts when the event's plan includes it (the API sends `event.modules` from the catalog).
const moduleActive = key => !!event.value?.modules?.some(m => m.key === key && m.state === 'active')
const budgetEnabled = computed(() => moduleActive('budget'))

const rsvp = computed(() => summarizeRsvp(rsvpStore.stats))
const published = computed(() => event.value?.status === 'published')

// Only owners and editors (`edit_event`) change the event; a viewer just reads.
// Owners always see their guests; other roles by the `view_guests` permission (same rule as the collaborators menu).
const canViewGuests = computed(() => event.value?.userRole === 'owner' || eventsStore.hasPermission('view_guests'))
const canEdit = computed(() => ['owner', 'editor'].includes(event.value?.userRole))
const editTarget = computed(() => (event.value ? { name: 'edit-event', params: { id: event.value.id } } : null))

// One number for the plan: the assistant's, already loaded by the layout (never recalculated here).
const plan = computed(() => (assistantStore.eventId === event.value?.id ? planProgress(assistantStore.next) : null))
// Each request has its own state, so a slow or failed one never empties the others.
const blockStatus = status => (status === 'ready' || status === 'error' ? status : 'loading')
const sameEvent = computed(() => assistantStore.eventId === event.value?.id)
const planStatus = computed(() => (sameEvent.value ? blockStatus(assistantStore.nextStatus) : 'loading'))
const routePlan = computed(() => (sameEvent.value ? assistantStore.plan : null))
const routeStatus = computed(() => (sameEvent.value ? blockStatus(assistantStore.planStatus) : 'loading'))
const retryPlan = () => assistantStore.fetchNext({ eventId: event.value?.id, lang: locale.value, force: true })
const retryRoute = () => assistantStore.fetchPlan({ eventId: event.value?.id, lang: locale.value })
const templateTo = { name: 'invitation-editor' }
const budget = computed(() => {
  const summary = budgetStore.summary
  const count = (summary?.categories ?? []).reduce((total, c) => total + c.itemCount, 0) + (summary?.uncategorized?.itemCount ?? 0)
  return {
    cap: summary?.cap ?? 0,
    // The card's "estimated" is what is owed (`owed`), so the warning follows `overCap` (over `owed`), not `estimatedOverCap`.
    estimated: summary?.totals.owed ?? 0,
    paid: summary?.totals.paid ?? 0,
    overByCents: summary?.totals.overCap ? Number(summary.totals.overByCents) || 0 : 0,
    paidOverByCents: summary?.totals.paidOverCap ? Number(summary.totals.paidOverByCents) || 0 : 0,
    currency: summary?.currency ?? 'USD',
    items: count
  }
})

const program = computed(() =>
  [...(timelineStore.timelines ?? [])]
    .map(item => ({ id: item.id, title: item.title, at: new Date(String(item.start_time ?? item.startTime).replace(' ', 'T')), raw: String(item.start_time ?? item.startTime) }))
    .filter(item => !Number.isNaN(item.at.getTime()))
    .sort((a, b) => a.at - b.at)
    .slice(0, 4)
    .map(item => ({
      id: item.id,
      title: item.title,
      time: formatEventDate(item.raw, 'time', locale.value)
    }))
)

// First steps: a calm link while some are pending. A failure here just hides the link.
const start = ref(null)
const startLoading = ref(false)
const showStart = computed(() => start.value && !allDone(start.value))
// The link's slot is held while its data loads, but only when it was there last time (or never seen): people who
// finished the first steps would otherwise see the slot appear and collapse on every visit.
const startKey = id => `quinvite.dashboard.start.${id}`
const startWasShown = id => {
  try {
    return localStorage.getItem(startKey(id)) !== '0'
  } catch {
    return true
  }
}
const holdStartSlot = computed(() => startLoading.value && !showStart.value && startWasShown(event.value?.id))
async function loadStart(eventId) {
  start.value = null
  startLoading.value = true
  try {
    const data = normalizeProgress(await OnboardingService.progress(eventId))
    if (eventId === event.value?.id) start.value = data
  } catch {
    start.value = null
  } finally {
    if (eventId === event.value?.id) {
      startLoading.value = false
      try {
        localStorage.setItem(startKey(eventId), showStart.value ? '1' : '0')
      } catch {
        // Storage can be unavailable (private mode): the slot just follows the default.
      }
    }
  }
}

const activity = computed(() => readableActivity(activityStore.activities ?? []).slice(0, 5))

// The template in use: its name (chip) and its preview image (the invitation's thumbnail) come from the same list. Best
// effort: a failure or a template without image leaves the hero on its fallback card and without the chip.
const thumb = ref('')
const templateName = ref('')
const templateStatus = ref('ready')
async function loadThumb(eventId) {
  thumb.value = ''
  templateName.value = ''
  if (!canEdit.value) {
    templateStatus.value = 'ready'
    return
  }
  templateStatus.value = 'loading'
  try {
    const current = (await TemplatePickerService.templates(eventId)).find(item => item.current)
    if (eventId !== event.value?.id) return
    thumb.value = current?.previewImage ?? ''
    templateName.value = current?.name ?? ''
    templateStatus.value = 'ready'
  } catch {
    // Viewers and unsupported event types get an error here; the fallback card is fine.
    if (eventId === event.value?.id) templateStatus.value = 'error'
  }
}

let loadId = 0
async function load() {
  const current = event.value
  if (!current?.id) return
  const id = ++loadId
  loadStart(current.id)
  loadThumb(current.id)
  // The assistant never throws into the screen (its stores keep a status), so it stays out of the shared error toast.
  assistantStore.fetchNext({ eventId: current.id, lang: locale.value })
  // A revisit refreshes the plan quietly: no skeleton over data that is already on screen.
  assistantStore.fetchPlan({ eventId: current.id, lang: locale.value, quiet: sameEvent.value && assistantStore.planStatus === 'ready' })
  const jobs = [rsvpStore.fetchStats(), activityStore.loadDashboardActivities(), timelineStore.fetchTimelines(current.id)]
  if (budgetEnabled.value) jobs.push(budgetStore.fetchSummary(current.id))
  const results = await Promise.allSettled(jobs)
  if (id === loadId && results.some(r => r.status === 'rejected')) showError(t('app.dashboard.loadError'))
}

watch(() => event.value?.id, load, { immediate: true })

// The permanent notice follows the API's flag; read it fresh on every visit so it disappears once the email is verified.
onMounted(() => useUserStore().syncEmailVerified())
</script>

<template>
  <div v-if="event">
    <EmailVerifyNotice />
    <DashboardHero
      :event-id="event.id"
      :name="event.eventName"
      :start-date="eventMoment(event)"
      :timezone="event.timezone"
      :plan="plan"
      :plan-status="planStatus"
      :published="published"
      :can-view-guests="canViewGuests"
      :image="thumb"
      :template-name="templateName"
      :template-status="templateStatus"
      :can-edit="canEdit"
      :edit-to="editTarget"
      :template-to="templateTo"
      @retry-plan="retryPlan"
    />

    <DashboardRoute
      :plan="routePlan"
      :status="routeStatus"
      :start-date="eventMoment(event)"
      :timezone="event.timezone"
      :can-edit="canEdit"
      :edit-to="editTarget"
      @retry="retryRoute"
    />

    <DashboardStartLink v-if="showStart" :done="start.done" :total="start.total" />
    <div v-else-if="holdStartSlot" class="mt-3 h-[4.125rem] rounded-xl border border-line bg-white" aria-hidden="true" data-testid="start-link-slot" />

    <DashboardStats class="mt-6" :rsvp="rsvp" :can-edit="canEdit" />

    <div class="mt-4 grid gap-4 lg:grid-cols-3 lg:items-start">
      <DashboardRsvp v-if="rsvp.people" class="lg:col-span-2" :rsvp="rsvp" />
      <DashboardActivity :activity="activity" :class="rsvp.people ? '' : 'lg:col-span-3'" />
    </div>

    <DashboardMore :budget-enabled="budgetEnabled" :budget="budget" :program="program" />
  </div>
</template>
