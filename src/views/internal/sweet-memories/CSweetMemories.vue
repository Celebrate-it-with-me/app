<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
        <Camera class="w-8 h-8 mr-3 text-primary-600" />
        Sweet Memories
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Create a timeline of special moments to share the honoree's story
      </p>
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
    <CSweetMemoriesList
      v-else
      @add="addNewMemory"
      @edit="editMemory"
      @delete="deleteMemory"
      @order-changed="handleOrderChange"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Camera } from 'lucide-vue-next'

import CSweetMemoriesForm from '@/views/internal/sweet-memories/CSweetMemoriesForm.vue'
import CSweetMemoriesList from '@/views/internal/sweet-memories/CSweetMemoriesList.vue'
import { useSweetMemoriesStore } from '@/stores/useSweetMemoriesStore'

const sweetMemoriesStorage = useSweetMemoriesStore()
const memories = ref([])
const showForm = ref(false)
const isEditing = ref(false)
const currentMemory = ref({
  id: null,
  imageUrl: '',
  title: '',
  description: '',
  year: '',
  visible: true
})

const addNewMemory = () => {
  const newId = memories.value.length ? Math.max(...memories.value.map(m => m.id)) + 1 : 1
  currentMemory.value = {
    id: newId,
    imageUrl: '',
    title: '',
    description: '',
    year: '',
    visible: true
  }
  isEditing.value = false
  showForm.value = true
}

const editMemory = memory => {
  currentMemory.value = { ...memory }
  isEditing.value = true
  showForm.value = true
}

const saveMemory = memory => {
  if (isEditing.value) {
    // Update existing memory
    const index = memories.value.findIndex(m => m.id === memory.id)
    if (index !== -1) {
      memories.value[index] = memory
    }
  } else {
    // Add new memory
    memories.value.push(memory)
  }
  showForm.value = false
}

const deleteMemory = memory => {
  memories.value = memories.value.filter(m => m.id !== memory.id)
  if (showForm.value) {
    showForm.value = false
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
