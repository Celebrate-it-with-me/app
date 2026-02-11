<script setup>
import { ref } from 'vue'
import { Search, X as CloseIcon } from 'lucide-vue-next'
import debounce from 'lodash.debounce'
import SongsService from '@/services/SongsService'
import { useNotificationStore } from '@/stores/useNotificationStore'
import SpotifyService from '@/services/SpotifyService'
import { useTemplateStore } from '@/stores/useTemplateStore'

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
  <div class="mt-8 w-full max-w-4xl relative rounded-2xl bg-white/75 backdrop-blur-md p-6 border border-[#7FB9C9]/30 shadow-[0_18px_50px_-25px_rgba(7,26,42,0.45)]">
    <!-- Search Input -->
    <div class="relative">
      <!-- Search Icon -->
      <div class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#2F6F8F]">
        <Search class="h-5 w-5" />
      </div>

      <input
        v-model="searchQuery"
        type="text"
        placeholder="Busca por título o artista..."
        class="w-full h-[48px] rounded-xl bg-white border border-[#7FB9C9]/40 pl-12 pr-12 text-slate-700 placeholder:text-[#2F6F8F]/50 shadow-sm transition focus:border-[#2F6F8F] focus:ring-4 focus:ring-[#7FB9C9]/20 outline-none"
        @input="fetchSuggestions"
      />

      <!-- Clear Button -->
      <button
        v-if="searchQuery"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-[#2F6F8F] hover:text-[#123B5A] transition"
        @click="searchQuery = ''; suggestions = []"
      >
        <CloseIcon class="h-5 w-5" />
      </button>
    </div>

    <!-- Helper Text -->
    <p class="mt-2 text-xs text-[#2F6F8F] ml-1">
      Busca por título o artista. Presiona Enter para sugerir.
    </p>

    <!-- Suggestions Dropdown -->
    <div
      v-if="suggestions.length"
      class="absolute top-full left-0 mt-3 w-full bg-white/95 backdrop-blur-lg border border-[#7FB9C9]/30 rounded-2xl shadow-xl z-[100] overflow-hidden"
    >
      <ul class="max-h-[320px] overflow-y-auto p-2">
        <li
          v-for="(song, index) in suggestions"
          :key="index"
          class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition hover:bg-[#7FB9C9]/10 active:bg-[#7FB9C9]/20"
          @click="selectSuggestion(song)"
        >
          <img
            :src="song.thumbnailUrl"
            alt="Album Art"
            class="h-12 w-12 rounded-lg object-cover ring-1 ring-[#7FB9C9]/20"
          />

          <div class="min-w-0">
            <p class="text-sm font-semibold text-[#123B5A] truncate">{{ song.title }}</p>
            <p class="text-xs text-[#2F6F8F] truncate">{{ song.artist }} — {{ song.album }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped></style>
