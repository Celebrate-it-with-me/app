import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useBudgetStore } from '@/modules/budget/stores/useBudgetStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

export function useCreateEditBudget(props, emit) {
  const budgetStore = useBudgetStore()
  const notificationStore = useNotificationStore()

  const sending = ref(false)
  const budgetCapForm = reactive({
    budgetCap: null
  })

  const validationSchema = computed(() => {
    return toTypedSchema(
      zod.object({
        budgetCap: zod.number().min(0, 'Budget cap must be at least $0').optional().nullable()
      })
    )
  })

  const createEventBudget = async () => {
    try {
      const response = await budgetStore.createEventBudget({
        budgetCap: parseFloat(budgetCapForm.budgetCap)
      })

      if (response.status === 201) {
        notificationStore.addNotification({
          type: 'success',
          message: 'Event budget created successfully'
        })

        await budgetStore.loadBudgetItems()
      }
    } catch (error) {
      notificationStore.addNotification({
        type: 'error',
        message: 'Failed to create event budget'
      })
      console.error('Error creating event budget:', error)
    } finally {
      emit('budgetCreated')
    }
  }

  const updateEventBudget = async () => {
    try {
      const response = await budgetStore.updateEventBudget({
        budgetCap: parseFloat(budgetCapForm.budgetCap)
      })

      if (response.status === 200) {
        notificationStore.addNotification({
          type: 'success',
          message: 'Event budget updated successfully'
        })

        await budgetStore.loadBudgetItems()
      }
    } catch (error) {
      notificationStore.addNotification({
        type: 'error',
        message: 'Failed to update event budget'
      })
      console.error('Error updating event budget:', error)
    } finally {
      emit('budgetUpdated')
    }
  }

  const onSubmit = async () => {
    sending.value = true
    if (props.mode === 'create') {
      await createEventBudget()
    } else if (props.mode === 'edit') {
      await updateEventBudget()
    } else {
      console.warn('Unsupported mode for budget submission:', props.mode)
    }

    sending.value = false
  }

  const onInvalidSubmit = errors => {
    console.error('Form submission errors:', errors)
  }

  onMounted(() => {
    if (props.mode === 'edit') {
      budgetCapForm.budgetCap = budgetStore.eventBudget?.budgetCap || null
    }
  })

  watch(
    () => props.mode,
    value => {
      if (value === 'edit') {
        budgetCapForm.budgetCap = budgetStore.eventBudget?.budgetCap || null
      }
    }
  )

  return {
    sending,
    budgetCapForm,
    validationSchema,
    onSubmit,
    onInvalidSubmit
  }
}
