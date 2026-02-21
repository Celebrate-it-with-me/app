<script setup>
import { ref } from 'vue'
import debounce from 'lodash.debounce'
import SongsService from '@/modules/suggested-music/services/SongsService'
import { useNotificationStore } from '@/stores/useNotificationStore'
import SpotifyService from '@/modules/suggested-music/services/SpotifyService'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'

const emit = defineEmits(['update:List'])
const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const notification = useNotificationStore()
const searchQuery = ref('')
const suggestions = ref([])
let skipFetch = false
const templateStore = useTemplateStore()

const selectSuggestion = song => {
  skipFetch = true

  saveSelectedSong(song)
  searchQuery.value = ''
  suggestions.value = []

  setTimeout(() => {
    skipFetch = false
  }, 300)
}

const saveSelectedSong = async song => {
  if (props.mode === 'creator') return

  try {
    const response = await SongsService.createPublic({
      eventId: props.event?.id ?? 0,
      platformId: song.platformId,
      title: song.title,
      artist: song.artist,
      album: song.album,
      thumbnailUrl: song.thumbnailUrl,
      accessCode: templateStore.guest.accessCode ?? ''
    })

    if (response.status >= 200 && response.status < 300) {
      emit('update:List')
      notification.addNotification({
        message: 'Song added successfully'
      })
    } else {
      notification.addNotification({
        type: 'error',
        message: 'Oops something went wrong!'
      })
    }
  } catch (e) {
    console.log(e)
  }
}

const fetchSuggestions = debounce(async () => {
  if (searchQuery.value && !skipFetch) {
    try {
      const result = await SpotifyService.searchSongs(searchQuery.value)

      suggestions.value = result.tracks.items.map(track => ({
        platformId: track.id,
        title: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name || 'Unknown Album',
        thumbnailUrl: track.album.images[0]?.url || 'https://via.placeholder.com/48'
      }))
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      suggestions.value = []
    }
  } else {
    suggestions.value = []
  }
}, 300)
</script>

<template>
  <div class="mt-5 w-[90%] relative rounded-2xl bg-blue-50 p-5 sm:p-6 shadow-md">
    <!-- Search Input -->
    <div class="relative">
      <!-- Search Icon -->
      <div class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-4.3-4.3M10 18a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </div>

      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for a song..."
        class="w-full h-[44px] rounded-xl bg-white border border-blue-200 pl-12 pr-4 text-slate-700 placeholder:text-blue-300 shadow-sm transition focus:border-red-400 focus:ring-4 focus:ring-red-200/40 outline-none"
        @input="fetchSuggestions"
      />
    </div>

    <!-- Suggestions Dropdown -->
    <div
      v-if="suggestions.length"
      class="absolute top-full left-0 mt-3 w-full bg-white border border-blue-200 rounded-2xl shadow-xl z-50 overflow-hidden"
    >
      <ul class="max-h-[320px] overflow-y-auto p-2">
        <li
          v-for="(song, index) in suggestions"
          :key="index"
          class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition hover:bg-blue-50 active:bg-blue-100"
          @click="selectSuggestion(song)"
        >
          <img
            :src="song.thumbnailUrl"
            alt="Album Art"
            class="h-12 w-12 rounded-lg object-cover ring-1 ring-black/5"
          />

          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-800 truncate">{{ song.title }}</p>
            <p class="text-xs text-slate-500 truncate">{{ song.artist }} — {{ song.album }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped></style>
