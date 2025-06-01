<script setup>
import { Calendar, Edit, Trash2, LayoutGrid, Table } from 'lucide-vue-next'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { computed, ref } from 'vue'
import { useBudgetStore } from '@/stores/useBudgetStore'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'

// Colors for categories (same as in BudgetSummary.vue)
const categoryColors = [
  '#3b82f6',
  '#8b5cf6',
  '#84cc16',
  '#f97316',
  '#ec4899',
  '#14b8a6',
  '#06b6d4',
  '#6366f1'
]

const emit = defineEmits(['openBudgetItemModal', 'openBudgetItemModal', 'deleteBudgetItem'])

const budgetStore = useBudgetStore()
const notificationStore = useNotificationStore()

const showConfirmDeleteModal = ref(false)
const deletingItemId = ref(null)
const viewMode = ref('table') // 'card' or 'table'

const hasBudgetItems = computed(() => budgetStore.hasBudgetItems)
const budgetItemsByCategory = computed(() => budgetStore.budgetItemsByCategory)

const toggleViewMode = mode => {
  viewMode.value = mode
}

const openEditBudgetItemModal = item => {
  console.log('Opening edit modal for item:', item)
  emit('openBudgetItemModal', { mode: 'edit', item })
}

const confirmDeleteBudgetItem = itemId => {
  deletingItemId.value = itemId
  showConfirmDeleteModal.value = true
}

const deleteBudgetItem = async () => {
  try {
    const response = await budgetStore.deleteBudgetItem(deletingItemId.value)
    if (response.status === 200) {
      notificationStore.addNotification({
        type: 'success',
        message: 'Budget item deleted successfully'
      })
    }

    showConfirmDeleteModal.value = false
  } catch (error) {
    notificationStore.addNotification({
      type: 'error',
      message: 'Failed to delete budget item'
    })
    console.error('Error deleting budget item:', error)
  }
}

const getCategoryByID = categoryId => {
  console.log('Fetching category for ID:', categoryId)
  let category = budgetStore.budgetCategories.find(category => {
    return category.value === categoryId * 1 // Ensure categoryId is treated as a number
  })

  return category?.label ?? 'Uncategorized'
}

// Get color for a category based on its ID
const getCategoryColor = categoryId => {
  // Get the index of the category in the budgetCategories array
  const categoryIndex = budgetStore.budgetCategories.findIndex(category => {
    return category.value === categoryId * 1
  })

  // If category is not found or is 'uncategorized', use the last color
  if (categoryIndex === -1 || categoryId === 'uncategorized') {
    return categoryColors[categoryColors.length - 1]
  }

  // Use the color at the same index (mod length to avoid out of bounds)
  return categoryColors[categoryIndex % categoryColors.length]
}
</script>

<template>
  <div v-if="hasBudgetItems" class="space-y-6">
    <!-- View mode toggle buttons -->
    <div class="flex justify-end mb-4">
      <div class="flex space-x-2">
        <button
          class="p-2 rounded-md"
          :class="
            viewMode === 'card'
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300'
              : 'text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400'
          "
          @click="toggleViewMode('card')"
        >
          <LayoutGrid class="w-5 h-5" />
        </button>
        <button
          class="p-2 rounded-md"
          :class="
            viewMode === 'table'
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300'
              : 'text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400'
          "
          @click="toggleViewMode('table')"
        >
          <Table class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- For each category -->
    <div
      v-for="(items, categoryId) in budgetItemsByCategory"
      v-show="items.length > 0"
      :key="categoryId"
      class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-card border border-gray-200 dark:border-gray-700"
    >
      <div
        class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center"
      >
        <CHeading :level="4">
          {{ categoryId === 'uncategorized' ? 'Uncategorized' : getCategoryByID(categoryId) }}
        </CHeading>
      </div>

      <!-- Card View -->
      <div
        v-if="viewMode === 'card'"
        class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="item in items"
          :key="item.id"
          class="rounded-lg p-4 relative"
          :style="{
            backgroundColor: getCategoryColor(categoryId) + '20',
            borderLeft: '4px solid ' + getCategoryColor(categoryId)
          }"
        >
          <div class="absolute top-2 right-2 flex space-x-1">
            <button
              class="p-1 text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400"
              @click="openEditBudgetItemModal(item)"
            >
              <Edit class="w-4 h-4" />
            </button>
            <button
              class="p-1 text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400"
              @click="confirmDeleteBudgetItem(item.id)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <h3 class="font-semibold text-gray-900 dark:text-white mb-1">{{ item.title }}</h3>
          <p v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {{ item.description }}
          </p>

          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">Estimated:</span>
            <span class="font-medium">${{ item.estimatedCost?.toLocaleString() }}</span>
          </div>

          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">Actual:</span>
            <span class="font-medium">{{
              item.actualCost ? '$' + item.actualCost?.toLocaleString() : 'Not set'
            }}</span>
          </div>

          <div
            v-if="item.dueDate"
            class="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-3"
          >
            <Calendar class="w-4 h-4 mr-1" />
            <span>Due: {{ new Date(item.dueDate).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-else class="p-6">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Title
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Description
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Estimated Cost
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Actual Cost
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Due Date
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr
              v-for="item in items"
              :key="item.id"
              class="transition hover:bg-gray-50 dark:hover:bg-gray-800"
              :style="{
                borderLeft: '4px solid ' + getCategoryColor(categoryId)
              }"
            >
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                {{ item.title }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {{ item.description || '-' }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                ${{ item.estimatedCost?.toLocaleString() }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ item.actualCost ? '$' + item.actualCost?.toLocaleString() : 'Not set' }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                <div v-if="item.dueDate" class="flex items-center">
                  <Calendar class="w-4 h-4 mr-1" />
                  <span>{{ new Date(item.dueDate).toLocaleDateString() }}</span>
                </div>
                <span v-else>-</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm">
                <div class="flex space-x-2">
                  <button
                    class="p-1 text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400"
                    @click="openEditBudgetItemModal(item)"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button
                    class="p-1 text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400"
                    @click="confirmDeleteBudgetItem(item.id)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <CConfirmModal
      v-model="showConfirmDeleteModal"
      title="Are you sure?"
      message="You are about to delete this Budget Item. This action cannot be undone."
      @confirm="deleteBudgetItem()"
      @close="showConfirmDeleteModal = false"
    />
  </div>
</template>

<style scoped></style>
