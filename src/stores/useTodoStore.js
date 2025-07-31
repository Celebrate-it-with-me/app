import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Todo store for managing tasks
 */
export const useTodoStore = defineStore(
  'todo',
  () => {
    /**
     * List of tasks
     * @type {import('vue').Ref<Array>}
     */
    const tasks = ref([])

    /**
     * Add a new task
     * @param {Object} task - Task to add
     * @param {string} task.title - Task title
     * @param {string} task.description - Task description
     * @param {Date|string|null} [task.dueDate=null] - Due date
     * @param {string} [task.priority='medium'] - Task priority
     */
    function addTask(task) {
      tasks.value.push({
        id: Date.now(),
        title: task.title,
        description: task.description,
        completed: false,
        dueDate: task.dueDate || null,
        priority: task.priority || 'medium',
        createdAt: new Date()
      })
    }

    /**
     * Update an existing task
     * @param {number} id - Task ID
     * @param {Object} updatedTask - Updated task properties
     */
    function updateTask(id, updatedTask) {
      const index = tasks.value.findIndex(task => task.id === id)
      if (index !== -1) {
        tasks.value[index] = { ...tasks.value[index], ...updatedTask }
      }
    }

    /**
     * Remove a task
     * @param {number} id - Task ID
     */
    function removeTask(id) {
      tasks.value = tasks.value.filter(task => task.id !== id)
    }

    /**
     * Toggle task completion status
     * @param {number} id - Task ID
     */
    function toggleTaskCompletion(id) {
      const task = tasks.value.find(task => task.id === id)
      if (task) {
        task.completed = !task.completed
      }
    }

    /**
     * Reset the store to its initial state
     */
    function reset() {
      tasks.value = []
    }

    return {
      tasks,
      addTask,
      updateTask,
      removeTask,
      toggleTaskCompletion,
      reset
    }
  },
  {
    persist: {
      key: 'todo-store',
      storage: localStorage
    }
  }
)
