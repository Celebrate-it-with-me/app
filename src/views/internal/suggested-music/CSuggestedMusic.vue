<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSuggestedMusicStore } from '@/stores/useSuggestedMusicStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useUserStore } from '@/stores/useUserStore'
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CPageLoaderV2 from '@/components/UI/loading/CPageLoaderV2.vue'
import CBadge from '@/components/UI/badges/CBadge.vue'
import CModal from '@/components/UI/modals/CModal.vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'
import SpotifyService from '@/services/SpotifyService'
import SongsService from '@/services/SongsService'
import debounce from 'lodash.debounce'
import {
  Music,
  Search,
  Trash2,
  Heart,
  TrendingUp,
  Users,
  ArrowUp,
  ArrowDown,
  Flame,
  Eye,
  User,
  Filter,
  SortDesc,
  Play
} from 'lucide-vue-next'
import { useClickOutside } from '@/composables/useClickOutside'

const suggestedMusicStore = useSuggestedMusicStore()
const notificationStore = useNotificationStore()
const userStore = useUserStore()

// State
const loading = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const searchContainerRef = ref(null)

const showVoteDetailsModal = ref(false)
const selectedSongForDetails = ref(null)

const showRemoveConfirm = ref(false)
const songIdToRemove = ref(null)

// Player Modal State
const showPlayerModal = ref(false)
const selectedSongForPlayer = ref(null)

// Filter and Sort
const localSearch = ref('')
const sortBy = ref('recent')
const filterBy = ref('all')

// Get songs on mount
onMounted(async () => {
  await getSuggestedSongs()
})

useClickOutside(searchContainerRef, () => {
  searchResults.value = []
})

// Stats Computeds
const totalSongs = computed(() => {
  return suggestedMusicStore.selectedSongs.length
})

const totalVotes = computed(() => {
  return suggestedMusicStore.selectedSongs.reduce((total, song) => {
    const upVotes = song.votes?.up || 0
    const downVotes = song.votes?.down || 0
    return total + upVotes + downVotes
  }, 0)
})

const topSong = computed(() => {
  if (suggestedMusicStore.selectedSongs.length === 0) return null

  return suggestedMusicStore.selectedSongs.reduce((top, song) => {
    const currentNetScore = (song.votes?.up || 0) - (song.votes?.down || 0)
    const topNetScore = (top.votes?.up || 0) - (top.votes?.down || 0)
    return currentNetScore > topNetScore ? song : top
  })
})

const guestSuggested = computed(() => {
  return suggestedMusicStore.selectedSongs.filter(song => {
    return song.suggestedBy?.isOrganizer === false
  }).length
})

// Filtered and sorted songs
const filteredAndSortedSongs = computed(() => {
  let songs = [...suggestedMusicStore.selectedSongs]

  // Apply local search
  if (localSearch.value.trim()) {
    const search = localSearch.value.toLowerCase()
    songs = songs.filter(song =>
      song.title.toLowerCase().includes(search) ||
      song.artist.toLowerCase().includes(search) ||
      song.album.toLowerCase().includes(search)
    )
  }

  // Apply filters
  if (filterBy.value === 'admin') {
    songs = songs.filter(song => song.suggestedBy?.isOrganizer === true)
  } else if (filterBy.value === 'guest') {
    songs = songs.filter(song => song.suggestedBy?.isOrganizer === false)
  } else if (filterBy.value === 'topVoted') {
    songs = songs.filter(song => isTopVoted(song))
  }

  // Apply sorting
  if (sortBy.value === 'popular') {
    songs.sort((a, b) => getNetScore(b) - getNetScore(a))
  } else if (sortBy.value === 'mostVoted') {
    songs.sort((a, b) => {
      const totalA = (a.votes?.up || 0) + (a.votes?.down || 0)
      const totalB = (b.votes?.up || 0) + (b.votes?.down || 0)
      return totalB - totalA
    })
  } else if (sortBy.value === 'alphabetical') {
    songs.sort((a, b) => a.title.localeCompare(b.title))
  }

  return songs
})

// Get suggested songs from the API
const getSuggestedSongs = async () => {
  try {
    loading.value = true
    const response = await suggestedMusicStore.getSuggestedSongs(userStore.activeEvent)

    if (response.status === 200) {
      suggestedMusicStore.selectedSongs = response?.data?.data ?? []
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

// Search for songs using Spotify API
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
      eventId: userStore.activeEvent,
      platformId: song.platformId,
      title: song.title,
      artist: song.artist,
      album: song.album,
      thumbnailUrl: song.thumbnailUrl,
      previewUrl: song.previewUrl
    })

    if (response.status >= 200 && response.status < 300) {
      suggestedMusicStore.addSong(response?.data?.data ?? {})
      notificationStore.addNotification({
        type: 'success',
        message: 'Song added successfully!'
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
const confirmRemoveSong = (songId) => {
  songIdToRemove.value = songId
  showRemoveConfirm.value = true
}

const removeSong = async songId => {
  try {
    loading.value = true
    const response = await SongsService.deleteSong(userStore.activeEvent, songId)

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
  } finally {
    loading.value = false
    showRemoveConfirm.value = false
    songIdToRemove.value = null
  }
}

// Check if a song is "top voted" (high net score)
const isTopVoted = (song) => {
  if (!song.votes) return false
  const netScore = (song.votes.up || 0) - (song.votes.down || 0)
  return netScore >= 10
}

// Get net score for a song
const getNetScore = (song) => {
  if (!song.votes) return 0
  return (song.votes.up || 0) - (song.votes.down || 0)
}

// View song details
const viewSongDetails = (song) => {
  selectedSongForDetails.value = song
  showVoteDetailsModal.value = true
}

// Player Modal Functions
const openPlayer = (song) => {
  selectedSongForPlayer.value = song
  showPlayerModal.value = true
}

const closePlayer = () => {
  showPlayerModal.value = false
  selectedSongForPlayer.value = null
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="relative mb-12">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Suggested <span class="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">Music</span>
          </h1>
          <p class="text-gray-500 font-medium">
            Manage music suggestions for your event
          </p>
        </div>
      </div>
    </div>

    <!-- Stats Dashboard -->
    <div
      v-if="!loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      <!-- Total Songs Card -->
      <CCard class="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 border-0">
        <div class="p-6 text-white">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Music class="w-6 h-6" />
            </div>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium text-purple-100">Total Songs</p>
            <p class="text-3xl font-bold">{{ totalSongs }}</p>
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
            <p class="text-3xl font-bold">{{ totalVotes }}</p>
          </div>
        </div>
        <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
      </CCard>

      <!-- Top Song Card -->
      <CCard class="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 border-0">
        <div class="p-6 text-white">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingUp class="w-6 h-6" />
            </div>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium text-indigo-100">Top Song</p>
            <p class="text-lg font-bold truncate" :title="topSong?.title || 'No songs yet'">
              {{ topSong?.title || 'No songs yet' }}
            </p>
            <p v-if="topSong" class="text-xs text-indigo-200 truncate">
              {{ topSong.artist }}
            </p>
          </div>
        </div>
        <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
      </CCard>

      <!-- Guest Suggested Card -->
      <CCard class="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 border-0">
        <div class="p-6 text-white">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users class="w-6 h-6" />
            </div>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium text-emerald-100">Guest Suggested</p>
            <p class="text-3xl font-bold">{{ guestSuggested }}</p>
          </div>
        </div>
        <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
      </CCard>
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

          <div ref="searchContainerRef">
            <!-- Search Input -->
            <div class="relative mb-6">
              <input
                v-model="searchQuery"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                placeholder="Search for songs on Spotify..."
                @input="searchSongs"
              />
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
                    <img
                      :src="song.thumbnailUrl"
                      alt="Album Art"
                      class="w-12 h-12 rounded-md object-cover"
                    />
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
        </div>
      </CCard>

      <!-- Suggested Songs List -->
      <CCard>
        <div class="p-6">
          <!-- Header with count -->
          <div class="flex flex-wrap justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <Music class="w-5 h-5 mr-2 text-primary-600" />
              Suggested Songs
              <span class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({{ filteredAndSortedSongs.length }})
              </span>
            </h2>
          </div>

          <!-- Search, Sort, and Filters -->
          <div class="mb-6 space-y-4">
            <!-- Row 1: Search and Sort -->
            <div class="flex flex-col sm:flex-row gap-3">
              <!-- Local Search -->
              <div class="flex-1 relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="localSearch"
                  type="text"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Search in list..."
                />
              </div>

              <!-- Sort Dropdown -->
              <div class="sm:w-64">
                <div class="relative">
                  <SortDesc class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    v-model="sortBy"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="mostVoted">Most Voted</option>
                    <option value="alphabetical">A-Z Title</option>
                  </select>
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Row 2: Filter Buttons -->
            <div class="flex items-center gap-2 flex-wrap">
              <div class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Filter class="w-4 h-4" />
                <span class="font-medium">Filter:</span>
              </div>

              <div class="flex gap-2 flex-wrap">
                <CButton
                  :variant="filterBy === 'all' ? 'primary' : 'outline'"
                  size="sm"
                  @click="filterBy = 'all'"
                >
                  All Songs
                </CButton>

                <CButton
                  :variant="filterBy === 'admin' ? 'primary' : 'outline'"
                  size="sm"
                  @click="filterBy = 'admin'"
                >
                  <User class="w-4 h-4 mr-1" />
                  Admin Added
                </CButton>

                <CButton
                  :variant="filterBy === 'guest' ? 'primary' : 'outline'"
                  size="sm"
                  @click="filterBy = 'guest'"
                >
                  <Users class="w-4 h-4 mr-1" />
                  Guest Suggested
                </CButton>

                <CButton
                  :variant="filterBy === 'topVoted' ? 'primary' : 'outline'"
                  size="sm"
                  @click="filterBy = 'topVoted'"
                >
                  <Flame class="w-4 h-4 mr-1" />
                  Top Voted
                </CButton>
              </div>
            </div>
          </div>

          <!-- No Songs Message -->
          <div
            v-if="filteredAndSortedSongs.length === 0"
            class="text-center py-8 text-gray-500 dark:text-gray-400"
          >
            <Music class="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p class="text-lg">No songs found</p>
            <p class="text-sm mt-1">
              {{ suggestedMusicStore.selectedSongs.length === 0
              ? 'Add songs using the search above'
              : 'Try adjusting your filters or search' }}
            </p>
          </div>

          <!-- Songs Grid -->
          <div v-else class="space-y-4">
            <CCard
              v-for="song in filteredAndSortedSongs"
              :key="song.id"
              class="hover:shadow-lg transition-all duration-300"
            >
              <div class="p-5">
                <div class="flex items-start gap-4">
                  <!-- Album Art -->
                  <div class="flex-shrink-0">
                    <img
                      :src="song.thumbnailUrl || 'https://via.placeholder.com/80'"
                      alt="Album Art"
                      class="w-20 h-20 rounded-lg object-cover shadow-md"
                    />
                  </div>

                  <!-- Song Info -->
                  <div class="flex-1 min-w-0">
                    <!-- Title Row -->
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {{ song.title }}
                      </h3>
                      <CBadge
                        v-if="isTopVoted(song)"
                        variant="error"
                        class="flex items-center gap-1 flex-shrink-0"
                      >
                        <Flame class="w-3 h-3" />
                        Top Voted
                      </CBadge>
                    </div>

                    <!-- Artist & Album -->
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                      {{ song.artist }} • {{ song.album }}
                    </p>

                    <!-- Suggested By -->
                    <div class="flex items-center gap-2 mb-3">
                      <User class="w-4 h-4 text-gray-400" />
                      <span class="text-sm text-gray-600 dark:text-gray-400">
                        Suggested by
                        <span class="font-medium text-gray-900 dark:text-white">
                          {{ song.suggestedBy?.name || 'Unknown' }}
                        </span>
                      </span>
                      <CBadge
                        v-if="song.suggestedBy?.isOrganizer"
                        variant="primary"
                        size="sm"
                      >
                        Organizer
                      </CBadge>
                      <CBadge
                        v-else
                        variant="secondary"
                        size="sm"
                      >
                        Guest
                      </CBadge>
                    </div>

                    <!-- Votes Row -->
                    <div class="flex items-center gap-4 flex-wrap">
                      <!-- Up Votes -->
                      <div class="flex items-center gap-1.5">
                        <div class="p-1 bg-green-50 dark:bg-green-900/20 rounded">
                          <ArrowUp class="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ song.votes?.up || 0 }}
                        </span>
                      </div>

                      <!-- Down Votes -->
                      <div class="flex items-center gap-1.5">
                        <div class="p-1 bg-red-50 dark:bg-red-900/20 rounded">
                          <ArrowDown class="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ song.votes?.down || 0 }}
                        </span>
                      </div>

                      <!-- Net Score Badge -->
                      <CBadge
                        :variant="getNetScore(song) > 0 ? 'success' : getNetScore(song) < 0 ? 'error' : 'gray'"
                        class="font-semibold"
                      >
                        Net: {{ getNetScore(song) > 0 ? '+' : '' }}{{ getNetScore(song) }}
                      </CBadge>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <!-- Play Button -->
                    <button
                      class="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-400 dark:hover:text-purple-400 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                      title="Play song"
                      @click="openPlayer(song)"
                    >
                      <Play class="w-5 h-5" />
                    </button>

                    <!-- View Details -->
                    <button
                      class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      title="View vote details"
                      @click="viewSongDetails(song)"
                    >
                      <Eye class="w-5 h-5" />
                    </button>

                    <!-- Delete -->
                    <button
                      class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remove song"
                      @click="confirmRemoveSong(song.id)"
                    >
                      <Trash2 class="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </CCard>
          </div>
        </div>
      </CCard>
    </template>

    <!-- Player Modal -->
    <CModal
      v-model="showPlayerModal"
      size="lg"
      show-close-icon
      @close="closePlayer"
    >
      <template #title>Now Playing</template>
      <div v-if="selectedSongForPlayer" class="space-y-6">
        <!-- Spotify Embed Player -->
        <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <iframe
            v-if="selectedSongForPlayer.platformId"
            :src="`https://open.spotify.com/embed/track/${selectedSongForPlayer.platformId}`"
            width="100%"
            height="352"
            frameborder="0"
            allowtransparency="true"
            allow="encrypted-media"
            class="rounded-lg"
          ></iframe>

          <!-- Fallback if no platformId -->
          <div v-else class="text-center py-10 text-gray-500 dark:text-gray-400">
            <Music class="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Unable to load player</p>
          </div>
        </div>

        <!-- Info Note -->
        <div class="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>🎵 Powered by Spotify</p>
          <p class="text-xs mt-1">
            {{ selectedSongForPlayer.previewUrl
            ? 'Playing 30-second preview'
            : 'Full playback requires Spotify Premium' }}
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end w-full">
          <CButton variant="outline" @click="closePlayer">
            Close
          </CButton>
        </div>
      </template>
    </CModal>

    <!-- Vote Details Modal -->
    <CModal
      v-model="showVoteDetailsModal"
      title="Vote Details"
      size="lg"
      show-close-icon
    >
      <div v-if="selectedSongForDetails" class="space-y-6">
        <!-- Song Info Header -->
        <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <img
            :src="selectedSongForDetails.thumbnailUrl || 'https://via.placeholder.com/80'"
            alt="Album Art"
            class="w-20 h-20 rounded-lg object-cover shadow-sm"
          />
          <div class="flex-1 min-w-0">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white truncate">
              {{ selectedSongForDetails.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 truncate">
              {{ selectedSongForDetails.artist }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-500 truncate">
              {{ selectedSongForDetails.album }}
            </p>
          </div>
        </div>

        <!-- Vote Summary Cards -->
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 text-center">
            <p class="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Up Votes</p>
            <p class="text-2xl font-bold text-green-700 dark:text-green-300">{{ selectedSongForDetails.votes?.up || 0 }}</p>
          </div>
          <div class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-center">
            <p class="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Down Votes</p>
            <p class="text-2xl font-bold text-red-700 dark:text-red-300">{{ selectedSongForDetails.votes?.down || 0 }}</p>
          </div>
          <div class="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 text-center">
            <p class="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Net Score</p>
            <p class="text-2xl font-bold text-purple-700 dark:text-purple-300">{{ getNetScore(selectedSongForDetails) }}</p>
          </div>
        </div>

        <!-- Votes Table -->
        <div>
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Users class="w-4 h-4 mr-2 text-purple-500" />
            Vote Breakdown
          </h4>

          <div v-if="selectedSongForDetails.voteDetails && selectedSongForDetails.voteDetails.length > 0" class="overflow-hidden border border-gray-100 dark:border-gray-700 rounded-xl">
            <div class="max-h-96 overflow-y-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Guest</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vote</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                <tr v-for="(vote, idx) in selectedSongForDetails.voteDetails" :key="idx" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold mr-3">
                        {{ vote.guestName?.charAt(0) || 'G' }}
                      </div>
                      <span class="text-sm font-medium text-gray-900 dark:text-white">{{ vote.guestName }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <CBadge :variant="vote.type === 'UP' ? 'success' : 'error'" size="sm">
                      <component :is="vote.type === 'UP' ? ArrowUp : ArrowDown" class="w-3 h-3 mr-1" />
                      {{ vote.type }}
                    </CBadge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                    {{ vote.date }}
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State for Votes -->
          <div v-else class="text-center py-10 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            <Users class="w-10 h-10 mx-auto mb-2 text-gray-400 opacity-50" />
            <p class="text-gray-500 dark:text-gray-400">No votes recorded yet for this song.</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end w-full">
          <CButton variant="outline" @click="showVoteDetailsModal = false">
            Close
          </CButton>
        </div>
      </template>
    </CModal>

    <!-- Remove Confirmation Modal -->
    <CConfirmModal
      v-model="showRemoveConfirm"
      title="Remove Song"
      message="Are you sure you want to remove this song from the suggestions? This action cannot be undone."
      @confirm="removeSong(songIdToRemove)"
    />
  </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>
