<script setup>
import CHeading from '@/components/UI/headings/CHeading.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { DollarSign, Wallet } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Form } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { useBudgetStore } from '@/stores/useBudgetStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

const emit = defineEmits(['budgetUpdated', 'budgetCreated'])
const props = defineProps({
  mode: {
    type: String,
    default: 'create', // 'create', 'edit', or 'manage'
    validator: value => ['create', 'edit', 'manage'].includes(value)
  }
})
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
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-card border border-gray-200 dark:border-gray-700"
  >
    <Wallet class="w-16 h-16 mx-auto text-rose mb-4" />
    <CHeading :level="4" class="mb-2 text-center">
      <span v-if="mode === 'create'">Set Your Event Budget</span>
      <span v-else-if="mode === 'edit'">Update Your Event Budget</span>
      <span v-else>Manage Your Event Budget</span>
    </CHeading>
    <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto text-center">
      <span v-if="mode === 'create'">
        Start by setting a budget cap for your event. This will help you track expenses and stay
        within your budget.
      </span>
      <span v-else-if="mode === 'edit'">
        Update your budget cap to reflect any changes in your event planning. Adjusting your budget
        helps you manage costs effectively.
      </span>
      <span v-else>
        Manage your event budget by setting a cap and tracking expenses. This ensures you stay
        within your financial limits.
      </span>
    </p>
    <Form
      :validation-schema="validationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="max-w-md mx-auto">
        <div class="mb-4">
          <label
            for="budget_cap"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Budget Cap ($)</label
          >
          <CInput
            id="budget_cap"
            v-model="budgetCapForm.budgetCap"
            name="budgetCap"
            show-error
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter your total budget"
            class="w-full"
          />
        </div>

        <CButton
          :loading="sending"
          variant="gradient"
          type="submit"
          class="w-full bg-gradient-to-r from-rose to-rose-dark hover:from-rose-dark hover:to-rose-darken text-white"
        >
          <DollarSign class="w-4 h-4 mr-2" />
          Set Budget
        </CButton>
      </div>
    </Form>
  </div>
</template>

<style scoped></style>
