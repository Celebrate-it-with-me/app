<script setup>
// All comments in code are in English, as requested.

import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { Search } from 'lucide-vue-next'

const props = defineProps({
  loading: { type: Boolean, default: false },

  // Search state
  searchQuery: { type: String, default: '' },
  searchResults: { type: Array, default: () => [] }
})

const emit = defineEmits([
  // v-model:searchQuery support
  'update:searchQuery',

  // actions
  'search', // when user types
  'add' // payload: song object from search results
])

const onInput = e => {
  emit('update:searchQuery', e.target.value)
  emit('search')
}

const onAdd = song => emit('add', song)
</script>

<template>
  <CCard class="mb-6">
    <div class="p-6">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <Search class="w-5 h-5 mr-2 text-primary-600" />
        Search & Add Songs
      </h2>

      <div class="relative mb-6">
        <input
          :value="props.searchQuery"
          type="text"
          :disabled="props.loading"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
          placeholder="Search for songs on Spotify..."
          @input="onInput"
        />
      </div>

      <div v-if="props.searchResults.length > 0" class="mt-4 space-y-4 max-h-80 overflow-y-auto">
        <div
          v-for="(song, index) in props.searchResults"
          :key="song.platformId || index"
          class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center space-x-3 min-w-0">
              <img
                :src="song.thumbnailUrl"
                alt="Album Art"
                class="w-12 h-12 rounded-md object-cover flex-shrink-0"
              />
              <div class="min-w-0">
                <h3 class="font-medium text-gray-900 dark:text-white truncate">
                  {{ song.title }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {{ song.artist }} - {{ song.album }}
                </p>
              </div>
            </div>

            <CButton :disabled="props.loading" variant="primary" size="sm" @click="onAdd(song)">
              Add
            </CButton>
          </div>
        </div>
      </div>

      <div v-else class="text-sm text-gray-500 dark:text-gray-400">
        <span v-if="props.searchQuery.trim()">No results yet. Keep typing…</span>
        <span v-else>Type a song, artist, or album to search Spotify.</span>
      </div>
    </div>
  </CCard>
</template>
