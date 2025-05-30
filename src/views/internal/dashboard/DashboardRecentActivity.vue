<script setup>
import {
  Activity,
  UserRound,
  Image,
  Music2,
  Eye,
  PartyPopper,
  UserPlus,
  Trash2,
  Utensils,
  Edit,
  PlusCircle,
  AlertCircle,
  Loader2
} from 'lucide-vue-next'

import CButton from '@/components/UI/buttons/CButton.vue'
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import { useActivityStore } from '@/stores/useActivityStore'
import { useUserStore } from '@/stores/useUserStore'

// Store initialization
const activityStore = useActivityStore()
const userStore = useUserStore()

// Component state
const hasError = ref(false)
const errorMessage = ref('')
const intervalId = ref(null)

// Computed properties
const activities = computed(() => activityStore.activities)
const isLoading = computed(() => activityStore.isLoading)

// Map icon names from backend to actual Lucide components
const iconMap = {
  'user-round': UserRound,
  'image': Image,
  'edit': Edit,
  'plus-circle': PlusCircle,
  'music': Music2,
  'activity': Activity,
  'eye': Eye,
  'party-popper': PartyPopper,
  'user-plus': UserPlus,
  'trash-2': Trash2,
  'utensils': Utensils
}

/**
 * Get the icon component based on the icon name
 * @param {string} iconName - The name of the icon
 * @returns {Component} - The Lucide icon component
 */
const getIconComponent = (iconName) => iconMap[iconName] ?? Activity

/**
 * Load activities from the API
 */
const loadActivities = async () => {
  // Don't fetch if no active event
  if (!userStore.activeEvent) return

  hasError.value = false

  try {
    const response = await activityStore.loadDashboardActivities()

    if (response.status !== 200) {
      hasError.value = true
      errorMessage.value = response.message || 'Failed to load activities'
      console.error('Error loading activities:', response)
    }
  } catch (error) {
    hasError.value = true
    errorMessage.value = error.message || 'An unexpected error occurred'
    console.error('Error loading activities:', error)
  }
}

/**
 * Navigate to the activity log page
 */
const goToActivityLog = () => {
  // router.push({ name: 'activity-log' }) // enable when route is ready
}

onMounted(async () => {
  await loadActivities()

  intervalId.value = setInterval(async () => {
    await loadActivities()
  }, 60000)
})

onBeforeUnmount(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
})
</script>

<template>
  <section class="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 border border-gray-100 overflow-hidden">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2 text-indigo-600 font-semibold text-sm bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full">
        <Activity class="w-4 h-4" />
        Recent Activity
      </div>
      <CButton
        variant="outline"
        size="sm"
        class="rounded-full flex items-center gap-1"
        @click="goToActivityLog"
      >
        <Eye class="w-4 h-4" />
        See All
      </CButton>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading && activities.length === 0" class="py-8 flex flex-col items-center justify-center">
      <Loader2 class="w-8 h-8 text-indigo-500 animate-spin mb-2" />
      <p class="text-gray-500 text-sm">Loading activities...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="py-8 flex flex-col items-center justify-center">
      <AlertCircle class="w-8 h-8 text-red-500 mb-2" />
      <p class="text-red-500 text-sm font-medium">{{ errorMessage }}</p>
      <button
        @click="loadActivities"
        class="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
      >
        Try again
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="activities.length === 0" class="py-8 flex flex-col items-center justify-center">
      <Activity class="w-8 h-8 text-gray-400 mb-2" />
      <p class="text-gray-500 text-sm">No recent activities</p>
    </div>

    <!-- Timeline -->
    <ul v-else class="space-y-4 text-sm min-h-[200px]">
      <li
        v-for="activity in activities"
        :key="activity.id"
        class="flex items-start gap-3"
      >
        <component
          :is="getIconComponent(activity.icon)"
          class="w-4 h-4 mt-0.5"
          :class="`text-${activity.color}-500`"
        />
        <div>
          <span v-html="activity.message" />
          <p class="text-gray-500 text-xs mt-0.5">
            {{ activity.createdAt }}
          </p>
        </div>
      </li>

      <!-- Loading indicator when refreshing with existing data -->
      <div v-if="isLoading" class="flex items-center justify-center pt-2">
        <Loader2 class="w-4 h-4 text-indigo-500 animate-spin" />
        <span class="ml-2 text-xs text-gray-500">Refreshing...</span>
      </div>
    </ul>
  </section>
</template>
