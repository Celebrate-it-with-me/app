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
  Utensils, Edit, PlusCircle
} from 'lucide-vue-next'

import CButton from '@/components/UI/buttons/CButton.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useActivityStore } from '@/stores/useActivityStore'
import { useIntervalFn } from '@vueuse/core'

const activities = ref([])
const activityStore = useActivityStore()

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

const getIconComponent = (iconName) => iconMap[iconName] ?? Activity

const loadActivities = async () => {
  const response = await activityStore.loadDashboardActivities()
  if (response.status === 200) {
    activities.value = response.data?.data ?? []
  } else {
    console.error('Error loading activities:', response)
  }
}

// Auto-refresh every 2 minutes
const { pause, resume } = useIntervalFn(loadActivities, 120000)

onMounted(async () => {
  await loadActivities()
  resume()
})

onBeforeUnmount(() => {
  pause()
})

const goToActivityLog = () => {
  // router.push({ name: 'activity-log' }) // enable when route is ready
}
</script>

<template>
  <section class="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 border border-gray-100 mt-6">
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

    <!-- Timeline -->
    <ul class="space-y-4 text-sm">
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
    </ul>
  </section>
</template>
