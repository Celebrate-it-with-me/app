<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'
import { useBudgetStore } from '@/stores/useBudgetStore'
import { useNotification } from '@kyvg/vue3-notification'

// UI Components
import CHeading from '@/components/UI/headings/CHeading.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'
import CModal from '@/components/UI/modals/CModal.vue'

// Icons
import { PlusCircle, AlertCircle, RefreshCw, DollarSign, Wallet, Edit, Trash2, Calendar } from 'lucide-vue-next'

const eventsStore = useEventsStore()
const budgetStore = useBudgetStore()
const noticationStore = useNotificationStore()

// Form state
const budgetCapForm = reactive({
  budgetCap: null
})

const budgetItemForm = ref({
  title: '',
  description: '',
  estimated_cost: null,
  actual_cost: null,
  due_date: null,
  category_id: null
})

const editingItemId = ref(null)
const showBudgetItemModal = ref(false)

// Computed properties
const activeEvent = computed(() => eventsStore.activeEvent)
const loading = computed(() => budgetStore.loading)
const error = computed(() => budgetStore.error)
const hasEventBudget = computed(() => budgetStore.hasEventBudget)
const budgetCap = computed(() => budgetStore.budgetCap)
const budgetItems = computed(() => budgetStore.budgetItems)
const budgetItemsByCategory = computed(() => budgetStore.budgetItemsByCategory)
const hasBudgetItems = computed(() => budgetStore.hasBudgetItems)
const totalEstimatedCost = computed(() => budgetStore.totalEstimatedCost)
const totalActualCost = computed(() => budgetStore.totalActualCost)
const budgetStatus = computed(() => budgetStore.budgetStatus)
const categories = computed(() => budgetStore.categories)

// Methods
const fetchBudgetData = async () => {
  if (!activeEvent.value) {
    budgetStore.error = 'No active event selected';
    return;
  }

  try {
    // First, check if the event has a budget
    await budgetStore.getEventBudget();

    // If we have a budget, load the budget items
    if (hasEventBudget.value) {
      await budgetStore.loadBudgetItems();
    }
  } catch (err) {
    console.error('Error fetching budget data:', err);
  }
}

const createEventBudget = async () => {
  if (!budgetCapForm.budgetCap) {
    noticationStore.addNotification({
      type: 'error',
      message: 'Budget cap is required'
    })
    return;
  }

  try {
    const response = await budgetStore.createEventBudget({
      budgetCap: parseFloat(budgetCapForm.budgetCap),
    });

    if (response.status === 201) {
      notificationStore.addNotification({
        type: 'success',
        message: 'Event budget created successfully'
      });

      // Load budget items after creating the budget
      await budgetStore.loadBudgetItems();
    }
  } catch (error) {
    notificationStore.addNotification({
      type: 'error',
      message: 'Failed to create event budget'
    });
    console.error('Error creating event budget:', error);
  }
}

const openAddBudgetItemModal = () => {
  // Reset form
  budgetItemForm.value = {
    title: '',
    description: '',
    estimated_cost: null,
    actual_cost: null,
    due_date: null,
    category_id: null
  };
  editingItemId.value = null;
  showBudgetItemModal.value = true;
}

const openEditBudgetItemModal = (item) => {
  budgetItemForm.value = {
    title: item.title,
    description: item.description || '',
    estimated_cost: item.estimated_cost,
    actual_cost: item.actual_cost || null,
    due_date: item.due_date || null,
    category_id: item.category_id || null
  };
  editingItemId.value = item.id;
  showBudgetItemModal.value = true;
}

const saveBudgetItem = async () => {
  if (!budgetItemForm.value.title || !budgetItemForm.value.estimated_cost) {
    notificationStore.addNotification({
      type: 'error',
      message: 'Title and estimated cost are required'
    });
    return;
  }

  try {
    const formData = {
      title: budgetItemForm.value.title,
      description: budgetItemForm.value.description || null,
      estimated_cost: parseFloat(budgetItemForm.value.estimated_cost),
      actual_cost: budgetItemForm.value.actual_cost ? parseFloat(budgetItemForm.value.actual_cost) : null,
      due_date: budgetItemForm.value.due_date || null,
      category_id: budgetItemForm.value.category_id || null
    };

    let response;
    if (editingItemId.value) {
      // Update existing item
      response = await budgetStore.updateBudgetItem(editingItemId.value, formData);
      if (response.status === 200) {
        notificationStore.addNotification({
          type: 'success',
          message: 'Budget item updated successfully'
        })
      }
    } else {
      // Create new item
      response = await budgetStore.createBudgetItem(formData);
      if (response.status === 201) {
        notificationStore.addNotification({
          type: 'success',
          message: 'Budget item created successfully'
        })
      }
    }

    // Close modal and reset form
    showBudgetItemModal.value = false;
    budgetItemForm.value = {
      title: '',
      description: '',
      estimated_cost: null,
      actual_cost: null,
      due_date: null,
      category_id: null
    };
    editingItemId.value = null;
  } catch (error) {
    noticationStore.addNotification({
      type: 'error',
      message: 'Failed to save budget item'
    })
    console.error('Error saving budget item:', error);
  }
}

const deleteBudgetItem = async (itemId) => {
  if (!confirm('Are you sure you want to delete this budget item?')) {
    return;
  }

  try {
    const response = await budgetStore.deleteBudgetItem(itemId);
    if (response.status === 200) {
      notificationStore.addNotification({
        type: 'success',
        message: 'Budget item deleted successfully'
      })
    }
  } catch (error) {
    notificationStore.addNotification({
      type: 'error',
      message: 'Failed to delete budget item'
    })
    console.error('Error deleting budget item:', error);
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchBudgetData();
})
</script>

<template>
  <section class="budget-view">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div>
        <CHeading :level="2" weight="semibold" class="text-rose-darken">Event Budget</CHeading>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Track and manage your event expenses</p>
      </div>
      <CButton
        v-if="hasEventBudget"
        variant="gradient"
        @click="openAddBudgetItemModal"
        class="bg-gradient-to-r from-rose to-rose-dark hover:from-rose-dark hover:to-rose-darken text-white"
      >
        <PlusCircle class="w-4 h-4 mr-2" />
        Add Budget Item
      </CButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <CWMLoading class="w-12 h-12 text-rose mb-4" />
      <p class="text-gray-500 dark:text-gray-400">Loading budget data...</p>
    </div>

    <!-- Error State -->
    <CAlert v-else-if="error" variant="error" class="mb-6">
      <template #icon>
        <AlertCircle class="w-5 h-5" />
      </template>
      <p>{{ error }}</p>
      <CButton @click="fetchBudgetData" variant="text" size="sm" class="mt-2">
        <RefreshCw class="w-4 h-4 mr-1" /> Try Again
      </CButton>
    </CAlert>

    <!-- Budget Creation Form -->
    <div v-else-if="!hasEventBudget" class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-card border border-gray-200 dark:border-gray-700">
      <Wallet class="w-16 h-16 mx-auto text-rose mb-4" />
      <CHeading :level="4" class="mb-2 text-center">Set Your Event Budget</CHeading>
      <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto text-center">
        Start by setting a budget cap for your event. This will help you track expenses and stay within your budget.
      </p>

      <div class="max-w-md mx-auto">
        <div class="mb-4">
          <label for="budget_cap" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Cap ($)</label>
          <CInput
            name="budgetCap"
            id="budget_cap"
            v-model="budgetCapForm.budgetCap"
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter your total budget"
            class="w-full"
          />
        </div>

        <CButton
          variant="gradient"
          @click="createEventBudget"
          class="w-full bg-gradient-to-r from-rose to-rose-dark hover:from-rose-dark hover:to-rose-darken text-white"
        >
          <DollarSign class="w-4 h-4 mr-2" />
          Set Budget
        </CButton>
      </div>
    </div>

    <!-- Content when budget exists -->
    <template v-else>
      <!-- Budget Summary -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-card border border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center mb-4">
          <CHeading :level="4">Budget Summary</CHeading>
          <div class="bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-4 py-2 rounded-lg flex items-center">
            <DollarSign class="w-4 h-4 mr-1" />
            <span class="font-semibold">Budget Cap: ${{ budgetCap.toLocaleString() }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Estimated Total</p>
            <p class="text-xl font-semibold">${{ totalEstimatedCost.toLocaleString() }}</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Actual Total</p>
            <p class="text-xl font-semibold">${{ totalActualCost.toLocaleString() }}</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Budget Status</p>
            <p class="text-xl font-semibold" :class="budgetStatus.class">{{ budgetStatus.status }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State for Budget Items -->
      <div v-if="!hasBudgetItems" class="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-card border border-gray-200 dark:border-gray-700">
        <Wallet class="w-16 h-16 mx-auto text-rose mb-4" />
        <CHeading :level="4" class="mb-2">No Budget Items Yet</CHeading>
        <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Start tracking your event expenses by adding budget items. This will help you stay organized and within budget.
        </p>
        <CButton variant="gradient" @click="openAddBudgetItemModal" class="bg-gradient-to-r from-rose to-rose-dark hover:from-rose-dark hover:to-rose-darken text-white">
          <PlusCircle class="w-4 h-4 mr-2" />
          Add Your First Budget Item
        </CButton>
      </div>

      <!-- Budget Items by Category -->
      <div v-else class="space-y-6">
        <!-- For each category -->
        <div v-for="(items, categoryId) in budgetItemsByCategory" :key="categoryId" v-show="items.length > 0" class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-card border border-gray-200 dark:border-gray-700">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <CHeading :level="4">{{ categoryId === 'uncategorized' ? 'Uncategorized' : categoryId }}</CHeading>
            <CButton variant="outline" size="sm" @click="openAddBudgetItemModal" class="text-rose hover:bg-rose-50 dark:hover:bg-rose-900">
              <PlusCircle class="w-4 h-4 mr-1" />
              Add Item
            </CButton>
          </div>

          <!-- Budget Items Cards -->
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="item in items" :key="item.id" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative">
              <div class="absolute top-2 right-2 flex space-x-1">
                <button @click="openEditBudgetItemModal(item)" class="p-1 text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400">
                  <Edit class="w-4 h-4" />
                </button>
                <button @click="deleteBudgetItem(item.id)" class="p-1 text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>

              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">{{ item.title }}</h3>
              <p v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400 mb-3">{{ item.description }}</p>

              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">Estimated:</span>
                <span class="font-medium">${{ item.estimated_cost.toLocaleString() }}</span>
              </div>

              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">Actual:</span>
                <span class="font-medium">{{ item.actual_cost ? '$' + item.actual_cost.toLocaleString() : 'Not set' }}</span>
              </div>

              <div v-if="item.due_date" class="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                <Calendar class="w-4 h-4 mr-1" />
                <span>Due: {{ new Date(item.due_date).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Budget Item Modal -->
    <CModal v-model="showBudgetItemModal" :title="editingItemId ? 'Edit Budget Item' : 'Add Budget Item'">
      <div class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
          <CInput
            name="title"
            id="title"
            v-model="budgetItemForm.title"
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
            placeholder="Enter item description (optional)"
            class="w-full"
            rows="3"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="estimated_cost" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Cost *</label>
            <CInput
              name="estimatedCost"
              id="estimated_cost"
              v-model="budgetItemForm.estimated_cost"
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
              v-model="budgetItemForm.actual_cost"
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
            <select
              id="category_id"
              v-model="budgetItemForm.category_id"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring focus:ring-rose-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select a category (optional)</option>
              <option value="Venue">Venue</option>
              <option value="Catering">Catering</option>
              <option value="Decoration">Decoration</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Photography">Photography</option>
              <option value="Transportation">Transportation</option>
              <option value="Attire">Attire</option>
              <option value="Gifts">Gifts</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>

          <div>
            <label for="due_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
            <CInput
              id="due_date"
              v-model="budgetItemForm.due_date"
              type="date"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <CButton @click="showBudgetItemModal = false" variant="outline">Cancel</CButton>
          <CButton @click="saveBudgetItem" variant="gradient" class="bg-gradient-to-r from-rose to-rose-dark hover:from-rose-dark hover:to-rose-darken text-white">
            {{ editingItemId ? 'Update' : 'Create' }} Budget Item
          </CButton>
        </div>
      </template>
    </CModal>
  </section>
</template>

<style scoped>
.budget-view {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
