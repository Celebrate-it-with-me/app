<script setup>
import { Activity, UserRound, Image, Music2, Eye } from 'lucide-vue-next'
import CButton from '@/components/UI/buttons/CButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToActivityLog = () => {
  // router.push({ name: 'activity-log' }) // Asegúrate de tener esta ruta
}
</script>

<template>
  <section class="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 border border-gray-100 mt-6">
    <!-- Header with button -->
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
      <li class="flex items-start gap-3">
        <UserRound class="w-4 h-4 mt-0.5 text-green-500" />
        <div>
          <span><strong>Juan Pérez</strong> confirmed attendance</span>
          <p class="text-gray-500 text-xs mt-0.5">Apr 18</p>
        </div>
      </li>
      <li class="flex items-start gap-3">
        <Image class="w-4 h-4 mt-0.5 text-pink-500" />
        <div>
          <span>1 new photo uploaded</span>
          <p class="text-gray-500 text-xs mt-0.5">Apr 17</p>
        </div>
      </li>
      <li class="flex items-start gap-3">
        <Music2 class="w-4 h-4 mt-0.5 text-yellow-500" />
        <div>
          <span>1 song added to the playlist</span>
          <p class="text-gray-500 text-xs mt-0.5">Apr 16</p>
        </div>
      </li>
    </ul>
  </section>
</template>
