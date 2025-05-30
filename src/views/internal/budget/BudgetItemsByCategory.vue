<script setup>
import { Calendar, Edit, PlusCircle, Trash2 } from 'lucide-vue-next'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { computed, ref } from 'vue'
import { useBudgetStore } from '@/stores/useBudgetStore'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'

const emit = defineEmits(['openBudgetItemModal', 'openBudgetItemModal', 'deleteBudgetItem'])

const budgetStore = useBudgetStore()
const notificationStore = useNotificationStore()

const showConfirmDeleteModal = ref(false)
const deletingItemId = ref(null)

const hasBudgetItems = computed(() => budgetStore.hasBudgetItems)
const budgetItemsByCategory = computed(() => budgetStore.budgetItemsByCategory)

const openAddBudgetItemModal = (categoryId) => {
  emit('openBudgetItemModal', { mode: 'create', categoryId: categoryId || null })
}

const openEditBudgetItemModal = (item) => {
  emit('openBudgetItemModal', { mode: 'edit', item })
}

const confirmDeleteBudgetItem = (itemId) => {
  deletingItemId.value = itemId
  showConfirmDeleteModal.value = true
}

const deleteBudgetItem = async () => {
  try {
    const response = await budgetStore.deleteBudgetItem(deletingItemId.value);
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
    console.error('Error deleting budget item:', error);
  }
}

const getCategoryByID = (categoryId) => {
  console.log('Fetching category for ID:', categoryId);
  let category = budgetStore.budgetCategories.find(category => {
    return category.value === categoryId * 1; // Ensure categoryId is treated as a number
  });

  return category?.label ?? 'Uncategorized';
}

</script>

<template>
  <div v-if="hasBudgetItems" class="space-y-6">
    <!-- For each category -->
    <div
      v-for="(items, categoryId) in budgetItemsByCategory"
      :key="categoryId"
      v-show="items.length > 0"
      class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-card border border-gray-200 dark:border-gray-700"
    >
      <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <CHeading :level="4">
          {{ categoryId === 'uncategorized' ? 'Uncategorized' : getCategoryByID(categoryId) }}
        </CHeading>
        <CButton
          variant="outline"
          size="sm"
          @click="openAddBudgetItemModal(categoryId)"
          class="text-rose hover:bg-rose-50 dark:hover:bg-rose-900"
        >
          <PlusCircle class="w-4 h-4 mr-1" />
          Add Item
        </CButton>
      </div>

      <!-- Budget Items Cards -->
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative">
          <div class="absolute top-2 right-2 flex space-x-1">
            <button
              @click="openEditBudgetItemModal(item)"
              class="p-1 text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400"
            >
              <Edit class="w-4 h-4" />
            </button>
            <button
              @click="confirmDeleteBudgetItem(item.id)"
              class="p-1 text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <h3 class="font-semibold text-gray-900 dark:text-white mb-1">{{ item.title }}</h3>
          <p v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400 mb-3">{{ item.description }}</p>

          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">Estimated:</span>
            <span class="font-medium">${{ item.estimatedCost?.toLocaleString() }}</span>
          </div>

          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">Actual:</span>
            <span class="font-medium">{{ item.actualCost ? '$' + item.actualCost?.toLocaleString() : 'Not set' }}</span>
          </div>

          <div v-if="item.due_date" class="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-3">
            <Calendar class="w-4 h-4 mr-1" />
            <span>Due: {{ new Date(item.due_date).toLocaleDateString() }}</span>
          </div>
        </div>
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

<style scoped>

</style>
