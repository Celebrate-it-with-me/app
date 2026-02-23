<script setup>
import { computed, onMounted, watch } from 'vue'
import { differenceInDays, parse } from 'date-fns'

import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useRsvpStore } from '@/modules/rsvp/stores/useRsvpStore'
import { useBudgetStore } from '@/modules/budget/stores/useBudgetStore'
import { useTodoStore } from '@/stores/useTodoStore'
import { useActivityStore } from '@/stores/useActivityStore'
import DashboardActiveEvent from '@/views/internal/dashboard/DashboardActiveEvent.vue'
import DashboardWhatNeedAttention from '@/views/internal/dashboard/DashboardWhatNeedAttention.vue'
import DashboardQuickStats from '@/views/internal/dashboard/DashboardQuickStats.vue'
import DashboardSuggestedNextStep from '@/views/internal/dashboard/DashboardSuggestedNextStep.vue'
import DashboardRecentActivity from '@/views/internal/dashboard/DashboardRecentActivity.vue'
import { useUserStore } from '@/stores/useUserStore'

const eventsStore = useEventsStore()
const rsvpStore = useRsvpStore()
const budgetStore = useBudgetStore()
const todoStore = useTodoStore()
const activityStore = useActivityStore()
const userStore = useUserStore()

// Event Data
const eventData = computed(
  () =>
    eventsStore.activeEvent || {
      name: 'Your Event',
      date: new Date().toISOString(),
      status: 'Draft'
    }
)

// Days until event
const daysUntilEvent = computed(() => {
  if (!eventData.value?.startDate) return 0
  const eventDate = parse(eventData.value.startDate, 'MM/dd/yyyy HH:mm', new Date())
  return differenceInDays(eventDate, new Date())
})

// RSVP Data
const rsvpData = computed(() => {
  const stats = rsvpStore.stats || {}
  return {
    total: stats.data?.totals?.people || 0,
    confirmed: stats.data?.attending?.total || 0,
    pending: stats.data?.pending?.total || 0,
    declined: stats.data?.not_attending?.total || 0
  }
})

// Planning Data
const planningData = computed(() => {
  const tasks = todoStore.tasks || []
  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    progress,
    items: tasks.map(t => ({ name: t.title, completed: t.completed }))
  }
})

// Budget Data
const budgetData = computed(() => {
  const budget = budgetStore.eventBudget || {}
  const paid = parseFloat(budget.total_paid || 0)
  const total = parseFloat(budget.budget_cap || 0)
  const progress = total > 0 ? Math.round((paid / total) * 100) : 0

  return {
    paid,
    total,
    progress,
    items: budgetStore.budgetItems || []
  }
})

onMounted(async () => {
  console.log('DashboardView mounted')
  if (eventsStore.activeEvent) {
    await rsvpStore.fetchStats()
    await budgetStore.getEventBudget()
    await activityStore.loadDashboardActivities()
  }
})

watch(
  () => userStore.activeEvent,
  async newValue => {
    if (newValue) {
      await rsvpStore.fetchStats()
      // budgetStore.getEventBudget();
      // activityStore.loadDashboardActivities();
    }
  }
)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
    <!-- Active event data-->
    <DashboardActiveEvent :days-until-event="daysUntilEvent" />

    <!-- What Needs Your Attention -->
    <DashboardWhatNeedAttention
      :budget-data="budgetData"
      :planning-data="planningData"
      :rsvp-data="rsvpData"
      :days-until-event="daysUntilEvent"
    />

    <!-- QUICK STATS -->
    <DashboardQuickStats
      :rsvp-data="rsvpData"
      :planning-data="planningData"
      :budget-data="budgetData"
    />

    <!-- SUGGESTED NEXT STEPS -->
    <DashboardSuggestedNextStep
      :budget-data="budgetData"
      :planning-data="planningData"
      :rsvp-data="rsvpData"
      :days-until-event="daysUntilEvent"
    />

    <!-- RECENT ACTIVITY -->
    <DashboardRecentActivity />
  </div>
</template>
