<script setup>
// All comments in code are in English, as requested.

import CCard from '@/components/UI/cards/CCard.vue'
import { Heart, Music, TrendingUp, Users } from 'lucide-vue-next'

const props = defineProps({
  loading: { type: Boolean, default: false },
  totalSongs: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 },
  topSong: { type: Object, default: null },
  guestSuggested: { type: Number, default: 0 }
})
</script>

<template>
  <div v-if="!props.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Total Songs Card -->
    <CCard
      class="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 border-0"
    >
      <div class="p-6 text-white">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Music class="w-6 h-6" />
          </div>
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium text-purple-100">Total Songs</p>
          <p class="text-3xl font-bold">{{ props.totalSongs }}</p>
        </div>
      </div>
      <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
    </CCard>

    <!-- Total Votes Card -->
    <CCard class="relative overflow-hidden bg-gradient-to-br from-pink-500 to-pink-600 border-0">
      <div class="p-6 text-white">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Heart class="w-6 h-6" />
          </div>
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium text-pink-100">Total Votes</p>
          <p class="text-3xl font-bold">{{ props.totalVotes }}</p>
        </div>
      </div>
      <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
    </CCard>

    <!-- Top Song Card -->
    <CCard
      class="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 border-0"
    >
      <div class="p-6 text-white">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <TrendingUp class="w-6 h-6" />
          </div>
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium text-indigo-100">Top Song</p>
          <p class="text-lg font-bold truncate" :title="props.topSong?.title || 'No songs yet'">
            {{ props.topSong?.title || 'No songs yet' }}
          </p>
          <p v-if="props.topSong" class="text-xs text-indigo-200 truncate">
            {{ props.topSong.artist }}
          </p>
        </div>
      </div>
      <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
    </CCard>

    <!-- Guest Suggested Card -->
    <CCard
      class="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 border-0"
    >
      <div class="p-6 text-white">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Users class="w-6 h-6" />
          </div>
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium text-emerald-100">Guest Suggested</p>
          <p class="text-3xl font-bold">{{ props.guestSuggested }}</p>
        </div>
      </div>
      <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
    </CCard>
  </div>
</template>
