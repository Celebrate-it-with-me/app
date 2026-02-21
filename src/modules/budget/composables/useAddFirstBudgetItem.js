import { useBudgetStore } from '@/modules/budget/stores/useBudgetStore'
import { computed } from 'vue'

export function useAddFirstBudgetItem(emit) {
  const budgetStore = useBudgetStore()

  const hasBudgetItems = computed(() => budgetStore.hasBudgetItems)

  const openAddBudgetItemModal = () => {
    emit('openItemModal')
  }

  return {
    hasBudgetItems,
    openAddBudgetItemModal
  }
}
