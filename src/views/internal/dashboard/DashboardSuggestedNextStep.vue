<script setup>
import {
  CheckCircle,
  CheckSquare,
  DollarSign,
  Lightbulb,
  Mail,
  UserPlus,
  Users
} from 'lucide-vue-next'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  daysUntilEvent: {
    type: Number,
    required: true,
    validator: value => value >= 0
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

const suggestedActions = computed(() => {
  const actions = []
  const days = props.daysUntilEvent
  const guests = props.rsvpData.total
  const confirmed = props.rsvpData.confirmed
  const pending = props.rsvpData.pending
  const planning = props.planningData.progress
  const budget = props.budgetData.total

  // Priority 1: No guests at all
  if (guests === 0) {
    actions.push({
      priority: 1,
      severity: 'critical',
      icon: UserPlus,
      iconClass: 'text-red-600',
      borderClass: 'border-red-400',
      bgClass: 'bg-red-50',
      title: 'Add your first guests',
      subtitle: 'Start building your guest list to track RSVPs',
      actionLabel: 'Add Guests',
      action: () => router.push('/guests')
    })
  }

  // Priority 2: Many pending RSVPs
  else if (pending > 0 && days < 30) {
    actions.push({
      priority: 2,
      severity: 'high',
      icon: Mail,
      iconClass: 'text-purple-600',
      borderClass: 'border-purple-400',
      bgClass: 'bg-purple-50',
      title: `Send invitations to ${pending} pending guests`,
      subtitle: days < 7 ? 'Event is soon - get responses ASAP' : 'Get your guest list finalized',
      actionLabel: 'Send Invites',
      action: () => router.push('/rsvp?filter=pending')
    })
  }

  // Priority 3: Planning not started
  if (planning === 0 && days > 7) {
    actions.push({
      priority: 3,
      severity: 'medium',
      icon: CheckSquare,
      iconClass: 'text-green-600',
      borderClass: 'border-green-400',
      bgClass: 'bg-green-50',
      title: 'Start your event planning checklist',
      subtitle: 'Complete tasks to stay organized and on track',
      actionLabel: 'Get Started',
      action: () => scrollToSection('planning')
    })
  }

  // Priority 4: Incomplete planning
  /*else if (planning > 0 && planning < 100) {
    const incompleteCount = planningData.value.items.filter(i => !i.completed).length
    if (incompleteCount > 0) {
      actions.push({
        priority: 4,
        severity: 'medium',
        icon: ListChecks,
        iconClass: 'text-green-600',
        borderClass: 'border-green-400',
        bgClass: 'bg-green-50',
        title: `Complete ${incompleteCount} remaining planning tasks`,
        subtitle: `You're ${planning}% done - keep going!`,
        actionLabel: 'Review Tasks',
        action: () => scrollToSection('planning')
      })
    }
  }*/

  // Priority 5: No budget
  if (budget === 0 && days > 14) {
    actions.push({
      priority: 5,
      severity: 'low',
      icon: DollarSign,
      iconClass: 'text-pink-600',
      borderClass: 'border-pink-400',
      bgClass: 'bg-pink-50',
      title: 'Set up your event budget',
      subtitle: 'Track expenses and stay within your limits',
      actionLabel: 'Create Budget',
      action: () => router.push('/budget')
    })
  }

  // Priority 6: Confirm headcount (if event soon)
  if (days < 14 && days > 0 && confirmed > 0) {
    actions.push({
      priority: 6,
      severity: 'low',
      icon: Users,
      iconClass: 'text-blue-600',
      borderClass: 'border-blue-400',
      bgClass: 'bg-blue-50',
      title: 'Confirm final headcount with venue',
      subtitle: `${confirmed} guests confirmed - notify your vendors`,
      actionLabel: 'Confirm',
      action: () => handleConfirmHeadcount()
    })
  }

  return actions.sort((a, b) => a.priority - b.priority).slice(0, 3)
})

const scrollToSection = sectionId => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleConfirmHeadcount = () => {
  router.push('/dashboard/locations')
}
</script>

<template>
  <div class="suggestions-section bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
    <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
      <Lightbulb class="w-5 h-5 text-yellow-500" />
      Suggested Next Steps
    </h2>

    <div v-if="suggestedActions.length > 0" class="space-y-2">
      <div
        v-for="(action, index) in suggestedActions"
        :key="index"
        :class="[
          'suggestion-item flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border-l-4 transition-all hover:shadow-md border shadow-sm gap-3',
          action.borderClass,
          action.bgClass
        ]"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <span
            class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/50 text-gray-700 font-bold text-xs shadow-sm"
          >
            {{ index + 1 }}
          </span>
          <component :is="action.icon" :class="['w-5 h-5 flex-shrink-0', action.iconClass]" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm text-gray-900 truncate">
              {{ action.title }}
            </p>
            <p v-if="action.subtitle" class="text-xs text-gray-600 mt-0.5 truncate">
              {{ action.subtitle }}
            </p>
          </div>
        </div>
        <button
          class="w-full sm:w-auto px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-bold shadow-sm whitespace-nowrap ml-0 sm:ml-3"
          @click="action.action"
        >
          {{ action.actionLabel }}
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-6">
      <div class="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-full mb-2">
        <CheckCircle class="w-6 h-6 text-green-500" />
      </div>
      <h3 class="text-base font-bold text-gray-900 mb-1">All Caught Up! 🎉</h3>
      <p class="text-sm text-gray-600">No urgent actions needed right now.</p>
    </div>
  </div>
</template>

<style scoped></style>
