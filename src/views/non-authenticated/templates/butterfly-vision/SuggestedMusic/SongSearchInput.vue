<script setup>
import { computed, ref } from 'vue'
import debounce from 'lodash.debounce'
import SongsService from '@/services/SongsService'
import { useNotificationStore } from '@/stores/useNotificationStore'
import SpotifyService from '@/services/SpotifyService'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'

const emit = defineEmits(['update:List'])
const props = defineProps({
  mainColor: {
    type: String,
    required: true
  },
  secondaryColor: {
    type: String,
    required: true
  },
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

const mainColorComputed = computed(() => {
  if (!props.mainColor) {
    return { backgroundColor: 'transparent' }
  }

  return { backgroundColor: props.mainColor }
})

const secondaryColorComputed = computed(() => {
  if (!props.secondaryColor) {
    return { backgroundColor: 'transparent' }
  }

  return { backgroundColor: props.secondaryColor }
})

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
    const response = await SongsService.create({
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
  <div
    :class="`text-white mt-5 p-6 rounded-lg shadow-md w-[90%] relative`"
    :style="mainColorComputed"
  >
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        class="w-full text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 input-control w-full block focus:outline-none h-[40px]"
        :style="secondaryColorComputed"
        placeholder="Search for a song..."
        @input="fetchSuggestions"
      />
    </div>

    <div
      v-if="suggestions.length"
      class="absolute top-full left-0 mt-2 p-6 w-full rounded-lg divide-y divide-gray-600 shadow-md overflow-hidden bg-gray-700 z-50"
    >
      <ul class="block">
        <li
          v-for="(song, index) in suggestions"
          :key="index"
          class="p-2 flex justify-between items-center rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer transition mt-2"
          @click="selectSuggestion(song)"
        >
          <img :src="song.thumbnailUrl" alt="Album Art" class="w-12 h-12 rounded-lg object-cover" />

          <!-- Song details -->
          <div class="ml-4 flex flex-col justify-end items-end">
            <p class="text-sm font-medium text-white">{{ song.title }}</p>
            <p class="text-sm text-gray-400">{{ song.artist }} - {{ song.album }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped></style>
