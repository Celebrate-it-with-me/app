import { useBudgetStore } from '@/modules/budget/stores/useBudgetStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { computed, ref } from 'vue'

export function useBudgetItemsByCategory(emit) {
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

  const budgetStore = useBudgetStore()
  const notificationStore = useNotificationStore()

  const showConfirmDeleteModal = ref(false)
  const deletingItemId = ref(null)
  const viewMode = ref('table') // 'card' or 'table'

  const hasBudgetItems = computed(() => budgetStore.hasBudgetItems)
  const budgetItemsByCategory = computed(() => budgetStore.budgetItemsByCategory)

  // Functions
  const toggleViewMode = mode => {
    viewMode.value = mode
  }

  const openEditBudgetItemModal = item => {
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
    }
  }

  const getCategoryByID = categoryId => {
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

  return {
    showConfirmDeleteModal,
    deletingItemId,
    viewMode,
    hasBudgetItems,
    budgetItemsByCategory,
    getCategoryColor,
    getCategoryByID,
    deleteBudgetItem,
    confirmDeleteBudgetItem,
    openEditBudgetItemModal,
    toggleViewMode
  }
}
