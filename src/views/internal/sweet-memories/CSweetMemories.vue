<template>
  <div class="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Section Title & Description -->
    <div class="relative mb-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Sweet
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
              >Memories</span
            >
          </h1>
          <p class="text-gray-500 font-medium">
            Create a timeline of special moments to share the honoree's story
          </p>
        </div>
      </div>
    </div>

    <!-- Stats Dashboard -->
    <div
      v-if="!showForm && sweetMemoriesStorage.memories.length > 0"
      class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
    >
      <!-- Total Memories Card -->
      <div
        class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
            <Camera class="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">
              {{ sweetMemoriesStorage.memories.length }}
            </div>
            <div class="text-sm text-gray-600">Total Memories</div>
          </div>
        </div>
      </div>

      <!-- Total Reactions Card (MOCK data) -->
      <div
        class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ mockTotalReactions }}</div>
            <div class="text-sm text-gray-600">Total Reactions</div>
          </div>
        </div>
      </div>

      <!-- Total Views Card (MOCK data) -->
      <div
        class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
            <svg
              class="w-6 h-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ mockTotalViews }}</div>
            <div class="text-sm text-gray-600">Total Views</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div v-if="!showForm && sweetMemoriesStorage.memories.length > 0" class="mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Search Input -->
        <div class="flex-1 relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search memories..."
            class="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          <svg
            class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <!-- Year Filter -->
        <select
          v-model="yearFilter"
          class="bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        >
          <option value="">All Years</option>
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>

        <!-- Sort Order -->
        <select
          v-model="sortOrder"
          class="bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="most-loved">Most Loved</option>
        </select>
      </div>
    </div>

    <!-- Show form when adding/editing a memory -->
    <CSweetMemoriesForm
      v-if="showForm"
      :initial-memory="currentMemory"
      :is-editing="isEditing"
      @save="saveMemory"
      @delete="deleteMemory"
      @cancel="cancelEdit"
    />

    <!-- Show list when not in edit mode -->
    <template v-else>
      <CSweetMemoriesList
        v-if="sweetMemoriesStorage.memories.length > 0"
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
import { onMounted, ref, computed } from 'vue'
import { Camera } from 'lucide-vue-next'

import CSweetMemoriesForm from '@/views/internal/sweet-memories/CSweetMemoriesForm.vue'
import CSweetMemoriesList from '@/views/internal/sweet-memories/CSweetMemoriesList.vue'
import NoSweetMemories from '@/views/internal/sweet-memories/NoSweetMemories.vue'
import { useSweetMemoriesStore } from '@/stores/useSweetMemoriesStore'

const sweetMemoriesStorage = useSweetMemoriesStore()
const memories = ref([])
const showForm = ref(false)
const isEditing = ref(false)
const currentMemory = ref({
  id: null,
  imagePath: '',
  title: '',
  description: '',
  year: '',
  visible: true,
  image: []
})

const mockTotalReactions = computed(() => {
  return sweetMemoriesStorage.memories.reduce((acc, memory) => acc + (memory.reactions || 0), 0)
})
const mockTotalViews = computed(() => {
  return sweetMemoriesStorage.memories.reduce((acc, memory) => acc + (memory.views || 0), 0)
})

const searchQuery = ref('')
const yearFilter = ref('')

const clearFilters = () => {
  searchQuery.value = ''
  yearFilter.value = ''
}
const sortOrder = ref('newest')

// Computed for available years from memories
const availableYears = computed(() => {
  const years = [...new Set(sweetMemoriesStorage.memories.map(m => m.year).filter(Boolean))]
  return years.sort((a, b) => b - a)
})

const addNewMemory = () => {
  currentMemory.value = {
    id: null,
    imagePath: '',
    title: '',
    description: '',
    year: '',
    visible: true,
    image: []
  }
  isEditing.value = false
  showForm.value = true
}

const editMemory = memory => {
  currentMemory.value = {
    ...memory,
    image: [] // Reset image selection on edit
  }
  isEditing.value = true
  showForm.value = true
}

const saveMemory = async () => {
  showForm.value = false
}

const deleteMemory = async memory => {
  if (confirm('Are you sure you want to delete this memory?')) {
    const response = await sweetMemoriesStorage.deleteSweetMemory(memory.id)
    if (response.status >= 200 && response.status < 300) {
      showForm.value = false
    }
  }
}

const cancelEdit = () => {
  showForm.value = false
}

const handleOrderChange = newOrder => {
  memories.value = [...newOrder]

  console.log(newOrder)
}

onMounted(async () => {
  await sweetMemoriesStorage.loadMemories()
})
</script>
