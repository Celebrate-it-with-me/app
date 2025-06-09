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

    <!-- Add Memory Button -->
    <div class="mb-6 flex justify-end">
      <CButton variant="primary" class="flex items-center" @click="addMemory">
        <Plus class="w-5 h-5 mr-2" />
        Add Memory
      </CButton>
    </div>

    <!-- Empty State -->
    <CCard v-if="!hasMemories" class="mb-6">
      <div class="p-8 text-center">
        <ImageIcon class="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No memories yet</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Start creating your sweet memories timeline by adding your first memory.
        </p>
        <CButton variant="primary" @click="addMemory" class="flex items-center mx-auto">
          <Plus class="w-5 h-5 mr-2" />
          Add Your First Memory
        </CButton>
      </div>
    </CCard>

    <!-- Draggable Memories -->
    <draggable
      v-if="hasMemories"
      class="space-y-6"
      :list="memories"
      item-key="id"
      handle=".drag-handle"
    >
      <template #header></template>
      <template #footer></template>
      <div
        v-for="memory in memories"
        :key="memory.id"
      >
        <CCard class="relative">
          <div class="p-6">
            <!-- Drag Handle -->
            <div class="absolute top-4 left-4 cursor-move drag-handle">
              <GripVertical class="w-6 h-6 text-gray-400" />
            </div>

            <div class="ml-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Image Upload -->
                <div>
                  <CImageUpload
                    :model-value="memory.imageUrl ? [memory.imageUrl] : []"
                    name="memory-image"
                    label="Memory Photo"
                    description="Upload a photo for this memory"
                    :preview-url="memory.imageUrl"
                    class="mb-4"
                    @update:model-value="files => handleImageUpload(memory, files)"
                  />
                </div>

                <!-- Memory Details -->
                <div class="space-y-4">
                  <CInput
                    id="memory-title"
                    v-model="memory.title"
                    name="memoryTitle"
                    label="Title"
                    placeholder="e.g., First Day of School"
                  />
                  <CInput
                    id="memory-year"
                    v-model="memory.year"
                    label="Year or Age (Optional)"
                    placeholder="e.g., 2010 or Age 6"
                    name="memoryYear"
                  />
                  <CTextarea
                    id="memory-description"
                    v-model="memory.description"
                    name="memoryDescription"
                    label="Description (Optional)"
                    placeholder="Share the story behind this memory..."
                    rows="4"
                  />
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <CToggle id="memory-visible" v-model="memory.visible" name="memoryVisible" />
                      <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {{ memory.visible ? 'Visible' : 'Hidden' }}
                      </span>
                    </div>
                    <CButton
                      variant="danger"
                      size="sm"
                      class="flex items-center"
                      @click="confirmDelete(memory)"
                    >
                      <Trash2 class="w-4 h-4 mr-1" />
                      Delete
                    </CButton>
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

<script>
import { ref, computed } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import { Camera, Plus, Trash2, GripVertical, Image as ImageIcon } from 'lucide-vue-next'

import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import CImageUpload from '@/components/UI/form2/CImageUpload.vue'

export default {
  components: {
    draggable,
    CCard,
    CButton,
    CInput,
    CTextarea,
    CToggle,
    CImageUpload,
    Camera,
    Plus,
    Trash2,
    GripVertical,
    ImageIcon
  },
  setup() {
    const memories = ref([
      {
        id: 1,
        imageUrl:
          'https://images.unsplash.com/photo-1512759144186-5b5e22fc5457?auto=format&fit=crop&w=1470&q=80',
        title: 'First Day of School',
        description:
          "Maria was so excited for her first day of kindergarten. She picked out her outfit the night before and couldn't wait to make new friends.",
        year: '2010',
        visible: true
      },
      {
        id: 2,
        imageUrl:
          'https://images.unsplash.com/photo-1516627145497-ae6968895b40?auto=format&fit=crop&w=1440&q=80',
        title: 'Ballet Recital',
        description:
          'Her first time performing on stage. She practiced for months and was the star of the show!',
        year: 'Age 8',
        visible: true
      },
      {
        id: 3,
        imageUrl:
          'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1438&q=80',
        title: 'Family Vacation',
        description:
          'Our trip to the beach was unforgettable. Maria built the biggest sandcastle and spent hours collecting seashells.',
        year: '2015',
        visible: true
      }
    ])

    // Check if there are any memories
    const hasMemories = computed(() => {
      return memories.value.length > 0
    })

    const handleImageUpload = (memory, files) => {
      if (files.length > 0) {
        const file = files[0]
        memory.imageUrl = URL.createObjectURL(file)
      }
    }

    const confirmDelete = memory => {
      memories.value = memories.value.filter(m => m.id !== memory.id)
    }

    const addMemory = () => {
      const newId = memories.value.length
        ? Math.max(...memories.value.map(m => m.id)) + 1
        : 1
      memories.value.push({
        id: newId,
        imageUrl: '',
        title: '',
        description: '',
        year: '',
        visible: true
      })
    }

    return {
      memories,
      hasMemories,
      handleImageUpload,
      confirmDelete,
      addMemory
    }
  }
}
</script>
