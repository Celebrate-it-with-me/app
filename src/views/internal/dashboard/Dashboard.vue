<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import RsvpService from '@/modules/rsvp/services/RsvpService'
import BudgetService from '@/modules/budget/services/BudgetService'
import timelineService from '@/modules/timeline/services/timelineService'
import DressCodeService from '@/modules/dress-code/services/DressCodeService'
import ActivityService from '@/services/ActivityService'
import TemplatePickerService from '@/modules/template-picker/services/TemplatePickerService'
import InvitationEditorService from '@/modules/invitation-editor/services/InvitationEditorService'
import { useUserStore } from '@/stores/useUserStore'
import EmailVerifyNotice from '@/modules/email-verification/components/EmailVerifyNotice.vue'
import DashboardHero from './DashboardHero.vue'
import DashboardRoute from './DashboardRoute.vue'
import DashboardActivity from './DashboardActivity.vue'
import DashboardNow from './DashboardNow.vue'
import DashboardRsvp from './DashboardRsvp.vue'
import DashboardBudget from './DashboardBudget.vue'
import DashboardProgram from './DashboardProgram.vue'
import DashboardDressCode from './DashboardDressCode.vue'
import { useAssistantStore } from '@/modules/assistant/stores/useAssistantStore'
import { planProgress } from './dashboardLogic'
import { useDashboardBlock } from './useDashboardBlock'
import { eventMoment } from '@/utils/eventDateTime'

const { locale } = useI18n()
const eventsStore = useEventsStore()
const assistantStore = useAssistantStore()

const event = computed(() => eventsStore.activeEvent)
// A module counts when the event's plan includes it (the API sends `event.modules` from the catalog).
const moduleActive = key => !!event.value?.modules?.some(m => m.key === key && m.state === 'active')
// Blocks whose module may be missing from old data: without the module list the request goes out and a 403 hides it.
const moduleOpen = key => !Array.isArray(event.value?.modules) || moduleActive(key)

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
// Money is for owners and editors (owner decision, 2026-11-26) through the `view_budget` event permission the hydration
// sends (owners hold every permission): a viewer never asks for the budget nor sees an amount. A 403 hides the block.
const canSeeBudget = computed(() => moduleActive('budget') && (event.value?.userRole === 'owner' || eventsStore.hasPermission('view_budget')))
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
const { status: budgetStatus, data: budgetSummary, load: loadBudget, hide: hideBudget } = useDashboardBlock(eventId => BudgetService.summary(eventId))

const { status: programStatus, data: programData, load: loadProgram, hide: hideProgram } = useDashboardBlock(eventId => timelineService.list(eventId))
const { status: dressStatus, data: dressData, load: loadDress, hide: hideDress } = useDashboardBlock(eventId => DressCodeService.get(eventId))

const { status: activityStatus, data: activityData, load: loadActivity } = useDashboardBlock(async eventId => {
  const response = await ActivityService.loadDashboardActivities({ eventId })
  return response?.data?.data ?? []
})

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

// Every block asks in parallel and keeps its own state: no cascade, no shared error toast.
function load() {
  const current = event.value
  if (!current?.id) return
  loadThumb(current.id)
  // The assistant never throws into the screen: its store keeps a status per request.
  assistantStore.fetchNext({ eventId: current.id, lang: locale.value })
  // A revisit refreshes the plan quietly: no skeleton over data that is already on screen.
  assistantStore.fetchPlan({ eventId: current.id, lang: locale.value, quiet: sameEvent.value && assistantStore.planStatus === 'ready' })
  loadRsvp(current.id, { quiet: true })
  if (canSeeBudget.value) loadBudget(current.id, { quiet: true })
  else hideBudget()
  if (moduleOpen('timeline')) loadProgram(current.id, { quiet: true })
  else hideProgram()
  if (moduleOpen('dress_code')) loadDress(current.id, { quiet: true })
  else hideDress()
  loadActivity(current.id, { quiet: true })
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

    <DashboardBudget
      v-if="budgetStatus !== 'hidden'"
      :summary="budgetSummary"
      :status="budgetStatus"
      :can-edit="canEdit"
      @retry="loadBudget(event.id)"
    />

    <DashboardActivity
      v-if="activityStatus !== 'hidden'"
      class="mt-4"
      :activity="activityData"
      :status="activityStatus"
      @retry="loadActivity(event.id)"
    />

    <DashboardProgram
      v-if="programStatus !== 'hidden'"
      class="mt-4"
      :moments="programData"
      :status="programStatus"
      :can-edit="canEdit"
      @retry="loadProgram(event.id)"
    />

    <DashboardDressCode
      v-if="dressStatus !== 'hidden'"
      class="mt-4"
      :dress-code="dressData"
      :status="dressStatus"
      :can-edit="canEdit"
      @retry="loadDress(event.id)"
    />
  </div>
</template>
