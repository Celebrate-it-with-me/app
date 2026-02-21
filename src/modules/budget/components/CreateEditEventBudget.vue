<script setup>
import CHeading from '@/components/UI/headings/CHeading.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { DollarSign, Wallet } from 'lucide-vue-next'
import { Form } from 'vee-validate'
import { useCreateEditBudget } from '@/modules/budget/composables/useCreateEditBudget'

const emit = defineEmits(['budgetUpdated', 'budgetCreated'])
const props = defineProps({
  mode: {
    type: String,
    default: 'create',
    validator: value => ['create', 'edit', 'manage'].includes(value)
  }
})

const { sending, budgetCapForm, validationSchema, onSubmit, onInvalidSubmit } = useCreateEditBudget(
  props,
  emit
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
