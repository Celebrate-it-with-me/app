import { computed, onMounted, reactive, ref, watch } from 'vue'
import * as zod from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useBudgetStore } from '@/modules/budget/stores/useBudgetStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

export function useAddBudgetItem(props, emit) {
  const editingItem = ref(null)
  const showBudgetItemModal = ref(false)
  const budgetStore = useBudgetStore()
  const notificationStore = useNotificationStore()

  const budgetItemForm = reactive({
    title: '',
    description: '',
    estimatedCost: null,
    actualCost: null,
    categoryId: '',
    dueDate: ''
  })

  const validationSchema = computed(() => {
    return toTypedSchema(
      zod.object({
        title: zod.string().min(1, 'Title is required'),
        estimatedCost: zod
          .number()
          .min(0, 'Estimated cost must be at least $0')
          .optional()
          .nullable(),
        actualCost: zod.number().min(0, 'Actual cost must be at least $0').optional().nullable(),
        categoryId: zod.number().optional(),
        dueDate: zod.string().optional(),
        description: zod.string().optional()
      })
    )
  })

  const budgetCategoryOptions = computed(() => {
    return budgetStore.budgetCategories?.map(category => ({
      label: category.label,
      value: category.value
    }))
  })

  const saveBudgetItem = async () => {
    try {
      let response
      if (editingItem.value) {
        // Update existing item
        response = await budgetStore.updateBudgetItem(editingItem.value.id, budgetItemForm)
        if (response.status === 200) {
          notificationStore.addNotification({
            type: 'success',
            message: 'Budget item updated successfully'
          })
        }
      } else {
        // Create new item
        response = await budgetStore.createBudgetItem(budgetItemForm)
        if (response.status === 201) {
          notificationStore.addNotification({
            type: 'success',
            message: 'Budget item created successfully'
          })
        }
      }

      // Close modal and reset form
      emit('close')
    } catch (error) {
      notificationStore.addNotification({
        type: 'error',
        message: 'Failed to save budget item'
      })
      console.error('Error saving budget item:', error)
    }
  }

  const handleClose = () => {
    emit('close')
    cleanForm()
    editingItem.value = null
  }

  const cleanForm = () => {
    budgetItemForm.title = ''
    budgetItemForm.description = ''
    budgetItemForm.estimatedCost = null
    budgetItemForm.actualCost = null
    budgetItemForm.categoryId = ''
    budgetItemForm.dueDate = ''
    editingItem.value = null
  }

  const onInvalidSubmit = () => {
    notificationStore.addNotification({
      type: 'error',
      message: 'Please fix the errors in the form before submitting'
    })
  }

  watch(
    () => props.show,
    newVal => {
      showBudgetItemModal.value = newVal
      if (newVal) {
        // Reset form when opening modal
        cleanForm()
        if (props.editingItemId) {
          const item = budgetStore.getBudgetItemById(props.editingItemId)
          if (item) {
            // Handle potential property name mismatches (camelCase vs snake_case)
            editingItem.value = item

            // Title
            budgetItemForm.title = item.title || ''

            // Description
            budgetItemForm.description = item.description || ''

            // Estimated Cost - check both camelCase and snake_case
            budgetItemForm.estimatedCost = item.estimatedCost || item.estimated_cost || null

            // Actual Cost - check both camelCase and snake_case
            budgetItemForm.actualCost = item.actualCost || item.actual_cost || null

            // Category ID - check both camelCase and snake_case
            budgetItemForm.categoryId = item.categoryId || item.category_id || ''

            // Due Date - check both camelCase and snake_case
            budgetItemForm.dueDate = item.dueDate || item.due_date || ''
          } else {
            console.error('Item not found with ID:', props.editingItemId)
          }
        }
      }
    }
  )

  onMounted(() => {
    showBudgetItemModal.value = props.show
  })

  return {
    editingItem,
    showBudgetItemModal,
    budgetStore,
    notificationStore,
    budgetItemForm,
    validationSchema,
    budgetCategoryOptions,
    onInvalidSubmit,
    handleClose,
    saveBudgetItem
  }
}
