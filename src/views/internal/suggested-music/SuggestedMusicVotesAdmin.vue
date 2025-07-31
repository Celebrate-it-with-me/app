<script setup>
import { ref, computed } from 'vue'
import { Music, Star, Users, Filter, Eye, EyeOff, Trash2, Flame } from 'lucide-vue-next'
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CModal from '@/components/UI/modals/CModal.vue'
import CPageLoaderV2 from '@/components/UI/loading/CPageLoaderV2.vue'
import CBadge from '@/components/UI/badges/CBadge.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'

// Mock data for songs with votes
const songs = ref([
  {
    id: 1,
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    thumbnailUrl: 'https://via.placeholder.com/64',
    platformId: '7tFiyTwD0nx5a1eklYtX2J',
    averageRating: 4.8,
    totalVotes: 15,
    suggestedBy: 'John Doe',
    lastVoteTimestamp: '2023-05-15 14:30',
    visible: true,
    votes: [
      { id: 1, voter: 'Alice Smith', rating: 5, timestamp: '2023-05-15 14:30' },
      { id: 2, voter: 'Bob Johnson', rating: 5, timestamp: '2023-05-14 10:15' },
      { id: 3, voter: 'Charlie Brown', rating: 4, timestamp: '2023-05-13 18:45' },
      { id: 4, voter: 'Anonymous', rating: 5, timestamp: '2023-05-12 09:20' }
    ]
  },
  {
    id: 2,
    title: 'Hotel California',
    artist: 'Eagles',
    album: 'Hotel California',
    thumbnailUrl: 'https://via.placeholder.com/64',
    platformId: '40riOy7x9W7GXjyGp4pjAv',
    averageRating: 4.6,
    totalVotes: 12,
    suggestedBy: 'Jane Smith',
    lastVoteTimestamp: '2023-05-14 16:45',
    visible: true,
    votes: [
      { id: 5, voter: 'David Wilson', rating: 5, timestamp: '2023-05-14 16:45' },
      { id: 6, voter: 'Emma Davis', rating: 4, timestamp: '2023-05-13 11:30' },
      { id: 7, voter: 'Anonymous', rating: 5, timestamp: '2023-05-12 14:20' }
    ]
  },
  {
    id: 3,
    title: 'Imagine',
    artist: 'John Lennon',
    album: 'Imagine',
    thumbnailUrl: 'https://via.placeholder.com/64',
    platformId: '7pKfPomDEeI4TPT6EOYjn9',
    averageRating: 4.2,
    totalVotes: 8,
    suggestedBy: 'Admin',
    lastVoteTimestamp: '2023-05-13 09:15',
    visible: false,
    votes: [
      { id: 8, voter: 'Frank Miller', rating: 4, timestamp: '2023-05-13 09:15' },
      { id: 9, voter: 'Grace Lee', rating: 5, timestamp: '2023-05-12 17:40' },
      { id: 10, voter: 'Anonymous', rating: 3, timestamp: '2023-05-11 13:25' }
    ]
  },
  {
    id: 4,
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    album: 'Thriller',
    thumbnailUrl: 'https://via.placeholder.com/64',
    platformId: '5ChkMS8OtdzJeqyybCc9R5',
    averageRating: 4.9,
    totalVotes: 18,
    suggestedBy: 'Sarah Johnson',
    lastVoteTimestamp: '2023-05-15 11:20',
    visible: true,
    votes: [
      { id: 11, voter: 'Henry Adams', rating: 5, timestamp: '2023-05-15 11:20' },
      { id: 12, voter: 'Isabella Garcia', rating: 5, timestamp: '2023-05-14 15:10' },
      { id: 13, voter: 'Jack Thompson', rating: 5, timestamp: '2023-05-13 12:35' },
      { id: 14, voter: 'Anonymous', rating: 4, timestamp: '2023-05-12 10:50' }
    ]
  },
  {
    id: 5,
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    album: 'Appetite for Destruction',
    thumbnailUrl: 'https://via.placeholder.com/64',
    platformId: '7o2CTH4ctstm8TNelqjb51',
    averageRating: 4.5,
    totalVotes: 10,
    suggestedBy: 'Admin',
    lastVoteTimestamp: '2023-05-14 13:40',
    visible: true,
    votes: [
      { id: 15, voter: 'Kate Wilson', rating: 5, timestamp: '2023-05-14 13:40' },
      { id: 16, voter: 'Liam Davis', rating: 4, timestamp: '2023-05-13 16:25' },
      { id: 17, voter: 'Anonymous', rating: 5, timestamp: '2023-05-12 09:15' }
    ]
  }
])

// UI state
const loading = ref(false)
const selectedSong = ref(null)
const showVotesModal = ref(false)
const confirmDeleteVoteModal = ref(false)
const confirmResetVotesModal = ref(false)
const voteToDelete = ref(null)
const minRatingFilter = ref(0)
const statusFilter = ref('all') // 'all', 'visible', 'hidden'

// Filter options
const statusOptions = [
  { value: 'all', label: 'All Songs' },
  { value: 'visible', label: 'Visible Songs' },
  { value: 'hidden', label: 'Hidden Songs' }
]

// Filtered songs based on filters
const filteredSongs = computed(() => {
  return songs.value
    .filter(song => song.averageRating >= minRatingFilter.value)
    .filter(song => {
      if (statusFilter.value === 'all') return true
      if (statusFilter.value === 'visible') return song.visible
      if (statusFilter.value === 'hidden') return !song.visible
      return true
    })
})

// Check if a song is considered "top voted"
const isTopVoted = song => {
  return song.totalVotes > 10 && song.averageRating >= 4.5
}

// Open the votes modal for a song
const viewVotes = song => {
  selectedSong.value = song
  showVotesModal.value = true
}

// Confirm delete vote
const confirmDeleteVote = vote => {
  voteToDelete.value = vote
  confirmDeleteVoteModal.value = true
}

// Delete a vote
const deleteVote = () => {
  if (!voteToDelete.value || !selectedSong.value) return

  // Find the song and remove the vote
  const song = songs.value.find(s => s.id === selectedSong.value.id)
  if (song) {
    song.votes = song.votes.filter(v => v.id !== voteToDelete.value.id)

    // Recalculate average rating and total votes
    song.totalVotes = song.votes.length
    song.averageRating =
      song.votes.length > 0
        ? parseFloat(
            (song.votes.reduce((sum, v) => sum + v.rating, 0) / song.votes.length).toFixed(1)
          )
        : 0

    // Update last vote timestamp if there are still votes
    if (song.votes.length > 0) {
      song.lastVoteTimestamp = song.votes.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      )[0].timestamp
    } else {
      song.lastVoteTimestamp = 'No votes'
    }

    // Update the selected song to reflect changes
    selectedSong.value = { ...song }
  }

  confirmDeleteVoteModal.value = false
  voteToDelete.value = null
}

// Confirm reset all votes
const confirmResetVotes = () => {
  confirmResetVotesModal.value = true
}

// Reset all votes for a song
const resetVotes = () => {
  if (!selectedSong.value) return

  // Find the song and reset its votes
  const song = songs.value.find(s => s.id === selectedSong.value.id)
  if (song) {
    song.votes = []
    song.totalVotes = 0
    song.averageRating = 0
    song.lastVoteTimestamp = 'No votes'

    // Update the selected song to reflect changes
    selectedSong.value = { ...song }
  }

  confirmResetVotesModal.value = false
}

// Toggle song visibility
const toggleVisibility = song => {
  const songIndex = songs.value.findIndex(s => s.id === song.id)
  if (songIndex !== -1) {
    songs.value[songIndex].visible = !songs.value[songIndex].visible

    // If the song is currently selected, update the selected song
    if (selectedSong.value && selectedSong.value.id === song.id) {
      selectedSong.value.visible = songs.value[songIndex].visible
    }
  }
}

// Format rating as stars
const formatRating = rating => {
  return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
        <Music class="w-8 h-8 mr-3 text-primary-600" />
        Music Votes Dashboard
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Monitor and manage guest voting activity on suggested songs
      </p>
    </div>

    <!-- Loading State -->
    <CPageLoaderV2 v-if="loading"></CPageLoaderV2>

    <template v-else>
      <!-- Filter Section -->
      <CCard class="mb-6">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Filter class="w-5 h-5 mr-2 text-primary-600" />
            Filter Songs
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Rating
              </label>
              <div class="flex items-center">
                <input
                  v-model="minRatingFilter"
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <span
                  class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[40px]"
                >
                  {{ minRatingFilter }}
                </span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Song Status
              </label>
              <CSelect
                id="statusFilter"
                v-model="statusFilter"
                :options="statusOptions"
                class="w-full"
                name="statusFilter"
              />
            </div>
          </div>
        </div>
      </CCard>

      <!-- Songs Table -->
      <CCard>
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Star class="w-5 h-5 mr-2 text-primary-600" />
            Songs with Votes
          </h2>

          <!-- No Songs Message -->
          <div
            v-if="filteredSongs.length === 0"
            class="text-center py-8 text-gray-500 dark:text-gray-400"
          >
            <Music class="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p class="text-lg">No songs found</p>
            <p class="text-sm mt-1">Try adjusting your filters</p>
          </div>

          <!-- Songs Table -->
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Song
                  </th>
                  <th
                    class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Rating
                  </th>
                  <th
                    class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Votes
                  </th>
                  <th
                    class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Suggested By
                  </th>
                  <th
                    class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Last Vote
                  </th>
                  <th
                    class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <tr
                  v-for="song in filteredSongs"
                  :key="song.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center space-x-3">
                      <img
                        :src="song.thumbnailUrl"
                        alt="Album Art"
                        class="w-10 h-10 rounded-md object-cover flex-shrink-0"
                      />
                      <div>
                        <div class="flex items-center">
                          <p class="font-medium text-gray-900 dark:text-white">{{ song.title }}</p>
                          <CBadge
                            v-if="isTopVoted(song)"
                            variant="error"
                            class="ml-2 flex items-center"
                          >
                            <Flame class="w-3 h-3 mr-1" />
                            Top Voted
                          </CBadge>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ song.artist }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span class="text-yellow-500">{{ formatRating(song.averageRating) }}</span>
                      <span class="ml-2 text-gray-700 dark:text-gray-300">{{
                        song.averageRating.toFixed(1)
                      }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {{ song.totalVotes }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {{ song.suggestedBy }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {{ song.lastVoteTimestamp }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <CBadge :variant="song.visible ? 'success' : 'gray'">
                      {{ song.visible ? 'Visible' : 'Hidden' }}
                    </CBadge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex space-x-2">
                      <CButton size="sm" variant="primary" @click="viewVotes(song)">
                        View Votes
                      </CButton>
                      <CButton
                        size="sm"
                        :variant="song.visible ? 'outline' : 'secondary'"
                        @click="toggleVisibility(song)"
                      >
                        <template v-if="song.visible">
                          <EyeOff class="w-4 h-4 mr-1" />
                          Hide
                        </template>
                        <template v-else>
                          <Eye class="w-4 h-4 mr-1" />
                          Show
                        </template>
                      </CButton>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CCard>
    </template>

    <!-- Votes Detail Modal -->
    <CModal v-model="showVotesModal" show-close-icon>
      <template #title>
        <div class="flex items-center">
          <Star class="w-5 h-5 mr-2 text-primary-600" />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Votes for "{{ selectedSong?.title }}"
          </h3>
        </div>
      </template>

      <div v-if="selectedSong" class="py-4">
        <!-- Song Info -->
        <div class="flex items-center mb-6">
          <img
            :src="selectedSong.thumbnailUrl"
            alt="Album Art"
            class="w-16 h-16 rounded-md object-cover"
          />
          <div class="ml-4">
            <h4 class="font-medium text-gray-900 dark:text-white">{{ selectedSong.title }}</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ selectedSong.artist }} - {{ selectedSong.album }}
            </p>
            <div class="flex items-center mt-1">
              <span class="text-yellow-500 text-sm">{{
                formatRating(selectedSong.averageRating)
              }}</span>
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {{ selectedSong.averageRating.toFixed(1) }} ({{ selectedSong.totalVotes }} votes)
              </span>
            </div>
          </div>
        </div>

        <!-- Visibility Toggle -->
        <div class="mb-6 flex items-center justify-between">
          <div class="flex items-center">
            <CBadge :variant="selectedSong.visible ? 'success' : 'gray'" class="mr-2">
              {{ selectedSong.visible ? 'Visible' : 'Hidden' }}
            </CBadge>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              This song is {{ selectedSong.visible ? 'visible' : 'hidden' }} to guests
            </span>
          </div>
          <CButton
            size="sm"
            :variant="selectedSong.visible ? 'outline' : 'secondary'"
            @click="toggleVisibility(selectedSong)"
          >
            <template v-if="selectedSong.visible">
              <EyeOff class="w-4 h-4 mr-1" />
              Hide Song
            </template>
            <template v-else>
              <Eye class="w-4 h-4 mr-1" />
              Show Song
            </template>
          </CButton>
        </div>

        <!-- Votes List -->
        <h5 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
          <Users class="w-4 h-4 mr-2" />
          Vote Details
        </h5>

        <div
          v-if="selectedSong.votes.length === 0"
          class="text-center py-4 text-gray-500 dark:text-gray-400"
        >
          <p>No votes for this song</p>
        </div>

        <div v-else class="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Voter
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Rating
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="vote in selectedSong.votes"
                :key="vote.id"
                class="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {{ vote.voter }}
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                  <div class="flex items-center">
                    <span class="text-yellow-500 text-sm">{{ '★'.repeat(vote.rating) }}</span>
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300"
                      >{{ vote.rating }}/5</span
                    >
                  </div>
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {{ vote.timestamp }}
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    @click="confirmDeleteVote(vote)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <CButton variant="danger" @click="confirmResetVotes">
            <Trash2 class="w-4 h-4 mr-1" />
            Reset All Votes
          </CButton>
          <CButton @click="showVotesModal = false">Close</CButton>
        </div>
      </template>
    </CModal>

    <!-- Confirm Delete Vote Modal -->
    <CConfirmModal
      v-model="confirmDeleteVoteModal"
      title="Delete Vote"
      message="Are you sure you want to delete this vote? This action cannot be undone."
      @confirm="deleteVote"
    />

    <!-- Confirm Reset Votes Modal -->
    <CConfirmModal
      v-model="confirmResetVotesModal"
      title="Reset All Votes"
      message="Are you sure you want to reset all votes for this song? This action cannot be undone."
      @confirm="resetVotes"
    />
  </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>
