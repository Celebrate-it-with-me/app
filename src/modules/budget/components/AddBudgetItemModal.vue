<script setup>
import CModal from '@/components/UI/modals/CModal.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import { Form } from 'vee-validate'
import CSelect from '@/components/UI/form2/CSelect.vue'
import { useAddBudgetItem } from '@/modules/budget/composables/useAddBudgetItem'

const emit = defineEmits(['close'])
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  editingItemId: {
    type: [String, Number],
    default: null
  }
})

const {
  editingItem,
  showBudgetItemModal,
  budgetItemForm,
  validationSchema,
  budgetCategoryOptions,
  onInvalidSubmit,
  handleClose,
  saveBudgetItem
} = useAddBudgetItem(props, emit)
</script>

<template>
  <CModal
    v-model="showBudgetItemModal"
    :title="editingItem ? 'Edit Budget Item' : 'Add Budget Item'"
    :show-footer="false"
  >
    <Form
      :validation-schema="validationSchema"
      @submit="saveBudgetItem"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Title *</label
          >
          <CInput
            id="title"
            v-model="budgetItemForm.title"
            name="title"
            show-error
            placeholder="Enter item title"
            class="w-full"
          />
        </div>

        <div>
          <label
            for="description"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Description</label
          >
          <CTextarea
            id="description"
            v-model="budgetItemForm.description"
            name="description"
            show-error
            placeholder="Enter item description (optional)"
            class="w-full"
            :rows="3"
            description=""
            label=""
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              for="estimated_cost"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Estimated Cost *</label
            >
            <CInput
              id="estimated_cost"
              v-model="budgetItemForm.estimatedCost"
              name="estimatedCost"
              show-error
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="w-full"
            />
          </div>

          <div>
            <label
              for="actual_cost"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Actual Cost</label
            >
            <CInput
              id="actual_cost"
              v-model="budgetItemForm.actualCost"
              name="actualCost"
              show-error
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00 (optional)"
              class="w-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              for="category_id"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Category</label
            >
            <CSelect
              id="category_id"
              v-model="budgetItemForm.categoryId"
              :options="budgetCategoryOptions"
              name="categoryId"
              show-error
              placeholder="Select a category"
              description=""
              label=""
            />
          </div>

          <div>
            <label
              for="due_date"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Due Date</label
            >
            <CInput
              id="due_date"
              v-model="budgetItemForm.dueDate"
              name="dueDate"
              show-error
              type="date"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-2 mt-12">
        <CButton variant="outline" @click="handleClose"> Cancel </CButton>
        <CButton
          type="submit"
          variant="gradient"
          class="bg-gradient-to-r from-rose to-rose-dark hover:from-rose-dark hover:to-rose-darken text-white"
        >
          {{ editingItem ? 'Update' : 'Create' }} Budget Item
        </CButton>
      </div>
    </Form>
  </CModal>
</template>

<style scoped></style>
