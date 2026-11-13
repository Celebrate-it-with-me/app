<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown, Download } from 'lucide-vue-next'
import { UiPageHeader, UiButton, UiDropdown, UiModal, UiSkeleton } from '@/ui'
import { useSuggestedMusicAdminController } from '@/modules/suggested-music/composables/useSuggestedMusicAdminController'
import SuggestedMusicSearchAdd from '@/modules/suggested-music/components/SuggestedMusicSearchAdd.vue'
import SuggestedMusicList from '@/modules/suggested-music/components/SuggestedMusicList.vue'
import SuggestedMusicStats from '@/modules/suggested-music/components/SuggestedMusicStats.vue'
import SuggestedMusicPlayerModal from '@/modules/suggested-music/components/SuggestedMusicPlayerModal.vue'
import SuggestedMusicVoteDetailsModal from '@/modules/suggested-music/components/SuggestedMusicVoteDetailsModal.vue'

const { t } = useI18n()

const {
  loading,
  exporting,
  deleting,
  searching,
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
  totalSongs,
  totalVotes,
  topSong,
  guestSuggested,
  filteredAndSortedSongs,
  hasSongs,
  searchSongs,
  addSong,
  confirmRemoveSong,
  removeSong,
  viewSongDetails,
  openPlayer,
  closePlayer,
  exportPlaylist
} = useSuggestedMusicAdminController()

const exportItems = computed(() => [
  { label: t('app.music.export.xlsx'), onSelect: () => exportPlaylist('xlsx') },
  { label: t('app.music.export.csv'), onSelect: () => exportPlaylist('csv') },
  { label: t('app.music.export.pdf'), onSelect: () => exportPlaylist('pdf') }
])
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <UiPageHeader :title="t('app.music.title')" :subtitle="t('app.music.subtitle')">
      <template #actions>
        <UiDropdown :items="exportItems">
          <template #trigger>
            <UiButton variant="secondary" :loading="exporting" :disabled="loading || exporting">
              <Download class="h-4 w-4" aria-hidden="true" />
              {{ t('app.music.export.label') }}
              <ChevronDown class="h-4 w-4" aria-hidden="true" />
            </UiButton>
          </template>
        </UiDropdown>
      </template>
    </UiPageHeader>

    <div v-if="loading" class="mt-6 space-y-4" aria-busy="true">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <UiSkeleton v-for="n in 4" :key="n" height="5rem" />
      </div>
      <UiSkeleton height="9rem" />
      <UiSkeleton height="6rem" />
      <UiSkeleton height="6rem" />
    </div>

    <div v-else class="mt-6 space-y-6">
      <SuggestedMusicStats
        :total-songs="totalSongs"
        :total-votes="totalVotes"
        :top-song="topSong"
        :guest-suggested="guestSuggested"
      />

      <div ref="searchContainerRef">
        <SuggestedMusicSearchAdd
          :search-query="searchQuery"
          :search-results="searchResults"
          :searching="searching"
          @update:search-query="val => (searchQuery = val)"
          @search="searchSongs"
          @add="addSong"
        />
      </div>

      <SuggestedMusicList
        :has-songs="hasSongs"
        :songs="filteredAndSortedSongs"
        :local-search="localSearch"
        :sort-by="sortBy"
        :filter-by="filterBy"
        @update:local-search="val => (localSearch = val)"
        @update:sort-by="val => (sortBy = val)"
        @update:filter-by="val => (filterBy = val)"
        @play="openPlayer"
        @details="viewSongDetails"
        @remove="confirmRemoveSong"
      />
    </div>

    <SuggestedMusicPlayerModal v-model="showPlayerModal" :selected-song="selectedSongForPlayer" @close="closePlayer" />
    <SuggestedMusicVoteDetailsModal v-model="showVoteDetailsModal" :selected-song="selectedSongForDetails" />

    <UiModal
      :open="showRemoveConfirm"
      :title="t('app.music.remove.title')"
      :description="t('app.music.remove.text')"
      size="sm"
      @update:open="val => (showRemoveConfirm = val)"
    >
      <template #footer>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <UiButton variant="secondary" :disabled="deleting" @click="showRemoveConfirm = false">{{ t('app.music.cancel') }}</UiButton>
          <UiButton variant="danger" :loading="deleting" @click="removeSong(songIdToRemove)">{{ t('app.music.remove.confirm') }}</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>
