<script setup>
// All comments in code are in English, as requested.

import CPageLoaderV2 from '@/components/UI/loading/CPageLoaderV2.vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'

import { useSuggestedMusicAdminController } from '@/modules/suggested-music/composables/useSuggestedMusicAdminController'

// Your new components
import SuggestedMusicHeader from '@/modules/suggested-music/components/SuggestedMusicHeader.vue'
import SuggestedMusicSearchAdd from '@/modules/suggested-music/components/SuggestedMusicSearchAdd.vue'
import SuggestedMusicList from '@/modules/suggested-music/components/SuggestedMusicList.vue'
import SuggestedMusicPlayerModal from '@/modules/suggested-music/components/SuggestedMusicPlayerModal.vue'
import SuggestedMusicVoteDetailsModal from '@/modules/suggested-music/components/SuggestedMusicVoteDetailsModal.vue'

// Stats component: you said it's already ready.
// Update the import path/name to match what you created.
import SuggestedMusicStats from '@/modules/suggested-music/components/SuggestedMusicStats.vue'

const {
  // State
  loading,
  exporting,
  showExportDropdown,
  exportDropdownRef,
  searchQuery,
  searchResults,
  searchContainerRef,
  showVoteDetailsModal,
  selectedSongForDetails,
  showRemoveConfirm,
  songIdToRemove,
  showPlayerModal,
  selectedSongForPlayer,
  localSearch,
  sortBy,
  filterBy,

  // Computed
  totalSongs,
  totalVotes,
  topSong,
  guestSuggested,
  filteredAndSortedSongs,
  hasSongs,

  // Actions
  searchSongs,
  addSong,
  confirmRemoveSong,
  removeSong,
  viewSongDetails,
  openPlayer,
  closePlayer,
  exportPlaylist,

  // Helpers
  isTopVoted,
  getNetScore
} = useSuggestedMusicAdminController()

const toggleExportDropdown = () => {
  showExportDropdown.value = !showExportDropdown.value
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div ref="exportDropdownRef">
      <SuggestedMusicHeader
        :loading="loading"
        :exporting="exporting"
        :show-export-dropdown="showExportDropdown"
        @toggle-export="toggleExportDropdown"
        @export="exportPlaylist"
      />
    </div>

    <!-- Stats -->
    <SuggestedMusicStats
      v-if="!loading"
      :total-songs="totalSongs"
      :total-votes="totalVotes"
      :top-song="topSong"
      :guest-suggested="guestSuggested"
    />

    <!-- Loading State -->
    <CPageLoaderV2 v-if="loading" />

    <template v-else>
      <!-- Search & Add -->
      <div ref="searchContainerRef">
        <SuggestedMusicSearchAdd
          :loading="loading"
          :search-query="searchQuery"
          :search-results="searchResults"
          @update:search-query="val => (searchQuery = val)"
          @search="searchSongs"
          @add="addSong"
        />
      </div>

      <!-- List -->
      <SuggestedMusicList
        :has-songs="hasSongs"
        :songs="filteredAndSortedSongs"
        :local-search="localSearch"
        :sort-by="sortBy"
        :filter-by="filterBy"
        :is-top-voted="isTopVoted"
        :get-net-score="getNetScore"
        @update:local-search="val => (localSearch = val)"
        @update:sort-by="val => (sortBy = val)"
        @update:filter-by="val => (filterBy = val)"
        @play="openPlayer"
        @details="viewSongDetails"
        @remove="confirmRemoveSong"
      />
    </template>

    <!-- Player Modal -->
    <SuggestedMusicPlayerModal
      v-model="showPlayerModal"
      :selected-song="selectedSongForPlayer"
      @close="closePlayer"
    />

    <!-- Vote Details Modal -->
    <SuggestedMusicVoteDetailsModal
      v-model="showVoteDetailsModal"
      :selected-song="selectedSongForDetails"
      :get-net-score="getNetScore"
    />

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
