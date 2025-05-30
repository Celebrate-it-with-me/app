<script setup>
import CModal from '@/components/UI/modals/CModal.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Form } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { useBudgetStore } from '@/stores/useBudgetStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import CSelect from '@/components/UI/form2/CSelect.vue'

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
      estimatedCost: zod.number()
        .min(0, 'Estimated cost must be at least $0')
        .optional()
        .nullable(),
      actualCost: zod.number()
        .min(0, 'Actual cost must be at least $0')
        .optional()
        .nullable(),
      categoryId: zod.number().optional(),
      dueDate: zod.string().optional(),
      description: zod.string().optional(),
    })
  )
})

const saveBudgetItem = async () => {
  try {
    let response;
    if (editingItem.value) {
      // Update existing item
      response = await budgetStore.updateBudgetItem(editingItem.value.id, budgetItemForm);
      if (response.status === 200) {
        notificationStore.addNotification({
          type: 'success',
          message: 'Budget item updated successfully'
        })
      }
    } else {
      // Create new item
      response = await budgetStore.createBudgetItem(budgetItemForm);
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
    console.error('Error saving budget item:', error);
  }
}

const handleClose = () => {
  emit('close');
  cleanForm();
  editingItem.value = null;
}

const cleanForm = () => {
  budgetItemForm.title = '';
  budgetItemForm.description = '';
  budgetItemForm.estimatedCost = null;
  budgetItemForm.actualCost = null;
  budgetItemForm.categoryId = '';
  budgetItemForm.dueDate = '';
  editingItem.value = null;
}

const onInvalidSubmit = (errors) => {
  console.error('Form validation errors:', errors);
  notificationStore.addNotification({
    type: 'error',
    message: 'Please fix the errors in the form before submitting'
  });
}

watch(() => props.show, (newVal) => {
  showBudgetItemModal.value = newVal;
  if (newVal) {
    // Reset form when opening modal
    cleanForm();
    if (props.editingItemId) {
      console.log('Editing item ID:', props.editingItemId);
      console.log('Budget items:', budgetStore.budgetItems);
      const item = budgetStore.getBudgetItemById(props.editingItemId);
      console.log('Found item:', item);
      if (item) {
        console.log('Item properties:', Object.keys(item));

        // Handle potential property name mismatches (camelCase vs snake_case)
        editingItem.value = item;

        // Title
        budgetItemForm.title = item.title || '';

        // Description
        budgetItemForm.description = item.description || '';

        // Estimated Cost - check both camelCase and snake_case
        budgetItemForm.estimatedCost = item.estimatedCost || item.estimated_cost || null;

        // Actual Cost - check both camelCase and snake_case
        budgetItemForm.actualCost = item.actualCost || item.actual_cost || null;

        // Category ID - check both camelCase and snake_case
        budgetItemForm.categoryId = item.categoryId || item.category_id || '';

        // Due Date - check both camelCase and snake_case
        budgetItemForm.dueDate = item.dueDate || item.due_date || '';

        console.log('Form populated with:', budgetItemForm);
      } else {
        console.error('Item not found with ID:', props.editingItemId);
      }
    }
  }
})

onMounted(() => {
  showBudgetItemModal.value = props.show;
})

</script>

<template>
  <CModal
    v-model="showBudgetItemModal"
    :title="editingItem
      ? 'Edit Budget Item'
      : 'Add Budget Item'"
    :show-footer="false"
  >
    <Form
      :validation-schema="validationSchema"
      @submit="saveBudgetItem"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
          <CInput
            name="title"
            id="title"
            v-model="budgetItemForm.title"
            show-error
            placeholder="Enter item title"
            class="w-full"
          />
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <CTextarea
            name="description"
            id="description"
            v-model="budgetItemForm.description"
            show-error
            placeholder="Enter item description (optional)"
            class="w-full"
            :rows="3"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="estimated_cost" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Cost *</label>
            <CInput
              name="estimatedCost"
              id="estimated_cost"
              v-model="budgetItemForm.estimatedCost"
              show-error
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="w-full"
            />
          </div>

          <div>
            <label for="actual_cost" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Actual Cost</label>
            <CInput
              name="actualCost"
              id="actual_cost"
              v-model="budgetItemForm.actualCost"
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
            <label for="category_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <CSelect
              id="category_id"
              :options="budgetStore.budgetCategories"
              name="categoryId"
              v-model="budgetItemForm.categoryId"
              show-error
              placeholder="Select a category"
            />
          </div>

          <div>
            <label for="due_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
            <CInput
              id="due_date"
              name="dueDate"
              v-model="budgetItemForm.dueDate"
              show-error
              type="date"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-2 mt-12">
        <CButton
          @click="handleClose"
          variant="outline"
        >
          Cancel
        </CButton>
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

<style scoped>

</style>
