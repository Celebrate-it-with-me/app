<script setup>
import { ArrowRight, CheckSquare, DollarSign, Plus, Rocket, UserPlus, Users } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const props = defineProps({
  rsvpData: {
    type: Object,
    required: true
  },
  planningData: {
    type: Object,
    required: false
  },
  budgetData: {
    type: Object,
    required: false
  }
})

const router = useRouter()

const handleGuestsClick = () => {
  if (props.rsvpData.total > 0) {
    router.push('/rsvp');
  } else {
    router.push('/guests');
  }
};

const handleBudgetClick = () => {
  router.push('/budget');
};

const handlePlanningClick = () => {
  scrollToSection('planning');
};

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

</script>

<template>
  <div class="stats-grid grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Guests Card -->
    <div
      class="stat-card bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
      @click="handleGuestsClick"
    >
      <template v-if="rsvpData.total > 0">
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-purple-100 rounded-lg">
            <Users class="w-6 h-6 text-purple-600" />
          </div>
          <ArrowRight class="w-4 h-4 text-gray-400" />
        </div>

        <h3 class="text-xs font-medium text-gray-500 uppercase mb-1">
          GUESTS
        </h3>

        <div class="text-3xl font-bold text-gray-900 mb-1.5">
          {{ rsvpData.total }}
        </div>

        <div class="flex items-center gap-2 text-xs">
            <span class="text-green-600 font-medium">
              {{ rsvpData.confirmed }} Confirmed
            </span>
          <span class="text-gray-400">•</span>
          <span class="text-yellow-600 font-medium">
              {{ rsvpData.pending }} Pending
            </span>
        </div>
      </template>

      <template v-else>
        <div class="text-center py-2">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-purple-50 rounded-full mb-2">
            <Users class="w-6 h-6 text-purple-300" />
          </div>

          <h3 class="text-sm font-bold text-gray-900 mb-1">
            No Guests Yet
          </h3>

          <p class="text-xs text-gray-600 mb-2">
            Build your guest list
          </p>

          <button
            @click.stop="router.push('/guests')"
            class="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold inline-flex items-center justify-center gap-1.5"
          >
            <UserPlus class="w-4 h-4" />
            Add First Guest
          </button>
        </div>
      </template>
    </div>

    <!-- Planning Card -->
    <div
      id="planning"
      class="stat-card bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
      @click="handlePlanningClick"
    >
      <template v-if="planningData.progress > 0">
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-green-100 rounded-lg">
            <CheckSquare class="w-6 h-6 text-green-600" />
          </div>
          <ArrowRight class="w-4 h-4 text-gray-400" />
        </div>

        <h3 class="text-xs font-medium text-gray-500 uppercase mb-1">
          PLANNING PROGRESS
        </h3>

        <div class="text-3xl font-bold text-gray-900 mb-2">
          {{ planningData.progress }}%
        </div>

        <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            class="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
            :style="{ width: `${planningData.progress}%` }"
          ></div>
        </div>
      </template>

      <template v-else>
        <div class="text-center py-2">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-full mb-2">
            <CheckSquare class="w-6 h-6 text-green-300" />
          </div>

          <h3 class="text-sm font-bold text-gray-900 mb-1">
            Planning Not Started
          </h3>

          <p class="text-xs text-gray-600 mb-2">
            Stay organized
          </p>

          <button
            @click.stop="scrollToSection('planning')"
            class="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold inline-flex items-center justify-center gap-1.5"
          >
            <Rocket class="w-4 h-4" />
            Get Started
          </button>
        </div>
      </template>
    </div>

    <!-- Budget Card -->
    <div
      id="budget"
      class="stat-card bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-pink-300 hover:shadow-md transition-all cursor-pointer"
      @click="handleBudgetClick"
    >
      <template v-if="budgetData.total > 0">
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-pink-100 rounded-lg">
            <DollarSign class="w-6 h-6 text-pink-600" />
          </div>
          <ArrowRight class="w-4 h-4 text-gray-400" />
        </div>

        <h3 class="text-xs font-medium text-gray-500 uppercase mb-1">
          BUDGET
        </h3>

        <div class="text-3xl font-bold text-gray-900 mb-1.5">
          ${{ budgetData.paid.toLocaleString() }}
        </div>

        <p class="text-xs text-gray-600">
          of ${{ budgetData.total.toLocaleString() }} •
          <span :class="budgetData.progress > 90 ? 'text-red-600 font-semibold' : 'text-gray-700 font-medium'">
              {{ budgetData.progress }}% used
            </span>
        </p>
      </template>

      <template v-else>
        <div class="text-center py-2">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-pink-50 rounded-full mb-2">
            <DollarSign class="w-6 h-6 text-pink-300" />
          </div>

          <h3 class="text-sm font-bold text-gray-900 mb-1">
            No Budget Set
          </h3>

          <p class="text-xs text-gray-600 mb-2">
            Track expenses
          </p>

          <button
            @click.stop="router.push('/budget')"
            class="w-full px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-semibold inline-flex items-center justify-center gap-1.5"
          >
            <Plus class="w-4 h-4" />
            Create Budget
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>

</style>
