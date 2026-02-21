import { useBudgetStore } from '@/modules/budget/stores/useBudgetStore'
import { computed } from 'vue'

export function useBudgetTitles(emit) {
  const budgetStore = useBudgetStore()
  const hasEventBudget = computed(() => budgetStore.hasEventBudget)

  const openAddBudgetItemModal = () => {
    emit('openItemModal')
  }

  return {
    hasEventBudget,
    openAddBudgetItemModal
  }
}
