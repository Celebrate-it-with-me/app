<script setup>
import { ref, watch } from 'vue'
import debounce from 'lodash.debounce'
import { FaceSmileIcon } from '@heroicons/vue/16/solid'
import { FaceFrownIcon } from '@heroicons/vue/16/solid'

const searchQuery = ref('')
const suggestions = ref([])
const selectedSongs = ref([])
const client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const client_secret = import.meta.env.VITE_SPOTIFY_CLIEN_SECRET;


let skipFetch = false

const mockData = [
  { title: 'Imagine', artist: 'John Lennon', genre: 'Rock', thumbnailUrl: 'https://via.placeholder.com/48' },
  { title: 'Billie Jean', artist: 'Michael Jackson', genre: 'Pop', thumbnailUrl: 'https://via.placeholder.com/48' },
  { title: 'Hey Jude', artist: 'The Beatles', genre: 'Rock', thumbnailUrl: 'https://via.placeholder.com/48' },
  { title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock', thumbnailUrl: 'https://via.placeholder.com/48' },
  { title: 'Shake It Off', artist: 'Taylor Swift', genre: 'Pop', thumbnailUrl: 'https://via.placeholder.com/48' },
]

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
  const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
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
        genre: track.album.album_type,
        thumbnailUrl: track.album.images[0]?.url || 'https://via.placeholder.com/48',
        previewUrl: track.previewUrl || null
      }));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      suggestions.value = []; // Clear suggestions on error
    }
  } else {
    suggestions.value = []; // Clear suggestions when input is empty
  }

}, 300)

const selectSuggestion = (song) => {
  skipFetch = true

  searchQuery.value = []
  selectedSongs.value.push(song)
  suggestions.value = []

  setTimeout(() => {
    skipFetch = false
  }, 300)
}

watch(searchQuery, () => fetchSuggestions(), { immediate: true })

</script>

<template>
  <div
    class="w-full"
  >
    <div class="bg-gray-800 text-white p-6 rounded-lg shadow-md w-[50%] relative">
      <div class="relative">
        <input
          v-model="searchQuery"
          @input="fetchSuggestions"
          type="text"
          class="w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none
               focus:ring-2 focus:ring-blue-400 input-control w-full block
               focus:outline-none h-[40px]"
          placeholder="Search for a song..."
        />
      </div>

      <div
        v-if="suggestions.length"
        class="absolute top-full left-0 mt-2 w-full rounded-lg divide-y divide-gray-600 shadow-md
        overflow-hidden bg-gray-700 z-50"
      >
        <ul class="block">
          <li
            v-for="(song, index) in suggestions"
            :key="index"
            class="p-2 flex justify-between items-center rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer
                  transition mt-2"
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
              <p class="text-sm text-gray-400">
                {{ song.artist }} - {{ song.genre }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div
      v-if="selectedSongs.length > 0"
      class="w-[50%]"
    >
      <ul class="block">
        <li
          v-for="(song, index) in selectedSongs"
          :key="index"
          class="p-2 flex justify-between items-center rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer
                  transition mt-2"
        >
          <img
            v-if="!song.id"
            :src="song.thumbnailUrl"
            alt="Album Art"
            class="w-12 h-12 rounded-lg object-cover"
          />

          <!-- Song details -->
          <div class="ml-4 flex flex-col justify-end items-center"
            v-if="!song.id"
          >
            <p class="text-sm font-medium text-white">{{ song.title }}</p>
            <p class="text-sm text-gray-400">
              {{ song.artist }} - {{ song.genre }}</p>
          </div>

          <!-- Spotify Embed -->
          <div class="ml-4">
            <iframe
              v-if="song.id"
              :src="`https://open.spotify.com/embed/track/${song.id}`"
              width="400"
              height="80"
              allowtransparency="true"
              allow="encrypted-media"
            ></iframe>
            <p v-else class="text-sm text-gray-400">No Preview Available</p>
          </div>


          <div class="ml-4 flex gap-x-2">
            <FaceSmileIcon class="h-6 w-6 cursor-pointer"/>
            <FaceFrownIcon class="h-6 w-6 cursor-pointer" />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>

</style>
