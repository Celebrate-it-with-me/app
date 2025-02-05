<script setup>
import { computed, ref, watch } from 'vue'
import debounce from 'lodash.debounce'
import { HandThumbUpIcon } from '@heroicons/vue/16/solid'
import { HandThumbDownIcon } from '@heroicons/vue/16/solid'
import { useSongsStore } from '@/stores/useSongsStore'
import SongsService from '@/services/SongsService'
import { useEventsStore } from '@/stores/useEventsStore'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subTitle: {
    type: String,
    default: ''
  },
  mainColor: {
    type: String,
    required: true
  },
  secondaryColor: {
    type: String,
    required: true
  },
  usePreview: {
    type: Boolean,
    required: true
  },
  useVoteSystem: {
    type: Boolean,
    required: true
  },
  mode: {
    type: String,
    default: 'normal',
    validator: (value) => ['normal', 'creator'].includes(value)
  }
})

const searchQuery = ref('')
const suggestions = ref([])
const client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const client_secret = import.meta.env.VITE_SPOTIFY_CLIEN_SECRET
const songsStore = useSongsStore()
const eventStore = useEventsStore()

let skipFetch = false

const mainColorComputed = computed(() => {
  if (!props.mainColor) {
    return {backgroundColor: 'transparent' }
  }

  return {backgroundColor: props.mainColor}
});

const secondaryColorComputed = computed(() => {
  if (!props.secondaryColor) {
    return {backgroundColor: 'transparent' }
  }

  return {backgroundColor: props.secondaryColor}
})


async function getToken() {
  const base64Credentials = btoa(`${client_id}:${client_secret}`);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: new URLSearchParams({
      'grant_type': 'client_credentials',
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + base64Credentials,
    },
  });

  return await response.json();
}

async function searchSongs(access_token, query) {
  const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + access_token },
  });

  return await response.json();
}

const fetchSuggestions = debounce(async () => {
  if (searchQuery.value && !skipFetch) {
    try {
      const { access_token } = await getToken();
      const result = await searchSongs(access_token, searchQuery.value);

      suggestions.value = result.tracks.items.map((track) => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map((artist) => artist.name).join(', '),
        album: track.album.name || 'Unknown Album',
        thumbnailUrl: track.album.images[0]?.url || 'https://via.placeholder.com/48',
      }));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      suggestions.value = [];
    }
  } else {
    suggestions.value = [];
  }

}, 300)

const selectSuggestion = (song) => {
  skipFetch = true

  saveSelectedSong(song)
  searchQuery.value = ''
  suggestions.value = []

  setTimeout(() => {
    skipFetch = false
  }, 300)
}

const removeSong = (song) => {
  songsStore.removeSong(song.id)
}

const saveSelectedSong = async (song) => {
  songsStore.addSong(song)
  if (props.mode === 'creator') return;

  try {
    const response = await SongsService.create({
      eventId: eventStore?.currentEvent?.id ?? 0,
      spotifyId: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      thumbnailUrl: song.thumbnailUrl,
    })

    if (response.status >= 200 && response.status < 300) {
      console.log('success', response)
    } else {
      console.log('error', response)
    }

  } catch (e) {
    console.log(e)
  }
}

watch(searchQuery, () => fetchSuggestions(), { immediate: true })
</script>

<template>
  <div
    class="event-handle w-[70%] rounded-lg border-4 border-gray-900 dark:border-gray-800 flex flex-col items-center"
  >
    <h1 class="text-2xl font-semibold mt-5">{{ title }}</h1>
    <h4 class="text-md font-extralight">{{ subTitle }}</h4>
    <div
      :class="`text-white mt-5 p-6 rounded-lg shadow-md w-[90%] relative`"
      :style="mainColorComputed"
    >
      <div class="relative">
        <input
          v-model="searchQuery"
          @input="fetchSuggestions"
          type="text"
          class="w-full text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 input-control w-full block focus:outline-none h-[40px]"
          :style="secondaryColorComputed"
          placeholder="Search for a song..."
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
            <img
              :src="song.thumbnailUrl"
              alt="Album Art"
              class="w-12 h-12 rounded-lg object-cover"
            />

            <!-- Song details -->
            <div class="ml-4 flex flex-col justify-end items-end">
              <p class="text-sm font-medium text-white">{{ song.title }}</p>
              <p class="text-sm text-gray-400">{{ song.artist }} - {{ song.album }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div v-if="songsStore.selectedSongs.length > 0" class="mt-2 w-[90%]">
      <ul>
        <li
          v-for="(song, index) in songsStore.selectedSongs"
          :key="index"
          class="p-4 rounded-md flex justify-between items-center mt-2 space-x-6 transition hover:bg-gray-700"
          :style="mainColorComputed"
        >
          <template
            v-if="!usePreview"
          >
            <img
              :src="song.thumbnailUrl || 'https://via.placeholder.com/64'"
              alt="Album Art"
              class="w-16 h-16 rounded-md object-cover"
            />

            <div class="flex-1">
              <h3 class="text-md font-medium text-white">{{ song.title }}</h3>
              <p class="text-sm text-gray-400">
                {{ song.artist }} <span v-if="song.album">- {{ song.album }}</span>
              </p>
            </div>
          </template>

          <div class="w-[450px]"
            v-if="usePreview"
          >
            <iframe
              v-if="song.id"
              :src="`https://open.spotify.com/embed/track/${song.id}`"
              width="100%"
              height="80"
              class="rounded-md"
              allowtransparency="true"
              allow="encrypted-media"
            ></iframe>
            <p v-else class="text-sm text-gray-500">No Spotify Preview Available</p>
          </div>

          <!-- Voting Buttons -->
          <div
            v-if="useVoteSystem"
            class="flex items-center space-x-4">
            <button @click="voteSong(song, 'up')" class="rounded-full">
              <HandThumbUpIcon class="h-5 w-5 text-white hover:text-green-500" />
            </button>
            <button @click="voteSong(song, 'down')" class="rounded-full">
              <HandThumbDownIcon class="h-5 w-5 text-white hover:text-red-500" />
            </button>
          </div>

          <button
            @click="removeSong(song)"
            class="rounded-full bg-transparent text-red-500 hover:text-red-700"
            title="Remove song"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped></style>
