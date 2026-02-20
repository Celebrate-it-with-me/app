<script setup>
// All comments in code are in English, as requested.

import CCard from '@/components/UI/cards/CCard.vue'
import { Music } from 'lucide-vue-next'
import SuggestedMusicListToolbar from '@/modules/suggested-music/components/SuggestedMusicListToolbar.vue'
import SuggestedMusicSongItem from '@/modules/suggested-music/components/SuggestedMusicSongItem.vue'

const props = defineProps({
  hasSongs: { type: Boolean, default: false },
  songs: { type: Array, default: () => [] },

  localSearch: { type: String, default: '' },
  sortBy: { type: String, default: 'recent' },
  filterBy: { type: String, default: 'all' },

  isTopVoted: { type: Function, required: true },
  getNetScore: { type: Function, required: true }
})

const emit = defineEmits([
  'update:localSearch',
  'update:sortBy',
  'update:filterBy',
  'play',
  'details',
  'remove'
])
</script>

<template>
  <CCard>
    <div class="p-6">
      <div class="flex flex-wrap justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
          <Music class="w-5 h-5 mr-2 text-primary-600" />
          Suggested Songs
          <span class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({{ props.songs.length }})
          </span>
        </h2>
      </div>

      <SuggestedMusicListToolbar
        :local-search="props.localSearch"
        :sort-by="props.sortBy"
        :filter-by="props.filterBy"
        @update:local-search="val => emit('update:localSearch', val)"
        @update:sort-by="val => emit('update:sortBy', val)"
        @update:filter-by="val => emit('update:filterBy', val)"
      />

      <div
        v-if="props.songs.length === 0"
        class="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        <Music class="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p class="text-lg">No songs found</p>
        <p class="text-sm mt-1">
          {{
            !props.hasSongs
              ? 'Add songs using the search above'
              : 'Try adjusting your filters or search'
          }}
        </p>
      </div>

      <div v-else class="space-y-4">
        <CCard
          v-for="song in props.songs"
          :key="song.id"
          class="hover:shadow-lg transition-all duration-300"
        >
          <SuggestedMusicSongItem
            :song="song"
            :is-top-voted="props.isTopVoted"
            :get-net-score="props.getNetScore"
            @play="emit('play', $event)"
            @details="emit('details', $event)"
            @remove="emit('remove', $event)"
          />
        </CCard>
      </div>
    </div>
  </CCard>
</template>
