<template>
  <div>
    <!-- Loading Skeletons -->
    <div v-if="loading" class="space-y-4">
      <div
        v-for="i in 3"
        :key="i"
        class="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse"
      >
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Image Skeleton -->
          <div class="w-full md:w-40 h-40 md:h-28 bg-gray-200 rounded-xl flex-shrink-0"></div>

          <!-- Content Skeleton -->
          <div class="flex-1 space-y-3">
            <div class="h-5 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            <div class="h-12 bg-gray-200 rounded"></div>
            <div class="flex gap-2">
              <div class="h-8 bg-gray-200 rounded flex-1"></div>
              <div class="h-8 bg-gray-200 rounded flex-1"></div>
              <div class="h-8 bg-gray-200 rounded w-10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <NoSweetMemories
        v-if="filteredMemories.length === 0 && !props.searchQuery && !props.yearFilter"
        @add-first-memory="addMemory"
      />

      <!-- Add Memory Button (Top) -->
      <div v-if="memories?.length > 0" class="mb-6 flex justify-end">
        <CButton variant="primary" class="flex items-center" @click="addMemory">
          <Plus class="w-5 h-5 mr-2" />
          Add Memory
        </CButton>
      </div>

      <!-- Draggable Memories -->
      <div v-if="memories?.length > 0" class="relative">
        <!-- Timeline Line -->
        <div
          class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500 opacity-20 hidden md:block"
        ></div>

        <draggable
          v-if="filteredMemories.length > 0"
          class="space-y-4 relative"
          :list="filteredMemories"
          item-key="id"
          handle=".drag-handle"
          @change="handleOrderChange"
        >
          <template #footer></template>
          <div
            v-for="memory in filteredMemories"
            :key="memory.id"
            :class="{ 'z-50 relative': openMenuId === memory.id }"
          >
            <CCard
              class="relative hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500 group"
            >
              <div class="p-4">
                <!-- Drag Handle -->
                <div
                  class="absolute top-4 left-4 cursor-move drag-handle bg-white rounded-lg p-1.5 shadow-sm hover:shadow-md hover:bg-purple-50 transition-all z-10"
                >
                  <GripVertical
                    class="w-4 h-4 text-gray-400 hover:text-purple-500 transition-colors"
                  />
                </div>

                <div class="ml-7">
                  <div class="flex flex-col md:flex-row gap-4">
                    <!-- Image Section with Hover Effect -->
                    <div class="relative flex-shrink-0">
                      <div
                        v-if="memory.imagePath"
                        class="relative overflow-hidden rounded-xl w-full md:w-40 h-40 md:h-28 bg-gray-100"
                      >
                        <img
                          :src="memory.imagePath"
                          alt="Memory photo"
                          class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                        <!-- Hover Overlay -->
                        <div
                          class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                        >
                          <button
                            class="bg-white text-gray-900 px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-gray-100 transition-colors transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                            @click="viewFull(memory)"
                          >
                            <span class="flex items-center gap-1.5">
                              <svg
                                class="w-3 h-3"
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
                              Preview
                            </span>
                          </button>
                        </div>
                      </div>
                      <div
                        v-else
                        class="w-full md:w-40 h-40 md:h-28 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl flex items-center justify-center"
                      >
                        <ImageIcon class="w-12 h-12 text-gray-400" />
                      </div>
                    </div>

                    <!-- Memory Details -->
                    <div class="flex-1 flex flex-col justify-between space-y-3">
                      <!-- Header -->
                      <div class="flex items-start justify-between border-b border-gray-100 pb-2">
                        <div class="flex-1">
                          <h3 class="text-base font-bold text-gray-900 dark:text-white mb-0.5">
                            {{ memory.title || 'Untitled Memory' }}
                          </h3>
                          <p
                            v-if="memory.description"
                            class="text-sm text-gray-600 dark:text-gray-400 italic line-clamp-2"
                          >
                            "{{ memory.description }}"
                          </p>
                        </div>
                        <div v-if="memory.year" class="ml-3 relative group flex-shrink-0">
                          <span
                            class="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-semibold shadow-md cursor-help inline-block"
                          >
                            {{ memory.year }}
                          </span>
                          <!-- Tooltip -->
                          <div
                            class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                          >
                            {{ getYearsAgo(memory.year) }}
                            <div
                              class="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"
                            ></div>
                          </div>
                        </div>
                      </div>

                      <!-- Metadata Row & Actions -->
                      <div class="flex flex-wrap items-center justify-between gap-3 py-2">
                        <div class="flex flex-wrap items-center gap-3">
                          <!-- Visibility Status -->
                          <div class="flex items-center gap-2">
                            <svg
                              v-if="memory.visible"
                              class="w-4 h-4 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <svg
                              v-else
                              class="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                            <span
                              class="text-sm font-medium"
                              :class="memory.visible ? 'text-green-600' : 'text-gray-500'"
                            >
                              {{ memory.visible ? 'Visible to guests' : 'Hidden' }}
                            </span>
                          </div>

                          <!-- Reactions Breakdown -->
                          <div
                            class="flex items-center gap-2 bg-pink-50 px-2.5 py-1 rounded-full text-xs"
                          >
                            <span class="text-sm">❤️</span>
                            <span class="text-pink-600 font-semibold">{{
                              getReactionCount(memory, 'love')
                            }}</span>
                            <span class="text-gray-300">|</span>
                            <span class="text-sm">😍</span>
                            <span class="text-pink-600 font-semibold">{{
                              getReactionCount(memory, 'heart_eyes')
                            }}</span>
                            <span class="text-gray-300">|</span>
                            <span class="text-sm">🥺</span>
                            <span class="text-pink-600 font-semibold">{{
                              getReactionCount(memory, 'pleading')
                            }}</span>
                          </div>

                          <!-- MOCK Views -->
                          <div class="flex items-center gap-1.5">
                            <svg
                              class="w-4 h-4 text-gray-600"
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
                            <span class="text-sm text-gray-600">{{ memory.views || 0 }}</span>
                          </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex items-center gap-2">
                          <!-- Edit Button -->
                          <button
                            class="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 hover:shadow-md text-xs"
                            @click="editMemory(memory)"
                          >
                            <Edit class="w-3.5 h-3.5" />
                            Edit
                          </button>

                          <!-- View Full Button -->
                          <button
                            class="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 hover:shadow-md text-xs"
                            @click="viewFull(memory)"
                          >
                            <svg
                              class="w-3.5 h-3.5"
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
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Preview
                          </button>

                          <!-- More Menu Button -->
                          <div class="relative">
                            <button
                              class="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:shadow-md"
                              @click="toggleMenu(memory.id)"
                            >
                              <svg
                                class="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                />
                              </svg>
                            </button>

                            <!-- Dropdown Menu -->
                            <Transition
                              enter-active-class="transition ease-out duration-100"
                              enter-from-class="transform opacity-0 scale-95"
                              enter-to-class="transform opacity-100 scale-100"
                              leave-active-class="transition ease-in duration-75"
                              leave-from-class="transform opacity-100 scale-100"
                              leave-to-class="transform opacity-0 scale-95"
                            >
                              <div
                                v-if="openMenuId === memory.id"
                                class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-[100]"
                              >
                                <!-- Toggle Visibility -->
                                <button
                                  class="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                  @click="handleToggleVisibility(memory)"
                                >
                                  <svg
                                    v-if="memory.visible"
                                    class="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                    />
                                  </svg>
                                  <svg
                                    v-else
                                    class="w-4 h-4"
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
                                  {{ memory.visible ? 'Hide from guests' : 'Show to guests' }}
                                </button>

                                <!-- Duplicate -->
                                <button
                                  class="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                  @click="handleDuplicate(memory)"
                                >
                                  <svg
                                    class="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                  Duplicate memory
                                </button>

                                <div class="border-t border-gray-200 my-2"></div>

                                <!-- Delete -->
                                <button
                                  class="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                  @click="handleDelete(memory)"
                                >
                                  <Trash2 class="w-4 h-4" />
                                  Delete memory
                                </button>
                              </div>
                            </Transition>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CCard>
          </div>
        </draggable>
      </div>
    </template>

    <!-- Empty Search Results -->
    <div
      v-if="filteredMemories.length === 0 && (props.searchQuery || props.yearFilter)"
      class="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200"
    >
      <div class="max-w-sm mx-auto">
        <svg
          class="w-20 h-20 text-gray-300 mx-auto mb-4"
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
        <h3 class="text-xl font-bold text-gray-900 mb-2">No memories found</h3>
        <p class="text-gray-600 mb-6">Try adjusting your search terms or filters</p>
        <button
          class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          @click="clearFilters"
        >
          Clear all filters
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import { Plus, Trash2, GripVertical, Edit, Image as ImageIcon } from 'lucide-vue-next'

import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import NoSweetMemories from '@/modules/sweet-memories/components/NoSweetMemories.vue'
import { useSweetMemoriesStore } from '@/stores/useSweetMemoriesStore'
import { computed, onMounted, ref } from 'vue'
import lightGallery from 'lightgallery'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-thumbnail.css'

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  yearFilter: {
    type: [String, Number],
    default: ''
  },
  sortOrder: {
    type: String,
    default: 'newest'
  }
})

const emit = defineEmits(['add', 'edit', 'delete', 'order-changed', 'clear-filters'])

const sweetMemoriesStorage = useSweetMemoriesStore()

const loading = ref(true)
const openMenuId = ref(null)

const memories = computed(() => {
  return (sweetMemoriesStorage.memories || []).map(memory => ({
    ...memory,
    reactions: memory.reactions || 0,
    views: memory.views || 0
  }))
})

const filteredMemories = computed(() => {
  let filtered = memories.value

  if (props.searchQuery) {
    filtered = filtered.filter(
      m =>
        m.title?.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(props.searchQuery.toLowerCase())
    )
  }

  if (props.yearFilter) {
    filtered = filtered.filter(m => String(m.year) === String(props.yearFilter))
  }

  if (props.sortOrder === 'most-loved') {
    return [...filtered].sort((a, b) => (b.reactions || 0) - (a.reactions || 0))
  }

  if (props.sortOrder === 'oldest') {
    return [...filtered].sort((a, b) => (a.year || 0) - (b.year || 0))
  }

  if (props.sortOrder === 'newest') {
    return [...filtered].sort((a, b) => (b.year || 0) - (a.year || 0))
  }

  return filtered
})

onMounted(async () => {
  if (sweetMemoriesStorage.memories.length === 0) {
    loading.value = true
    await sweetMemoriesStorage.loadMemories()
    loading.value = false
  } else {
    loading.value = false
  }
})

const addMemory = () => {
  emit('add')
}

const editMemory = memory => {
  emit('edit', memory)
}

const deleteMemory = memory => {
  emit('delete', memory)
}

const toggleMenu = memoryId => {
  openMenuId.value = openMenuId.value === memoryId ? null : memoryId
}

const toggleVisibility = memory => {
  // TODO: API call to toggle visibility
  memory.visible = !memory.visible
  console.log('Toggle visibility:', memory.id)
}

const duplicateMemory = memory => {
  // TODO: Implement duplicate functionality
  console.log('Duplicate memory:', memory.id)
}

const handleOrderChange = () => {
  emit('order-changed', filteredMemories.value)
}

const clearFilters = () => {
  emit('clear-filters')
}

const getYearsAgo = year => {
  const currentYear = new Date().getFullYear()
  const yearsAgo = currentYear - parseInt(year)

  if (yearsAgo === 0) return 'This year'
  if (yearsAgo === 1) return '1 year ago'
  return `${yearsAgo} years ago`
}

const getReactionCount = (memory, type) => {
  // MOCK - TODO: Get from reactions table grouped by type
  const total = memory.reactions || 0
  const distribution = {
    love: Math.floor(total * 0.5),
    heart_eyes: Math.floor(total * 0.3),
    pleading: Math.floor(total * 0.2)
  }
  return distribution[type] || 0
}

const handleToggleVisibility = memory => {
  toggleVisibility(memory)
  openMenuId.value = null
}

const handleDuplicate = memory => {
  duplicateMemory(memory)
  openMenuId.value = null
}

const handleDelete = memory => {
  deleteMemory(memory)
  openMenuId.value = null
}

const viewFull = memory => {
  if (!memory.imagePath) return

  const container = document.createElement('div')
  const dynamicGallery = lightGallery(container, {
    dynamic: true,
    dynamicEl: [
      {
        src: memory.imagePath,
        thumb: memory.imagePath,
        subHtml: `<h4>${memory.title || ''}</h4><p>${memory.description || ''}</p>`
      }
    ],
    plugins: [lgThumbnail],
    mobileSettings: {
      controls: true,
      showCloseIcon: true,
      download: true
    }
  })

  container.addEventListener('lgAfterClose', () => {
    dynamicGallery.destroy()
  })

  dynamicGallery.openGallery(0)
}
</script>
