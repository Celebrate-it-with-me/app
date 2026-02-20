// All comments in code are in English, as requested.

import { ref, computed, onMounted } from 'vue'
import { useSweetMemoriesStore } from '@/modules/sweet-memories/stores/useSweetMemoriesStore'

export function useSweetMemoriesAdminController() {
  const sweetMemoriesStore = useSweetMemoriesStore()

  // UI state
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

  // Filters
  const searchQuery = ref('')
  const yearFilter = ref('')
  const sortOrder = ref('newest')

  const clearFilters = () => {
    searchQuery.value = ''
    yearFilter.value = ''
  }

  // Store derived
  const hasMemories = computed(() => sweetMemoriesStore.memories.length > 0)
  const totalMemories = computed(() => sweetMemoriesStore.memories.length)
  const showStats = computed(() => !showForm.value && hasMemories.value)

  // Available years
  const availableYears = computed(() => {
    const years = [...new Set(sweetMemoriesStore.memories.map(m => m.year).filter(Boolean))]
    return years.sort((a, b) => b - a)
  })

  // Mock stats (until backend exists)
  const mockTotalReactions = computed(() =>
    sweetMemoriesStore.memories.reduce((acc, m) => acc + (m.reactions || 0), 0)
  )

  const mockTotalViews = computed(() =>
    sweetMemoriesStore.memories.reduce((acc, m) => acc + (m.views || 0), 0)
  )

  // Actions
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
      image: []
    }
    isEditing.value = true
    showForm.value = true
  }

  const saveMemory = async () => {
    showForm.value = false
  }

  const deleteMemory = async memory => {
    if (!confirm('Are you sure you want to delete this memory?')) return

    const response = await sweetMemoriesStore.deleteSweetMemory(memory.id)

    if (response.status >= 200 && response.status < 300) {
      showForm.value = false
    }
  }

  const cancelEdit = () => {
    showForm.value = false
  }

  const handleOrderChange = newOrder => {
    console.log('New order', newOrder)
  }

  // Init
  onMounted(async () => {
    await sweetMemoriesStore.loadMemories()
  })

  return {
    // state
    showForm,
    isEditing,
    currentMemory,

    // filters
    searchQuery,
    yearFilter,
    sortOrder,
    availableYears,
    clearFilters,

    // computed
    hasMemories,
    totalMemories,
    showStats,
    mockTotalReactions,
    mockTotalViews,

    // actions
    addNewMemory,
    editMemory,
    saveMemory,
    deleteMemory,
    cancelEdit,
    handleOrderChange
  }
}
