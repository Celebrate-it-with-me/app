<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Calendar, Clock, Plus, Edit, Trash2, AlertCircle, Loader2, ArrowUpRight } from 'lucide-vue-next'
import CButton from '@/components/UI/buttons/CButton.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import CDate from '@/components/UI/form2/CDate.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'

// Mock data - would be replaced with actual API calls
const timelineItems = ref([
  {
    id: 1,
    title: 'Guest Arrival',
    description: 'Guests arrive and check in',
    time: '2023-12-15 16:00',
    duration: 60,
    category: 'arrival'
  },
  {
    id: 2,
    title: 'Welcome Drinks',
    description: 'Cocktail hour with appetizers',
    time: '2023-12-15 17:00',
    duration: 60,
    category: 'reception'
  },
  {
    id: 3,
    title: 'Dinner Service',
    description: 'Formal dinner service begins',
    time: '2023-12-15 18:00',
    duration: 90,
    category: 'meal'
  },
  {
    id: 4,
    title: 'Speeches & Toasts',
    description: 'Welcome speeches and toasts',
    time: '2023-12-15 19:30',
    duration: 30,
    category: 'program'
  },
  {
    id: 5,
    title: 'Entertainment',
    description: 'Live band performance',
    time: '2023-12-15 20:00',
    duration: 120,
    category: 'entertainment'
  }
])

// Component state
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const isAddingItem = ref(false)
const editingItemId = ref(null)

// New timeline item form
const newItem = ref({
  title: '',
  description: '',
  time: null,
  duration: 60,
  category: 'program'
})

// Category options
const categoryOptions = [
  { value: 'arrival', label: 'Arrival & Check-in' },
  { value: 'reception', label: 'Reception' },
  { value: 'meal', label: 'Meal Service' },
  { value: 'program', label: 'Program' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'photo', label: 'Photography' },
  { value: 'transition', label: 'Transition' },
  { value: 'other', label: 'Other' }
]

// Duration options
const durationOptions = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 hours' }
]

// Methods
const addTimelineItem = () => {
  if (!newItem.value.title || !newItem.value.time) {
    return
  }

  const id = Math.max(0, ...timelineItems.value.map(item => item.id)) + 1

  timelineItems.value.push({
    id,
    title: newItem.value.title,
    description: newItem.value.description,
    time: newItem.value.time,
    duration: Number(newItem.value.duration),
    category: newItem.value.category
  })

  // Sort timeline items by time
  timelineItems.value.sort((a, b) => new Date(a.time) - new Date(b.time))

  // Reset form
  newItem.value = {
    title: '',
    description: '',
    time: null,
    duration: 60,
    category: 'program'
  }

  // Close add item form
  isAddingItem.value = false
}

const editTimelineItem = (id) => {
  const item = timelineItems.value.find(item => item.id === id)
  if (item) {
    newItem.value = { ...item }
    editingItemId.value = id
    isAddingItem.value = true
  }
}

const updateTimelineItem = () => {
  if (!newItem.value.title || !newItem.value.time) {
    return
  }

  const index = timelineItems.value.findIndex(item => item.id === editingItemId.value)
  if (index !== -1) {
    timelineItems.value[index] = {
      id: editingItemId.value,
      title: newItem.value.title,
      description: newItem.value.description,
      time: newItem.value.time,
      duration: Number(newItem.value.duration),
      category: newItem.value.category
    }

    // Sort timeline items by time
    timelineItems.value.sort((a, b) => new Date(a.time) - new Date(b.time))

    // Reset form
    newItem.value = {
      title: '',
      description: '',
      time: null,
      duration: 60,
      category: 'program'
    }

    // Close edit form
    isAddingItem.value = false
    editingItemId.value = null
  }
}

const removeTimelineItem = (id) => {
  timelineItems.value = timelineItems.value.filter(item => item.id !== id)
}

const cancelForm = () => {
  newItem.value = {
    title: '',
    description: '',
    time: null,
    duration: 60,
    category: 'program'
  }
  isAddingItem.value = false
  editingItemId.value = null
}

// Format time for display
const formatTime = (timeString) => {
  try {
    const date = new Date(timeString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch (error) {
    return timeString
  }
}

// Format date for display
const formatDate = (timeString) => {
  try {
    const date = new Date(timeString)
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  } catch (error) {
    return timeString
  }
}

// Get category color
const getCategoryColor = (category) => {
  const colorMap = {
    arrival: 'blue',
    reception: 'purple',
    meal: 'orange',
    program: 'green',
    entertainment: 'pink',
    photo: 'indigo',
    transition: 'gray',
    other: 'gray'
  }
  return colorMap[category] || 'gray'
}

// Load timeline data
const loadTimelineData = () => {
  isLoading.value = true
  hasError.value = false

  // Simulate API call
  setTimeout(() => {
    // In a real implementation, you would fetch data from an API
    isLoading.value = false
  }, 500)
}

// Event listener for dashboard refresh
const handleDashboardRefresh = () => {
  loadTimelineData()
}

// Lifecycle hooks
onMounted(() => {
  // Initial data load
  loadTimelineData()

  // Listen for dashboard refresh events
  document.addEventListener('dashboard-refresh', handleDashboardRefresh)
})

onBeforeUnmount(() => {
  // Clean up event listener
  document.removeEventListener('dashboard-refresh', handleDashboardRefresh)
})
</script>

<template>
  <section
    class="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl relative overflow-hidden"
    :class="{ 'opacity-75': isLoading }"
    aria-labelledby="timeline-title"
  >
    <!-- Loading overlay -->
    <div v-if="isLoading" class="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-70 flex items-center justify-center z-10">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div
        class="flex items-center gap-2 text-blue-600 font-semibold text-sm bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-full"
        id="timeline-title"
      >
        <Calendar class="w-4 h-4" aria-hidden="true" />
        <span>Event Timeline</span>
      </div>
      <CButton
        @click="isAddingItem = !isAddingItem; editingItemId = null"
        :variant="isAddingItem ? 'secondary' : 'primary'"
        size="sm"
        class="rounded-full flex items-center gap-1 transition-transform hover:scale-105"
      >
        <Plus v-if="!isAddingItem" class="w-4 h-4" aria-hidden="true" />
        <span>{{ isAddingItem ? 'Cancel' : 'Add Item' }}</span>
      </CButton>
    </div>

    <!-- Error state -->
    <div v-if="hasError" class="text-center py-4">
      <div class="text-red-500 mb-2">
        <AlertCircle class="h-10 w-10 mx-auto" aria-hidden="true" />
      </div>
      <p class="text-red-600 dark:text-red-400 font-medium">{{ errorMessage }}</p>
      <button
        @click="loadTimelineData"
        class="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
        aria-label="Retry loading timeline data"
      >
        Try again
      </button>
    </div>

    <!-- Add/Edit timeline item form -->
    <div v-if="isAddingItem" class="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
      <div class="mb-3">
        <CInput
          v-model="newItem.title"
          name="title"
          placeholder="Event title"
          class="w-full"
        />
      </div>

      <div class="mb-3">
        <CTextarea
          v-model="newItem.description"
          name="description"
          placeholder="Description (optional)"
          :rows="2"
          class="w-full"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <CDate
            v-model="newItem.time"
            name="time"
            placeholder="Date and time"
            class="w-full"
          />
        </div>
        <div>
          <CSelect
            v-model="newItem.duration"
            name="duration"
            placeholder="Duration"
            :options="durationOptions"
            class="w-full"
          />
        </div>
      </div>

      <div class="mb-3">
        <CSelect
          v-model="newItem.category"
          name="category"
          placeholder="Category"
          :options="categoryOptions"
          class="w-full"
        />
      </div>

      <div class="flex justify-end gap-2">
        <CButton
          @click="cancelForm"
          variant="secondary"
        >
          Cancel
        </CButton>
        <CButton
          @click="editingItemId ? updateTimelineItem() : addTimelineItem()"
          variant="primary"
          :disabled="!newItem.title || !newItem.time"
        >
          {{ editingItemId ? 'Update Item' : 'Add Item' }}
        </CButton>
      </div>
    </div>

    <!-- Timeline -->
    <div class="overflow-y-auto max-h-80">
      <div v-if="timelineItems.length === 0" class="text-center py-8 text-gray-500">
        <Clock class="w-12 h-12 mx-auto text-gray-300 mb-2" />
        <p>No timeline items yet</p>
        <p class="text-sm mt-1">Add your first event to start building your timeline</p>
      </div>

      <div v-else class="relative pl-8 space-y-6 before:absolute before:top-0 before:bottom-0 before:left-4 before:w-0.5 before:bg-blue-100 dark:before:bg-blue-900">
        <div
          v-for="item in timelineItems"
          :key="item.id"
          class="relative"
        >
          <!-- Timeline dot -->
          <div
            class="absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center"
            :class="`bg-${getCategoryColor(item.category)}-100 dark:bg-${getCategoryColor(item.category)}-900`"
          >
            <div
              class="w-3 h-3 rounded-full"
              :class="`bg-${getCategoryColor(item.category)}-500`"
            ></div>
          </div>

          <!-- Timeline content -->
          <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">{{ item.title }}</h3>
                <p v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ item.description }}</p>
              </div>
              <div class="flex gap-1">
                <button @click="editTimelineItem(item.id)" class="text-blue-500 hover:text-blue-700 p-1">
                  <Edit class="w-4 h-4" />
                </button>
                <button @click="removeTimelineItem(item.id)" class="text-red-500 hover:text-red-700 p-1">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="flex items-center mt-2 text-sm">
              <span
                class="px-2 py-1 rounded-md text-xs font-medium mr-2"
                :class="`bg-${getCategoryColor(item.category)}-100 text-${getCategoryColor(item.category)}-800 dark:bg-${getCategoryColor(item.category)}-900 dark:text-${getCategoryColor(item.category)}-200`"
              >
                {{ categoryOptions.find(c => c.value === item.category)?.label || item.category }}
              </span>
              <div class="flex items-center text-gray-500 dark:text-gray-400">
                <Calendar class="w-3 h-3 mr-1" />
                <span>{{ formatDate(item.time) }}</span>
              </div>
              <div class="flex items-center text-gray-500 dark:text-gray-400 ml-3">
                <Clock class="w-3 h-3 mr-1" />
                <span>{{ formatTime(item.time) }}</span>
              </div>
              <div class="text-gray-500 dark:text-gray-400 ml-3">
                <span>{{ item.duration }} min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View full timeline link -->
    <div class="mt-4 text-right">
      <a href="#" class="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center">
        View Full Timeline
        <ArrowUpRight class="w-3 h-3 ml-1" />
      </a>
    </div>

    <!-- Loading indicator when refreshing with existing data -->
    <div v-if="isLoading" class="absolute bottom-4 right-4 flex items-center justify-center">
      <Loader2 class="w-4 h-4 text-blue-500 animate-spin" aria-hidden="true" />
      <span class="ml-2 text-xs text-gray-500">Refreshing...</span>
    </div>
  </section>
</template>
