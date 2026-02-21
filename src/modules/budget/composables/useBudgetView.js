import { computed, onMounted, ref } from 'vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useBudgetStore } from '@/modules/budget/stores/useBudgetStore'

export function useBudgetView() {
  // Reactive state
  const eventsStore = useEventsStore()
  const budgetStore = useBudgetStore()

  // Form state
  const showBudgetForm = ref(false)
  const budgetFormMode = ref('create') // 'create' or 'edit'

  const editingItemId = ref(null)
  const showBudgetItemModal = ref(false)

  // Computed properties
  const activeEvent = computed(() => eventsStore.activeEvent)
  const loading = computed(() => budgetStore.loading)
  const error = computed(() => budgetStore.error)
  const hasEventBudget = computed(() => budgetStore.hasEventBudget)

  const showCreateBudgetForm = computed(() => {
    if (!hasEventBudget.value) {
      return true
    }

    return showBudgetForm.value
  })

  // Methods
  const handleShowBudgetForm = () => {
    budgetFormMode.value = 'edit'
    showBudgetForm.value = true
  }

  const fetchBudgetData = async () => {
    if (!activeEvent.value) {
      budgetStore.error = 'No active event selected'
      return
    }

    try {
      await budgetStore.getEventBudget()

      if (hasEventBudget.value) {
        await budgetStore.loadBudgetItems()
      }
    } catch (err) {
      console.error('Error fetching budget data:', err)
    }
  }

  const handleBudgetItemModal = async data => {
    // Ensure budget items are loaded before opening the modal
    if (hasEventBudget.value && budgetStore.budgetItems.length === 0) {
      await budgetStore.loadBudgetItems()
    }

    if (data.mode === 'edit' && data.item) {
      // Edit mode
      editingItemId.value = data.item.id
      console.log('Setting editingItemId to:', data.item.id)
    } else {
      // Create mode
      editingItemId.value = null
    }
    showBudgetItemModal.value = true
  }

  // Lifecycle hooks
  onMounted(async () => {
    await fetchBudgetData()
  })

  return {
    loading,
    error,
    showCreateBudgetForm,
    budgetFormMode,
    showBudgetForm,
    hasEventBudget,
    showBudgetItemModal,
    editingItemId,
    handleBudgetItemModal,
    handleShowBudgetForm,
    fetchBudgetData
  }
}
