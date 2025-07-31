<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSuggestedMusicStore } from '@/stores/useSuggestedMusicStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useUserStore } from '@/stores/useUserStore'
import { Music, Search, Trash2, User, Users, PlayCircle, PauseCircle } from 'lucide-vue-next'
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CTag from '@/components/UI/tags/CTag.vue'
import CPageLoaderV2 from '@/components/UI/loading/CPageLoaderV2.vue'
import SpotifyService from '@/services/SpotifyService'
import SongsService from '@/services/SongsService'
import debounce from 'lodash.debounce'

const suggestedMusicStore = useSuggestedMusicStore()
const notificationStore = useNotificationStore()
const userStore = useUserStore()
const loading = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const filterType = ref('all') // 'all', 'admin', 'guest'
const showPreviews = ref(true) // Always show play buttons for previews
const currentlyPlayingSong = ref(null) // Track which song is currently playing
const audio = ref(null) // Audio element reference

// Get songs on mount
onMounted(async () => {
  await getSuggestedSongs()
})

// Get suggested songs from the API
const getSuggestedSongs = async () => {
  try {
    loading.value = true
    const response = await suggestedMusicStore.getSuggestedSongs(userStore.currentEventId)

    if (response.status === 200) {
      suggestedMusicStore.selectedSongs = response?.data?.data ?? []
      notificationStore.addNotification({
        type: 'success',
        message: 'Suggested music loaded successfully!'
      })
    } else {
      notificationStore.addNotification({
        type: 'error',
        message: 'Failed to load suggested music'
      })
    }
  } catch (error) {
    console.error(error)
    notificationStore.addNotification({
      type: 'error',
      message: 'An error occurred while loading suggested music'
    })
  } finally {
    loading.value = false
  }
}

// Search for songs using Spotify API (mocked for now)
const searchSongs = debounce(async () => {
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }

  try {
    const result = await SpotifyService.searchSongs(searchQuery.value)
    searchResults.value = result.tracks.items.map(track => ({
      platformId: track.id,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name || 'Unknown Album',
      thumbnailUrl: track.album.images[0]?.url || 'https://via.placeholder.com/48',
      previewUrl: track.preview_url || null
    }))
  } catch (error) {
    console.error('Error searching songs:', error)
    searchResults.value = []
    notificationStore.addNotification({
      type: 'error',
      message: 'Failed to search for songs'
    })
  }
}, 300)

// Add a song to the suggested songs list
const addSong = async song => {
  try {
    const response = await suggestedMusicStore.addNewSong({
      eventId: userStore.currentEventId,
      platformId: song.platformId,
      title: song.title,
      artist: song.artist,
      album: song.album,
      thumbnailUrl: song.thumbnailUrl,
      previewUrl: song.previewUrl,
      accessCode: 'organizer'
    })

    if (response.status >= 200 && response.status < 300) {
      suggestedMusicStore.addSong(response?.data?.data ?? {})
      notificationStore.addNotification({
        message: 'Song added successfully'
      })
      searchQuery.value = ''
      searchResults.value = []
    } else {
      notificationStore.addNotification({
        type: 'error',
        message: 'Failed to add song'
      })
    }
  } catch (error) {
    console.error('Error adding song:', error)
    notificationStore.addNotification({
      type: 'error',
      message: 'An error occurred while adding the song'
    })
  }
}

// Remove a song from the suggested songs list
const removeSong = async songId => {
  try {
    const response = await SongsService.deleteSong(userStore.currentEventId, songId)

    if (response.status === 200) {
      suggestedMusicStore.removeSong(songId)
      notificationStore.addNotification({
        message: 'Song removed successfully'
      })
    } else {
      notificationStore.addNotification({
        type: 'error',
        message: 'Failed to remove song'
      })
    }
  } catch (error) {
    console.error('Error removing song:', error)
    notificationStore.addNotification({
      type: 'error',
      message: 'An error occurred while removing the song'
    })
  }
}

// Filter songs based on the selected filter type
const filteredSongs = computed(() => {
  if (filterType.value === 'all') {
    return suggestedMusicStore.selectedSongs
  } else if (filterType.value === 'admin') {
    return suggestedMusicStore.selectedSongs.filter(song => song.accessCode === 'organizer')
  } else if (filterType.value === 'guest') {
    return suggestedMusicStore.selectedSongs.filter(song => song.accessCode !== 'organizer')
  }
  return suggestedMusicStore.selectedSongs
})

// Check if a song was suggested by a guest
const isSuggestedByGuest = song => {
  return song.accessCode !== 'organizer'
}

// Play or pause a song preview
const togglePlayPreview = song => {
  // If we're already playing this song, stop it
  if (currentlyPlayingSong.value === song.platformId) {
    stopPreview()
    return
  }

  // Stop any currently playing song
  stopPreview()

  // Start playing the new song
  playPreview(song)
}

// Play a song preview
const playPreview = song => {
  // Only play if we have a preview URL
  if (!song.previewUrl) return

  // Create a new audio element if we don't have one
  if (!audio.value) {
    audio.value = new Audio()

    // Add event listener for when the song ends
    audio.value.addEventListener('ended', () => {
      currentlyPlayingSong.value = null
    })
  }

  // Set the source to the preview URL
  // For demonstration purposes, we're using a mock URL since we don't have actual preview URLs
  // In a real implementation, you would use song.previewUrl
  // This is just a placeholder and won't actually play audio
  audio.value.src = song.previewUrl || `https://p.scdn.co/mp3-preview/${song.platformId}`

  // Play the audio
  audio.value.play().catch(error => {
    console.error('Error playing audio:', error)
    currentlyPlayingSong.value = null
  })

  // Update the currently playing song
  currentlyPlayingSong.value = song.platformId
}

// Stop the currently playing preview
const stopPreview = () => {
  if (audio.value && !audio.value.paused) {
    audio.value.pause()
    audio.value.currentTime = 0
  }
  currentlyPlayingSong.value = null
}

// Check if a song is currently playing
const isPlaying = song => {
  return currentlyPlayingSong.value === song.platformId
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
        <Music class="w-8 h-8 mr-3 text-primary-600" />
        Suggested Music
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">Manage music suggestions for your event</p>
    </div>

    <!-- Loading State -->
    <CPageLoaderV2 v-if="loading"></CPageLoaderV2>

    <template v-else>
      <!-- Search & Add Section -->
      <CCard class="mb-6">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Search class="w-5 h-5 mr-2 text-primary-600" />
            Search & Add Songs
          </h2>

          <!-- Search Input -->
          <div class="relative mb-6">
            <input
              v-model="searchQuery"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              placeholder="Search for songs on Spotify..."
              @input="searchSongs"
            />
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              <Music class="w-4 h-4 inline-block mr-1" />
              Click the play button on any song to preview it.
            </p>
          </div>

          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="mt-4 space-y-4 max-h-80 overflow-y-auto">
            <div
              v-for="(song, index) in searchResults"
              :key="index"
              class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="relative">
                    <img
                      :src="song.thumbnailUrl"
                      alt="Album Art"
                      class="w-12 h-12 rounded-md object-cover"
                    />
                    <!-- Play/Pause Button -->
                    <button
                      v-if="showPreviews && song.previewUrl"
                      class="absolute inset-0 flex items-center justify-center bg-red-600 bg-opacity-90 rounded-md hover:bg-opacity-100 transition-all border-4 border-white shadow-lg animate-pulse"
                      :title="isPlaying(song) ? 'Pause preview' : 'Play preview'"
                      @click.stop="togglePlayPreview(song)"
                    >
                      <PlayCircle v-if="!isPlaying(song)" class="w-10 h-10 text-white" />
                      <PauseCircle v-else class="w-10 h-10 text-white" />
                    </button>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900 dark:text-white">{{ song.title }}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ song.artist }} - {{ song.album }}
                    </p>
                  </div>
                </div>
                <CButton variant="primary" size="sm" @click="addSong(song)">Add</CButton>
              </div>
            </div>
          </div>
        </div>
      </CCard>

      <!-- Suggested Songs List -->
      <CCard>
        <div class="p-6">
          <div class="flex flex-wrap justify-between items-center mb-6">
            <div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                <Music class="w-5 h-5 mr-2 text-primary-600" />
                Suggested Songs
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <Music class="w-4 h-4 inline-block mr-1" />
                Click the play button on any song to preview it.
              </p>
            </div>

            <!-- Filter Buttons -->
            <div class="flex flex-wrap space-x-2 mt-2 sm:mt-0">
              <CButton
                :variant="filterType === 'all' ? 'primary' : 'outline'"
                size="sm"
                @click="filterType = 'all'"
              >
                All Songs
              </CButton>
              <CButton
                :variant="filterType === 'admin' ? 'primary' : 'outline'"
                size="sm"
                @click="filterType = 'admin'"
              >
                <User class="w-4 h-4 mr-1" />
                Admin Added
              </CButton>
              <CButton
                :variant="filterType === 'guest' ? 'primary' : 'outline'"
                size="sm"
                @click="filterType = 'guest'"
              >
                <Users class="w-4 h-4 mr-1" />
                Guest Suggested
              </CButton>
            </div>
          </div>

          <!-- No Songs Message -->
          <div
            v-if="filteredSongs.length === 0"
            class="text-center py-8 text-gray-500 dark:text-gray-400"
          >
            <Music class="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p class="text-lg">No songs found</p>
            <p class="text-sm mt-1">
              {{
                filterType === 'all' ? 'Add songs using the search above' : 'Try a different filter'
              }}
            </p>
          </div>

          <!-- Songs Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="song in filteredSongs"
              :key="song.id"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition"
            >
              <div class="p-4">
                <div class="flex items-start space-x-3">
                  <div class="relative flex-shrink-0">
                    <img
                      :src="song.thumbnailUrl || 'https://via.placeholder.com/64'"
                      alt="Album Art"
                      class="w-16 h-16 rounded-md object-cover"
                    />
                    <!-- Play/Pause Button -->
                    <button
                      v-if="showPreviews && song.previewUrl"
                      class="absolute inset-0 flex items-center justify-center bg-red-600 bg-opacity-90 rounded-md hover:bg-opacity-100 transition-all border-4 border-white shadow-lg animate-pulse"
                      :title="isPlaying(song) ? 'Pause preview' : 'Play preview'"
                      @click.stop="togglePlayPreview(song)"
                    >
                      <PlayCircle v-if="!isPlaying(song)" class="w-12 h-12 text-white" />
                      <PauseCircle v-else class="w-12 h-12 text-white" />
                    </button>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <h3 class="font-medium text-gray-900 dark:text-white truncate">
                        {{ song.title }}
                      </h3>
                      <button
                        class="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                        title="Remove song"
                        @click="removeSong(song.id)"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {{ song.artist }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {{ song.album }}
                    </p>
                    <div class="mt-2">
                      <CTag
                        v-if="isSuggestedByGuest(song)"
                        variant="warning"
                        size="sm"
                        class="text-xs"
                      >
                        Guest Suggested
                      </CTag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CCard>
    </template>
  </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>
