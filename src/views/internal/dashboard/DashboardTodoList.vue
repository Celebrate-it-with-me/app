<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { format } from 'date-fns'
import { useTodoStore } from '@/stores/todoStore'
import CInput from '@/components/UI/form2/CInput.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import CDate from '@/components/UI/form2/CDate.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CCheckbox from '@/components/UI/form2/CCheckbox.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { CheckSquare, Plus, Trash2, Calendar, Info } from 'lucide-vue-next'

const todoStore = useTodoStore()
const isAddingTask = ref(false)
const isLoading = ref(true)

const newTask = ref({
  title: '',
  description: '',
  dueDate: null,
  priority: 'medium'
})

const filter = ref('all')

const filteredTasks = computed(() => {
  if (filter.value === 'all') {
    return todoStore.tasks
  } else if (filter.value === 'active') {
    return todoStore.tasks.filter(task => !task.completed)
  } else {
    return todoStore.tasks.filter(task => task.completed)
  }
})

const activeTasksCount = computed(() => {
  return todoStore.tasks.filter(task => !task.completed).length
})

const completedTasksCount = computed(() => {
  return todoStore.tasks.filter(task => task.completed).length
})

function addTask() {
  if (!newTask.value.title.trim()) return

  todoStore.addTask({
    title: newTask.value.title,
    description: newTask.value.description,
    dueDate: newTask.value.dueDate,
    priority: newTask.value.priority
  })

  // Reset form
  newTask.value = {
    title: '',
    description: '',
    dueDate: null,
    priority: 'medium'
  }

  // Close add task form
  isAddingTask.value = false
}

function toggleTaskCompletion(id) {
  todoStore.toggleTaskCompletion(id)
}

function removeTask(id) {
  todoStore.removeTask(id)
}

function formatDate(date) {
  return format(new Date(date), 'MMM d, yyyy')
}

function clearCompletedTasks() {
  todoStore.tasks.filter(task => task.completed).forEach(task => {
    todoStore.removeTask(task.id)
  })
}

const priorityOptions = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' }
]

// Load tasks
const loadTasks = () => {
  isLoading.value = true

  // Simulate loading delay (remove in production)
  setTimeout(() => {
    // In a real implementation, you might fetch tasks from an API here
    // todoStore.fetchTasks()
    isLoading.value = false
  }, 500)
}

// Event listener for dashboard refresh
const handleDashboardRefresh = () => {
  loadTasks()
}

// Lifecycle hooks
onMounted(() => {
  // Initial data load
  loadTasks()

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
    aria-labelledby="todo-list-title"
  >
    <!-- Loading overlay -->
    <div v-if="isLoading" class="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-70 flex items-center justify-center z-10">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div
        class="flex items-center gap-2 text-green-600 font-semibold text-sm bg-green-50 dark:bg-green-950 px-3 py-1.5 rounded-full"
        id="todo-list-title"
      >
        <CheckSquare class="w-4 h-4" aria-hidden="true" />
        <span>Event Tasks</span>
      </div>
      <CButton
        @click="isAddingTask = !isAddingTask"
        :variant="isAddingTask ? 'secondary' : 'primary'"
        size="sm"
        class="rounded-full flex items-center gap-1 transition-transform hover:scale-105"
      >
        <Plus v-if="!isAddingTask" class="w-4 h-4" aria-hidden="true" />
        <span>{{ isAddingTask ? 'Cancel' : 'Add Task' }}</span>
      </CButton>
    </div>

    <!-- Add new task form -->
    <div v-if="isAddingTask" class="mb-4 p-4 bg-gray-50 rounded-md">
      <div class="mb-3">
        <CInput
          v-model="newTask.title"
          name="title"
          placeholder="Task title"
          class="w-full"
          id="taskTitle"
        />
      </div>

      <div class="mb-3">
        <CTextarea
          v-model="newTask.description"
          name="description"
          placeholder="Task description (optional)"
          :rows="2"
          class="w-full"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <CDate
            v-model="newTask.dueDate"
            name="dueDate"
            placeholder="Due date (optional)"
            class="w-full"
          />
        </div>

        <div>
          <CSelect
            v-model="newTask.priority"
            name="priority"
            :options="priorityOptions"
            class="w-full"
            id="taskPriority"
          />
        </div>
      </div>

      <div class="flex justify-end">
        <CButton
          @click="addTask"
          variant="primary"
          :disabled="!newTask.title"
        >
          Save Task
        </CButton>
      </div>
    </div>

    <!-- Tasks filter -->
    <div class="flex space-x-2 mb-4">
      <button
        @click="filter = 'all'"
        class="px-3 py-1 text-sm rounded-md transition"
        :class="filter === 'all' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 hover:bg-gray-200'"
      >
        All
      </button>
      <button
        @click="filter = 'active'"
        class="px-3 py-1 text-sm rounded-md transition"
        :class="filter === 'active' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 hover:bg-gray-200'"
      >
        Active
      </button>
      <button
        @click="filter = 'completed'"
        class="px-3 py-1 text-sm rounded-md transition"
        :class="filter === 'completed' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 hover:bg-gray-200'"
      >
        Completed
      </button>
    </div>

    <!-- Tasks list -->
    <div class="overflow-y-auto max-h-80">
      <div v-if="filteredTasks.length > 0">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
          :class="{ 'bg-gray-50': task.completed }"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <CCheckbox
                :modelValue="task.completed"
                @update:modelValue="toggleTaskCompletion(task.id)"
                class="h-4 w-4"
              />
            </div>
            <div class="ml-3 flex-grow">
              <div class="flex justify-between">
                <h3 class="font-medium" :class="{ 'line-through text-gray-400': task.completed }">
                  {{ task.title }}
                </h3>
                <Trash2 @click="removeTask(task.id)" class="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer" />
              </div>
              <p v-if="task.description" class="text-sm text-gray-500 mt-1">
                {{ task.description }}
              </p>
              <div class="flex flex-wrap gap-2 mt-1.5">
                <span v-if="task.dueDate" class="inline-flex items-center text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {{ formatDate(task.dueDate) }}
                </span>
                <span
                  class="inline-flex items-center text-xs px-2 py-0.5 rounded"
                  :class="{
                    'bg-red-100 text-red-800': task.priority === 'high',
                    'bg-yellow-100 text-yellow-800': task.priority === 'medium',
                    'bg-green-100 text-green-800': task.priority === 'low'
                  }"
                >
                  {{ task.priority }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="py-6 text-center text-gray-500">
        <p>No tasks found</p>
      </div>
    </div>

    <!-- Tasks summary -->
    <div class="mt-4 pt-3 border-t text-sm text-gray-500 flex justify-between items-center">
      <p>{{ activeTasksCount }} tasks remaining</p>
      <button
        v-if="completedTasksCount > 0"
        @click="clearCompletedTasks"
        class="text-sm text-primary-600 hover:text-primary-800"
      >
        Clear completed
      </button>
    </div>
  </section>
</template>
