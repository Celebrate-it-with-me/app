<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { useTodoStore } from '@/stores/todoStore'
import TextField from '@/components/UI/form/TextField.vue'
import TextAreaField from '@/components/UI/form/TextAreaField.vue'
import DateField from '@/components/UI/form/DateField.vue'
import SelectField from '@/components/UI/form/SelectField.vue'
import CButton from '@/components/UI/buttons/CButton.vue'

const todoStore = useTodoStore()
const isAddingTask = ref(false)

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
</script>

<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Event Tasks</h2>
      <CButton 
        @click="isAddingTask = !isAddingTask" 
        :variant="isAddingTask ? 'secondary' : 'primary'"
        size="sm"
      >
        {{ isAddingTask ? 'Cancel' : 'Add Task' }}
      </CButton>
    </div>

    <!-- Add new task form -->
    <div v-if="isAddingTask" class="mb-4 p-4 bg-gray-50 rounded-md">
      <div class="mb-3">
        <TextField
          v-model="newTask.title"
          placeholder="Task title"
          class="w-full"
        />
      </div>
      
      <div class="mb-3">
        <TextAreaField
          v-model="newTask.description"
          placeholder="Task description (optional)"
          rows="2"
          class="w-full"
        />
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <DateField
            v-model="newTask.dueDate"
            placeholder="Due date (optional)"
            class="w-full"
          />
        </div>
        
        <div>
          <SelectField
            v-model="newTask.priority"
            :options="priorityOptions"
            class="w-full"
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
              <input
                type="checkbox"
                :checked="task.completed"
                @change="toggleTaskCompletion(task.id)"
                class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
            <div class="ml-3 flex-grow">
              <div class="flex justify-between">
                <h3 class="font-medium" :class="{ 'line-through text-gray-400': task.completed }">
                  {{ task.title }}
                </h3>
                <button @click="removeTask(task.id)" class="text-gray-400 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
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
  </div>
</template>

<style scoped>
/* Any additional custom styling can go here */
</style>

<style scoped>

</style>
