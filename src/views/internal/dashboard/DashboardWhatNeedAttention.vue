<script setup>
import { AlertTriangle, CheckSquare, DollarSign, Flame, Mail, Users } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  daysUntilEvent: {
    type: Number,
    required: true
  },
  rsvpData: {
    type: Object,
    required: true
  },
  planningData: {
    type: Object,
    required: true
  },
  budgetData: {
    type: Object,
    required: true
  }
})

const urgentAlerts = computed(() => {
  const alerts = []
  const days = props.daysUntilEvent
  const guests = props.rsvpData.total
  const pending = props.rsvpData.pending
  const planning = props.planningData.progress
  const budget = props.budgetData.total

  // CRITICAL: Event TODAY with no guests
  if (days === 0 && guests === 0) {
    alerts.push({
      severity: 'critical',
      icon: Flame,
      iconClass: 'text-red-600',
      bgClass: 'bg-red-50 border-red-500',
      titleClass: 'text-red-900',
      subtitleClass: 'text-red-700',
      buttonClass: 'bg-red-600 text-white hover:bg-red-700',
      title: '🔥 Event is TODAY with no guests!',
      subtitle: 'You need to add guests immediately to start tracking attendance',
      actionLabel: 'Add Guests Now',
      action: () => router.push('/guests')
    })
  }

  // CRITICAL: Event soon (< 7 days) with many pending
  else if (days > 0 && days < 7 && pending > 5) {
    alerts.push({
      severity: 'critical',
      icon: Mail,
      iconClass: 'text-orange-600',
      bgClass: 'bg-orange-50 border-orange-500',
      titleClass: 'text-orange-900',
      subtitleClass: 'text-orange-700',
      buttonClass: 'bg-orange-600 text-white hover:bg-orange-700',
      title: `Event in ${days} days with ${pending} pending RSVPs`,
      subtitle: 'Send reminders to get final headcount before event day',
      actionLabel: 'Send Reminders',
      action: () => router.push('/rsvp?filter=pending')
    })
  }

  // HIGH: No guests at all
  if (guests === 0 && days !== 0) {
    alerts.push({
      severity: 'high',
      icon: Users,
      iconClass: 'text-orange-600',
      bgClass: 'bg-orange-50 border-orange-400',
      titleClass: 'text-orange-900',
      subtitleClass: 'text-orange-700',
      buttonClass: 'bg-orange-600 text-white hover:bg-orange-700',
      title: 'No guests added yet',
      subtitle: 'Start building your guest list to track RSVPs and plan seating',
      actionLabel: 'Add First Guest',
      action: () => router.push('/guests')
    })
  }

  // MEDIUM: Planning not started
  if (planning === 0 && days > 7) {
    alerts.push({
      severity: 'medium',
      icon: CheckSquare,
      iconClass: 'text-yellow-600',
      bgClass: 'bg-yellow-50 border-yellow-400',
      titleClass: 'text-yellow-900',
      subtitleClass: 'text-yellow-700',
      buttonClass: 'bg-yellow-600 text-white hover:bg-yellow-700',
      title: 'Planning checklist not started',
      subtitle: 'Complete your planning tasks to stay organized and on track',
      actionLabel: 'Start Planning',
      action: () => scrollToSection('planning')
    })
  }

  // MEDIUM: No budget set
  if (budget === 0 && days > 14) {
    alerts.push({
      severity: 'medium',
      icon: DollarSign,
      iconClass: 'text-blue-600',
      bgClass: 'bg-blue-50 border-blue-400',
      titleClass: 'text-blue-900',
      subtitleClass: 'text-blue-700',
      buttonClass: 'bg-blue-600 text-white hover:bg-blue-700',
      title: 'Budget not configured',
      subtitle: 'Set up your budget to track expenses and stay within limits',
      actionLabel: 'Create Budget',
      action: () => router.push('/budget')
    })
  }

  return alerts.slice(0, 3)
})

const scrollToSection = sectionId => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <div v-if="urgentAlerts.length > 0" class="urgent-section">
    <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
      <AlertTriangle class="w-5 h-5 text-red-600" />
      What Needs Your Attention
    </h2>

    <div class="space-y-2">
      <div
        v-for="(alert, index) in urgentAlerts"
        :key="index"
        :class="[
          'alert-card p-3 rounded-lg border-l-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all hover:shadow-md border shadow-sm',
          alert.bgClass
        ]"
      >
        <div class="flex items-center gap-3 flex-1">
          <component :is="alert.icon" :class="['w-5 h-5 flex-shrink-0', alert.iconClass]" />
          <div class="flex-1 min-w-0">
            <p :class="['font-semibold text-sm', alert.titleClass]">
              {{ alert.title }}
            </p>
            <p :class="['text-xs mt-0.5 truncate', alert.subtitleClass]">
              {{ alert.subtitle }}
            </p>
          </div>
        </div>
        <button
          :class="[
            'w-full sm:w-auto px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap shadow-sm ml-0 sm:ml-3',
            alert.buttonClass
          ]"
          @click="alert.action"
        >
          {{ alert.actionLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
