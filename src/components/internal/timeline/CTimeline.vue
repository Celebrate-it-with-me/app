<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Event Timeline</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Define the timeline for your event by adding activities with start and end times
      </p>
    </div>

    <!-- Add new timeline item button -->
    <div class="mb-6">
      <CButton variant="gradient" @click="openAddModal">
        <PlusCircle class="w-4 h-4 mr-2" />
        Add Timeline Item
      </CButton>
    </div>

    <!-- Empty state -->
    <CCard v-if="timelineItems.length === 0" class="mb-6">
      <div class="flex flex-col items-center justify-center py-12">
        <Calendar class="w-16 h-16 text-gray-400 mb-4" />
        <h3 class="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
          You haven't added any timeline items yet.
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
          Create a timeline to help your guests know what to expect during your event.
        </p>
        <CButton variant="gradient" class="mt-2" @click="openAddModal">
          <PlusCircle class="w-4 h-4 mr-2" />
          Add First Timeline Entry
        </CButton>
      </div>
    </CCard>

    <!-- Timeline items list -->
    <div v-else class="relative">
      <!-- Timeline vertical line -->
      <div
        class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -ml-0.5 hidden md:block"
      ></div>

      <!-- Timeline items -->
      <div class="space-y-8">
        <div v-for="(item, index) in sortedTimelineItems" :key="index" class="relative">
          <!-- Timeline dot for desktop -->
          <div
            class="absolute left-1/2 top-6 w-4 h-4 rounded-full bg-primary -ml-2 hidden md:block"
          ></div>

          <!-- Timeline item card -->
          <div
            class="md:w-5/12 transition-all duration-300"
            :class="[index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto']"
          >
            <CCard variant="feature" class="transition-all duration-300 hover:shadow-md">
              <template #title>
                <div class="flex justify-between items-start">
                  <div class="flex items-center">
                    <component
                      :is="getIconComponent(item.icon)"
                      v-if="item.icon"
                      class="w-5 h-5 mr-2 text-primary"
                    />
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                      {{ item.title }}
                    </h3>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      class="text-gray-500 hover:text-primary transition-colors"
                      title="Edit"
                      @click="editItem(item)"
                    >
                      <Edit class="w-4 h-4" />
                    </button>
                    <button
                      class="text-gray-500 hover:text-red-500 transition-colors"
                      title="Delete"
                      @click="confirmDelete(item)"
                    >
                      <Trash class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </template>

              <template #content>
                <div class="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <Clock class="w-4 h-4 mr-2" />
                  <span>{{ formatTimeRange(item.startTime, item.endTime) }}</span>
                </div>
                <p v-if="item.description" class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {{ item.description }}
                </p>
              </template>
            </CCard>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <CModal v-model="showModal" :show-footer="false">
      <template #title>{{ isEditing ? 'Edit Timeline Item' : 'Add Timeline Item' }}</template>

      <form class="space-y-4" @submit.prevent="saveItem">
        <CInput
          id="title"
          v-model="currentItem.title"
          name="title"
          label="Activity Title"
          placeholder="e.g., Reception, Ceremony, Dinner"
          :show-error="true"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CDate
            v-model="currentItem.startTime"
            name="startTime"
            label="Start Time"
            placeholder="Select start time"
            :also-time="true"
          />

          <CDate
            v-model="currentItem.endTime"
            name="endTime"
            label="End Time"
            placeholder="Select end time"
            :also-time="true"
          />
        </div>

        <!-- Icon Selector -->
        <div class="mb-4">
          <CSelect
            id="icon-selector"
            v-model="currentItem.icon"
            name="icon"
            label="Activity Icon (Optional)"
            :options="availableIcons"
          />

          <!-- Icon Preview -->
          <div v-if="currentItem.icon" class="mt-2 flex items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400 mr-2">Icon Preview:</span>
            <component :is="getIconComponent(currentItem.icon)" class="w-5 h-5 text-primary" />
          </div>
        </div>

        <CTextarea
          id="description"
          v-model="currentItem.description"
          name="description"
          label="Description (Optional)"
          placeholder="Add any details or notes about this activity"
          :rows="3"
        />

        <div v-if="validationError" class="text-red-500 text-sm mt-2">
          {{ validationError }}
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <CButton variant="ghost" @click="closeModal">Cancel</CButton>
          <CButton type="submit" variant="gradient">{{ isEditing ? 'Update' : 'Add' }}</CButton>
        </div>
      </form>
    </CModal>

    <!-- Delete Confirmation Modal -->
    <CConfirmModal
      v-model="showDeleteModal"
      title="Delete Timeline Item"
      message="Are you sure you want to delete this timeline item? This action cannot be undone."
      @confirm="deleteItem"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Clock,
  Edit,
  Trash,
  PlusCircle,
  Calendar,
  Music,
  Utensils,
  Camera,
  Gift,
  Cake,
  GlassWater,
  MicVocal,
  PartyPopper,
  Users
} from 'lucide-vue-next'
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import CDate from '@/components/UI/form2/CDate.vue'
import CModal from '@/components/UI/modals/CModal.vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'

// Available icons for timeline items
const availableIcons = [
  { value: 'Calendar', label: 'Calendar' },
  { value: 'Clock', label: 'Clock' },
  { value: 'Utensils', label: 'Dining' },
  { value: 'Music', label: 'Music' },
  { value: 'Camera', label: 'Photography' },
  { value: 'Gift', label: 'Gift' },
  { value: 'Cake', label: 'Cake' },
  { value: 'GlassWater', label: 'Drinks' },
  { value: 'Microphone', label: 'Speech' },
  { value: 'PartyPopper', label: 'Celebration' },
  { value: 'Users', label: 'Guests' }
]

// Get icon component by name
const getIconComponent = iconName => {
  if (!iconName) return Clock

  const iconMap = {
    Calendar,
    Clock,
    Utensils,
    Music,
    Camera,
    Gift,
    Cake,
    GlassWater,
    MicVocal,
    PartyPopper,
    Users
  }

  return iconMap[iconName] || Clock
}

// Mock data for timeline items
const timelineItems = ref([
  {
    id: 1,
    title: 'Guest Arrival & Welcome Drinks',
    startTime: '05/15/2023 16:00',
    endTime: '05/15/2023 17:00',
    description: 'Welcome guests with signature cocktails and appetizers',
    icon: 'GlassWater'
  },
  {
    id: 2,
    title: 'Ceremony',
    startTime: '05/15/2023 17:30',
    endTime: '05/15/2023 18:30',
    description: 'Main ceremony in the garden area',
    icon: 'PartyPopper'
  },
  {
    id: 3,
    title: 'Dinner Service',
    startTime: '05/15/2023 19:00',
    endTime: '05/15/2023 21:00',
    description: 'Three-course meal with wine pairing',
    icon: 'Utensils'
  }
])

// Sort timeline items by start time
const sortedTimelineItems = computed(() => {
  return [...timelineItems.value].sort((a, b) => {
    return new Date(a.startTime) - new Date(b.startTime)
  })
})

// Modal state
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const validationError = ref('')

// Current item being edited or added
const currentItem = ref({
  id: null,
  title: '',
  startTime: '',
  endTime: '',
  description: '',
  icon: ''
})

// Item to be deleted
const itemToDelete = ref(null)

// Format time range for display
const formatTimeRange = (start, end) => {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const options = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }

  return `${startDate.toLocaleTimeString('en-US', options)} - ${endDate.toLocaleTimeString('en-US', options)}`
}

// Open modal to add new item
const openAddModal = () => {
  isEditing.value = false
  currentItem.value = {
    id: Date.now(), // Generate a unique ID
    title: '',
    startTime: '',
    endTime: '',
    description: '',
    icon: ''
  }
  validationError.value = ''
  showModal.value = true
}

// Open modal to edit existing item
const editItem = item => {
  isEditing.value = true
  currentItem.value = { ...item }
  validationError.value = ''
  showModal.value = true
}

// Close the modal
const closeModal = () => {
  showModal.value = false
}

// Validate and save the item
const saveItem = () => {
  // Validate required fields
  if (!currentItem.value.title) {
    validationError.value = 'Activity title is required'
    return
  }

  if (!currentItem.value.startTime) {
    validationError.value = 'Start time is required'
    return
  }

  if (!currentItem.value.endTime) {
    validationError.value = 'End time is required'
    return
  }

  // Validate end time is after start time
  const startTime = new Date(currentItem.value.startTime)
  const endTime = new Date(currentItem.value.endTime)

  if (endTime <= startTime) {
    validationError.value = 'End time must be after start time'
    return
  }

  // Save the item
  if (isEditing.value) {
    // Update existing item
    const index = timelineItems.value.findIndex(item => item.id === currentItem.value.id)
    if (index !== -1) {
      timelineItems.value[index] = { ...currentItem.value }
    }
  } else {
    // Add new item
    timelineItems.value.push({ ...currentItem.value })
  }

  // Close the modal
  showModal.value = false
}

// Confirm deletion of an item
const confirmDelete = item => {
  itemToDelete.value = item
  showDeleteModal.value = true
}

// Delete the item
const deleteItem = () => {
  if (itemToDelete.value) {
    timelineItems.value = timelineItems.value.filter(item => item.id !== itemToDelete.value.id)
    itemToDelete.value = null
    showDeleteModal.value = false
  }
}
</script>
