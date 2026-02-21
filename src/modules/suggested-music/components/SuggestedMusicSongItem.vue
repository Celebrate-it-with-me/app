<script setup>
// All comments in code are in English, as requested.

import CBadge from '@/components/UI/badges/CBadge.vue'
import { ArrowDown, ArrowUp, Eye, Flame, Play, Trash2, User, Users } from 'lucide-vue-next'

const props = defineProps({
  song: { type: Object, required: true },
  isTopVoted: { type: Function, required: true },
  getNetScore: { type: Function, required: true }
})

const emit = defineEmits(['play', 'details', 'remove'])

const netVariant = score => {
  if (score > 0) return 'success'
  if (score < 0) return 'error'
  return 'gray'
}
</script>

<template>
  <div class="p-5">
    <div class="flex items-start gap-4">
      <!-- Album Art -->
      <div class="flex-shrink-0">
        <img
          :src="props.song.thumbnailUrl || 'https://via.placeholder.com/80'"
          alt="Album Art"
          class="w-20 h-20 rounded-lg object-cover shadow-md"
        />
      </div>

      <!-- Song Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {{ props.song.title }}
          </h3>

          <CBadge
            v-if="props.isTopVoted(props.song)"
            variant="error"
            class="flex items-center gap-1 flex-shrink-0"
          >
            <Flame class="w-3 h-3" />
            Top Voted
          </CBadge>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
          {{ props.song.artist }} • {{ props.song.album }}
        </p>

        <div class="flex items-center gap-2 mb-3">
          <User class="w-4 h-4 text-gray-400" />
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Suggested by
            <span class="font-medium text-gray-900 dark:text-white">
              {{ props.song.suggestedBy?.name || 'Unknown' }}
            </span>
          </span>

          <CBadge v-if="props.song.suggestedBy?.isOrganizer" variant="primary" size="sm">
            Organizer
          </CBadge>
          <CBadge v-else variant="secondary" size="sm">
            <Users class="w-3 h-3 mr-1" />
            Guest
          </CBadge>
        </div>

        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-1.5">
            <div class="p-1 bg-green-50 dark:bg-green-900/20 rounded">
              <ArrowUp class="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ props.song.votes?.up || 0 }}
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            <div class="p-1 bg-red-50 dark:bg-red-900/20 rounded">
              <ArrowDown class="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ props.song.votes?.down || 0 }}
            </span>
          </div>

          <CBadge :variant="netVariant(props.getNetScore(props.song))" class="font-semibold">
            Net:
            {{ props.getNetScore(props.song) > 0 ? '+' : '' }}{{ props.getNetScore(props.song) }}
          </CBadge>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <button
          class="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-400 dark:hover:text-purple-400 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
          title="Play song"
          @click="emit('play', props.song)"
        >
          <Play class="w-5 h-5" />
        </button>

        <button
          class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
          title="View vote details"
          @click="emit('details', props.song)"
        >
          <Eye class="w-5 h-5" />
        </button>

        <button
          class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Remove song"
          @click="emit('remove', props.song.id)"
        >
          <Trash2 class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
