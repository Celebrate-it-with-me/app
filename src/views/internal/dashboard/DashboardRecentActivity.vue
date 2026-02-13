<script setup>
import { Activity, ArrowRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useActivityStore } from '@/stores/useActivityStore'

const router = useRouter()

// Recent Activities
const recentActivities = computed(() => activityStore.activities || [])
const activityStore = useActivityStore()
</script>
<template>
  <div class="activity-section bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
        <Activity class="w-5 h-5 text-gray-600" />
        Recent Activity
      </h2>
      <button
        class="text-xs text-purple-600 hover:text-purple-700 font-bold inline-flex items-center gap-1 group"
        @click="router.push('/activity')"
      >
        See All
        <ArrowRight class="w-3 h-3 transition-transform group-hover:translate-x-1" />
      </button>
    </div>

    <div v-if="recentActivities.length > 0" class="space-y-3">
      <div
        v-for="(activity, index) in recentActivities.slice(0, 3)"
        :key="index"
        class="activity-item flex items-start gap-2 relative"
      >
        <div
          v-if="index !== 2 && recentActivities.length > 1"
          class="absolute left-1 top-4 bottom-[-16px] w-0.5 bg-gray-100"
        ></div>
        <div
          class="w-2 h-2 rounded-full bg-purple-500 mt-1 flex-shrink-0 ring-2 ring-purple-50"
        ></div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-900 leading-relaxed truncate" v-html="activity.message"></p>
          <span class="text-gray-400 text-[10px] font-medium mt-0.5 block">{{
            activity.createdAt
          }}</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="text-center py-4 text-gray-500 border-2 border-dashed border-gray-100 rounded-lg"
    >
      <Activity class="w-8 h-8 mx-auto mb-2 text-gray-200" />
      <p class="text-xs font-medium">No recent activity</p>
    </div>
  </div>
</template>
