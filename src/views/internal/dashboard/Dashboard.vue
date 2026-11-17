<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useRsvpStore } from '@/modules/rsvp/stores/useRsvpStore'
import { useBudgetStore } from '@/modules/budget/stores/useBudgetStore'
import { useTimelineStore } from '@/modules/timeline/stores/timelineStore'
import { useActivityStore } from '@/stores/useActivityStore'
import TemplatePickerService from '@/modules/template-picker/services/TemplatePickerService'
import { useToast } from '@/ui'
import DashboardHero from './DashboardHero.vue'
import DashboardStats from './DashboardStats.vue'
import DashboardActivity from './DashboardActivity.vue'
import DashboardStartLink from './DashboardStartLink.vue'
import OnboardingService from '@/modules/onboarding/services/OnboardingService'
import { allDone, normalizeProgress } from '@/modules/onboarding/utils/steps'
import DashboardRsvp from './DashboardRsvp.vue'
import DashboardMore from './DashboardMore.vue'
import { summarizeRsvp, readiness } from './dashboardLogic'

const { t } = useI18n()
const { error: showError } = useToast()
const eventsStore = useEventsStore()
const rsvpStore = useRsvpStore()
const budgetStore = useBudgetStore()
const timelineStore = useTimelineStore()
const activityStore = useActivityStore()

const event = computed(() => eventsStore.activeEvent)
// A module counts when the event's plan includes it (the API sends `event.modules` from the catalog).
const moduleActive = key => !!event.value?.modules?.some(m => m.key === key && m.state === 'active')
const budgetEnabled = computed(() => moduleActive('budget'))

const rsvp = computed(() => summarizeRsvp(rsvpStore.stats))
const guestCount = computed(() => event.value?.guestsCount ?? rsvp.value.people)
const published = computed(() => event.value?.status === 'published')

// Only owners and editors (`edit_event`) change the event; a viewer just reads.
// Owners always see their guests; other roles by the `view_guests` permission (same rule as the collaborators menu).
const canViewGuests = computed(() => event.value?.userRole === 'owner' || eventsStore.hasPermission('view_guests'))
const canEdit = computed(() => ['owner', 'editor'].includes(event.value?.userRole))
const editTarget = computed(() => (event.value ? { name: 'edit-event', params: { id: event.value.id } } : null))

const progress = computed(() =>
  readiness({
    hasDate: !!event.value?.startDate,
    guestCount: guestCount.value,
    published: published.value,
    budgetEnabled: budgetEnabled.value,
    budgetItems: budget.value.items
  }).ratio
)
const budget = computed(() => {
  const summary = budgetStore.summary
  const count = (summary?.categories ?? []).reduce((total, c) => total + c.itemCount, 0) + (summary?.uncategorized?.itemCount ?? 0)
  return {
    cap: summary?.cap ?? 0,
    estimated: summary?.totals.owed ?? 0,
    paid: summary?.totals.paid ?? 0,
    currency: summary?.currency ?? 'USD',
    items: count
  }
})

const program = computed(() =>
  [...(timelineStore.timelines ?? [])]
    .map(item => ({ id: item.id, title: item.title, at: new Date(String(item.start_time ?? item.startTime).replace(' ', 'T')) }))
    .filter(item => !Number.isNaN(item.at.getTime()))
    .sort((a, b) => a.at - b.at)
    .slice(0, 4)
    .map(item => ({
      id: item.id,
      title: item.title,
      time: item.at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
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

const activity = computed(() => (activityStore.activities ?? []).slice(0, 5))

// The invitation's thumbnail: the preview image of the template in use (the only place the app gets it). Best effort: a
// failure or a template without image just leaves the hero on its fallback card.
const thumb = ref('')
async function loadThumb(eventId) {
  thumb.value = ''
  if (!canEdit.value) return
  try {
    const current = (await TemplatePickerService.templates(eventId)).find(item => item.current)
    if (eventId === event.value?.id) thumb.value = current?.previewImage ?? ''
  } catch {
    // Viewers and unsupported event types get an error here; the fallback card is fine.
  }
}

let loadId = 0
async function load() {
  const current = event.value
  if (!current?.id) return
  const id = ++loadId
  loadStart(current.id)
  loadThumb(current.id)
  const jobs = [rsvpStore.fetchStats(), activityStore.loadDashboardActivities(), timelineStore.fetchTimelines(current.id)]
  if (budgetEnabled.value) jobs.push(budgetStore.fetchSummary(current.id))
  const results = await Promise.allSettled(jobs)
  if (id === loadId && results.some(r => r.status === 'rejected')) showError(t('app.dashboard.loadError'))
}

watch(() => event.value?.id, load, { immediate: true })
</script>

<template>
  <div v-if="event">
    <DashboardHero
      :event-id="event.id"
      :name="event.eventName"
      :start-date="event.startDate"
      :progress="progress"
      :published="published"
      :can-view-guests="canViewGuests"
      :image="thumb"
      :can-edit="canEdit"
      :edit-to="editTarget"
    />

    <DashboardStartLink v-if="showStart" :done="start.done" :total="start.total" />
    <div v-else-if="holdStartSlot" class="mt-3 h-[4.125rem] rounded-xl border border-line bg-white" aria-hidden="true" data-testid="start-link-slot" />

    <DashboardStats class="mt-6" :rsvp="rsvp" :can-edit="canEdit" />

    <div class="mt-4 grid gap-4 lg:grid-cols-3">
      <DashboardRsvp v-if="rsvp.people" class="lg:col-span-2" :rsvp="rsvp" />
      <DashboardActivity :activity="activity" :class="rsvp.people ? '' : 'lg:col-span-3'" />
    </div>

    <DashboardMore :budget-enabled="budgetEnabled" :budget="budget" :program="program" />
  </div>
</template>
