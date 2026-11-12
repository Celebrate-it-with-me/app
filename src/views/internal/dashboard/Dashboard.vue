<script setup>
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useRsvpStore } from '@/modules/rsvp/stores/useRsvpStore'
import { useBudgetStore } from '@/modules/budget/stores/useBudgetStore'
import { useTimelineStore } from '@/modules/timeline/stores/timelineStore'
import { useActivityStore } from '@/stores/useActivityStore'
import { useToast } from '@/ui'
import DashboardHeader from './DashboardHeader.vue'
import DashboardNextStep from './DashboardNextStep.vue'
import DashboardRsvp from './DashboardRsvp.vue'
import DashboardInvitation from './DashboardInvitation.vue'
import DashboardMore from './DashboardMore.vue'
import { summarizeRsvp, pickNextStep } from './dashboardLogic'

const { t } = useI18n()
const { error: showError } = useToast()
const eventsStore = useEventsStore()
const rsvpStore = useRsvpStore()
const budgetStore = useBudgetStore()
const timelineStore = useTimelineStore()
const activityStore = useActivityStore()

const event = computed(() => eventsStore.activeEvent)
const featureOn = name => !!event.value?.eventFeatures?.some(f => f.name === name && f.isActive)
const rsvpEnabled = computed(() => featureOn('rsvp'))
const budgetEnabled = computed(() => featureOn('budget'))

const rsvp = computed(() => summarizeRsvp(rsvpStore.stats))
const guestCount = computed(() => event.value?.guestsCount ?? rsvp.value.people)
const published = computed(() => event.value?.status === 'published')

const editTarget = computed(() => (event.value ? { name: 'edit-event', params: { id: event.value.id } } : null))

const step = computed(() =>
  pickNextStep({
    guestCount: guestCount.value,
    status: event.value?.status,
    pendingGuests: rsvp.value.pendingGuests,
    rsvpEnabled: rsvpEnabled.value,
    budgetEnabled: budgetEnabled.value,
    budgetItems: budgetStore.budgetItems?.length ?? 0
  })
)
const stepTarget = computed(() => (step.value.to === 'edit' ? editTarget.value : step.value.to))

const budget = computed(() => {
  const items = budgetStore.budgetItems ?? []
  const sum = key => items.reduce((total, item) => total + Number(item[key] || 0), 0)
  const paid = items.filter(i => i.isPaid).reduce((total, i) => total + Number(i.actualCost || i.estimatedCost || 0), 0)
  return { cap: Number(budgetStore.eventBudget?.budgetCap || 0), estimated: sum('estimatedCost'), paid, items: items.length }
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

const activity = computed(() => (activityStore.activities ?? []).slice(0, 5))

let loadId = 0
async function load() {
  const current = event.value
  if (!current?.id) return
  const id = ++loadId
  const jobs = [rsvpStore.fetchStats(), activityStore.loadDashboardActivities(), timelineStore.fetchTimelines(current.id)]
  if (budgetEnabled.value) jobs.push(budgetStore.getEventBudget().then(() => budgetStore.loadBudgetItems()))
  const results = await Promise.allSettled(jobs)
  if (id === loadId && results.some(r => r.status === 'rejected')) showError(t('app.dashboard.loadError'))
}

watch(() => event.value?.id, load, { immediate: true })
</script>

<template>
  <div v-if="event">
    <DashboardHeader :name="event.eventName" :start-date="event.startDate" :progress="event.setupProgress ?? 0" />

    <DashboardNextStep :step="step" :target="stepTarget" />

    <div class="mt-6 grid gap-4 lg:grid-cols-3">
      <DashboardRsvp class="lg:col-span-2" :rsvp="rsvp" />
      <DashboardInvitation :published="published" :edit-to="editTarget" />
    </div>

    <DashboardMore :budget-enabled="budgetEnabled" :budget="budget" :program="program" :activity="activity" />
  </div>
</template>
