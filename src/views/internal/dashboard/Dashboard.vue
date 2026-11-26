<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import RsvpService from '@/modules/rsvp/services/RsvpService'
import { useBudgetStore } from '@/modules/budget/stores/useBudgetStore'
import { useTimelineStore } from '@/modules/timeline/stores/timelineStore'
import { useActivityStore } from '@/stores/useActivityStore'
import TemplatePickerService from '@/modules/template-picker/services/TemplatePickerService'
import InvitationEditorService from '@/modules/invitation-editor/services/InvitationEditorService'
import { useToast } from '@/ui'
import { useUserStore } from '@/stores/useUserStore'
import EmailVerifyNotice from '@/modules/email-verification/components/EmailVerifyNotice.vue'
import DashboardHero from './DashboardHero.vue'
import DashboardRoute from './DashboardRoute.vue'
import DashboardActivity from './DashboardActivity.vue'
import DashboardNow from './DashboardNow.vue'
import DashboardRsvp from './DashboardRsvp.vue'
import DashboardMore from './DashboardMore.vue'
import { useAssistantStore } from '@/modules/assistant/stores/useAssistantStore'
import { planProgress, readableActivity } from './dashboardLogic'
import { useDashboardBlock } from './useDashboardBlock'
import { eventMoment, formatEventDate } from '@/utils/eventDateTime'

const { t, locale } = useI18n()
const { error: showError } = useToast()
const eventsStore = useEventsStore()
const budgetStore = useBudgetStore()
const timelineStore = useTimelineStore()
const activityStore = useActivityStore()
const assistantStore = useAssistantStore()

const event = computed(() => eventsStore.activeEvent)
// A module counts when the event's plan includes it (the API sends `event.modules` from the catalog).
const moduleActive = key => !!event.value?.modules?.some(m => m.key === key && m.state === 'active')
const budgetEnabled = computed(() => moduleActive('budget'))

// Blocks with their own request and state (skeleton, error with retry, hidden on a 403): see useDashboardBlock.
const { status: rsvpStatus, data: rsvpStats, load: loadRsvp } = useDashboardBlock(async eventId => {
  const response = await RsvpService.loadStats({ eventId })
  return response?.data?.data ?? response?.data ?? {}
})
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

const activity = computed(() => readableActivity(activityStore.activities ?? []).slice(0, 5))

// The template in use: its name (chip) and its preview image (the invitation's thumbnail) come from the same list. Best
// effort: a failure or a template without image leaves the hero on its fallback card and without the chip.
const thumb = ref('')
const templateName = ref('')
const templateStatus = ref('ready')
async function loadThumb(eventId) {
  thumb.value = ''
  templateName.value = ''
  templateStatus.value = 'loading'
  // A viewer cannot list templates nor draw the live preview (403): the invitation itself gives the template's name, and
  // the phone shows its stationery card.
  if (!canEdit.value) {
    try {
      const invitation = await InvitationEditorService.get(eventId)
      if (eventId !== event.value?.id) return
      templateName.value = invitation?.template?.name ?? ''
      templateStatus.value = 'ready'
    } catch {
      if (eventId === event.value?.id) templateStatus.value = 'error'
    }
    return
  }
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
  loadThumb(current.id)
  // The assistant never throws into the screen (its stores keep a status), so it stays out of the shared error toast.
  assistantStore.fetchNext({ eventId: current.id, lang: locale.value })
  // A revisit refreshes the plan quietly: no skeleton over data that is already on screen.
  assistantStore.fetchPlan({ eventId: current.id, lang: locale.value, quiet: sameEvent.value && assistantStore.planStatus === 'ready' })
  loadRsvp(current.id, { quiet: true })
  // Activity and program still come from their stores (their own blocks arrive with the next round): a failure there is
  // the only one left for the shared toast.
  const jobs = [activityStore.loadDashboardActivities(), timelineStore.fetchTimelines(current.id)]
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

    <DashboardNow v-if="canEdit" :key="event.id" :next="sameEvent ? assistantStore.next : null" :status="planStatus" :event-id="event.id" @retry="retryPlan" />

    <DashboardRsvp
      v-if="rsvpStatus !== 'hidden'"
      :stats="rsvpStats"
      :status="rsvpStatus"
      :can-edit="canEdit"
      :can-view-guests="canViewGuests"
      :timezone="event.timezone"
      @retry="loadRsvp(event.id)"
    />

    <DashboardActivity class="mt-4" :activity="activity" />

    <DashboardMore :budget-enabled="budgetEnabled" :budget="budget" :program="program" />
  </div>
</template>
