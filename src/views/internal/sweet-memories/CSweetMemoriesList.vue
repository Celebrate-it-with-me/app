<template>
  <div>
    <!-- Add Memory Button -->
    <div v-if="memories.length > 0" class="mb-6 flex justify-end">
      <CButton variant="primary" class="flex items-center" @click="addMemory">
        <Plus class="w-5 h-5 mr-2" />
        Add Memory
      </CButton>
    </div>

    <NoSweetMemories v-if="memories?.length === 0" @add-first-memory="addMemory" />

    <!-- Draggable Memories -->
    <draggable
      v-if="memories?.length > 0"
      class="space-y-6"
      :list="memories"
      item-key="id"
      handle=".drag-handle"
      @change="$emit('order-changed', memories)"
    >
      <template #header></template>
      <template #footer></template>
      <div v-for="memory in memories" :key="memory.id">
        <CCard class="relative">
          <div class="p-6">
            <div class="absolute top-4 left-4 cursor-move drag-handle">
              <GripVertical class="w-6 h-6 text-gray-400" />
            </div>

            <div class="ml-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    v-if="memory.imageUrl"
                    :src="memory.imageUrl"
                    alt="Memory photo"
                    class="w-full h-auto rounded-lg object-cover max-h-64"
                  />
                  <div
                    v-else
                    class="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
                  >
                    <ImageIcon class="w-12 h-12 text-gray-400" />
                  </div>
                </div>

                <!-- Memory Details -->
                <div class="space-y-4">
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    {{ memory.title || 'Untitled Memory' }}
                  </h3>
                  <p v-if="memory.year" class="text-sm text-gray-600 dark:text-gray-400">
                    {{ memory.year }}
                  </p>
                  <p class="text-gray-700 dark:text-gray-300">
                    {{ memory.description || 'No description provided.' }}
                  </p>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <span class="text-sm text-gray-700 dark:text-gray-300">
                        {{ memory.visible ? 'Visible' : 'Hidden' }}
                      </span>
                    </div>
                    <div class="flex space-x-2">
                      <CButton
                        variant="secondary"
                        size="sm"
                        class="flex items-center"
                        @click="editMemory(memory)"
                      >
                        <Edit class="w-4 h-4 mr-1" />
                        Edit
                      </CButton>
                      <CButton
                        variant="danger"
                        size="sm"
                        class="flex items-center"
                        @click="deleteMemory(memory)"
                      >
                        <Trash2 class="w-4 h-4 mr-1" />
                        Delete
                      </CButton>
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

<script setup>
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import { Plus, Trash2, GripVertical, Edit, Image as ImageIcon } from 'lucide-vue-next'

import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import NoSweetMemories from '@/views/internal/sweet-memories/NoSweetMemories.vue'
import { useSweetMemoriesStore } from '@/stores/useSweetMemoriesStore'
import { computed } from 'vue'

const emit = defineEmits(['add', 'edit', 'delete', 'order-changed'])

const sweetMemoriesStorage = useSweetMemoriesStore()

const memories = computed(() => {
  return sweetMemoriesStorage.memories || []
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
</script>
