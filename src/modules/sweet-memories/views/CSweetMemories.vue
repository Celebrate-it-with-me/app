<template>
  <div class="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <CSweetMemoriesHeader />

    <CSweetMemoriesStats
      v-if="showStats"
      :total-memories="totalMemories"
      :total-reactions="mockTotalReactions"
      :total-views="mockTotalViews"
    />

    <CSweetMemoriesFilters
      v-if="showStats"
      v-model:search-query="searchQuery"
      v-model:year-filter="yearFilter"
      v-model:sort-order="sortOrder"
      :available-years="availableYears"
      @clear="clearFilters"
    />

    <CSweetMemoriesForm
      v-if="showForm"
      :initial-memory="currentMemory"
      :is-editing="isEditing"
      @save="saveMemory"
      @delete="deleteMemory"
      @cancel="cancelEdit"
    />

    <template v-else>
      <CSweetMemoriesList
        v-if="hasMemories"
        :search-query="searchQuery"
        :year-filter="yearFilter"
        :sort-order="sortOrder"
        @add="addNewMemory"
        @edit="editMemory"
        @delete="deleteMemory"
        @order-changed="handleOrderChange"
        @clear-filters="clearFilters"
      />
      <NoSweetMemories v-else @add-first-memory="addNewMemory" />
    </template>
  </div>
</template>

<script setup>
// All comments in code are in English, as requested.
import NoSweetMemories from '@/modules/sweet-memories/components/NoSweetMemories.vue'
import CSweetMemoriesList from '@/modules/sweet-memories/components/CSweetMemoriesList.vue'
import CSweetMemoriesForm from '@/modules/sweet-memories/components/CSweetMemoriesForm.vue'

import CSweetMemoriesHeader from '@/modules/sweet-memories/components/CSweetMemoriesHeader.vue'
import CSweetMemoriesStats from '@/modules/sweet-memories/components/CSweetMemoriesStats.vue'
import CSweetMemoriesFilters from '@/modules/sweet-memories/components/CSweetMemoriesFilters.vue'

import { useSweetMemoriesAdminController } from '@/modules/sweet-memories/composables/useSweetMemoriesAdminController'

const {
  // Store-derived state
  hasMemories,
  totalMemories,

  // UI state
  showForm,
  isEditing,
  currentMemory,

  // Filters
  searchQuery,
  yearFilter,
  sortOrder,
  availableYears,
  clearFilters,

  // Stats
  mockTotalReactions,
  mockTotalViews,

  // Actions
  addNewMemory,
  editMemory,
  saveMemory,
  deleteMemory,
  cancelEdit,
  handleOrderChange,

  // View helpers
  showStats
} = useSweetMemoriesAdminController()
</script>
