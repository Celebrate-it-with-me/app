<script setup>
import { computed, onMounted, ref } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'
import { useBudgetStore } from '@/stores/useBudgetStore'

// UI Components
import CButton from '@/components/UI/buttons/CButton.vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'

// Icons
import { AlertCircle, RefreshCw } from 'lucide-vue-next'
import BudgetTitles from '@/views/internal/budget/BudgetTitles.vue'
import CreateEditEventBudget from '@/views/internal/budget/CreateEditEventBudget.vue'
import AddBudgetItemModal from '@/views/internal/budget/AddBudgetItemModal.vue'
import BudgetSummary from '@/views/internal/budget/BudgetSummary.vue'
import AddFirstBudgetItem from '@/views/internal/budget/AddFirstBudgetItem.vue'
import BudgetItemsByCategory from '@/views/internal/budget/BudgetItemsByCategory.vue'

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
    return true;
  }

  return showBudgetForm.value;
});

// Methods
const handleShowBudgetForm = () => {
  budgetFormMode.value = 'edit'
  showBudgetForm.value = true
}

const fetchBudgetData = async () => {
  if (!activeEvent.value) {
    budgetStore.error = 'No active event selected';
    return;
  }

  try {
    await budgetStore.getEventBudget();

    if (hasEventBudget.value) {
      await budgetStore.loadBudgetItems();
    }
  } catch (err) {
    console.error('Error fetching budget data:', err);
  }
}

const openAddBudgetItemModal = () => {
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



// Lifecycle hooks
onMounted(() => {
  fetchBudgetData();
})
</script>

<template>
  <section class="budget-view">
    <!-- Page Header -->
    <BudgetTitles
      @open-item-modal="openAddBudgetItemModal"
    />

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
    <CreateEditEventBudget
      :mode="budgetFormMode"
      v-if="showCreateBudgetForm"
      @budgetUpdated="showBudgetForm = false"
      @openBudgetForm="showBudgetForm = false"
    />

    <!-- Content when budget exists -->
    <template v-else>
      <!-- Budget Summary -->
      <BudgetSummary
        @show-budget-form="handleShowBudgetForm"
      />

      <!-- Empty State for Budget Items -->
      <AddFirstBudgetItem
        @open-item-modal="openAddBudgetItemModal"
      />

      <!-- Budget Items by Category -->
      <BudgetItemsByCategory
        @open-item-modal="openAddBudgetItemModal"
        @edit-item-modal="openEditBudgetItemModal"
      />
    </template>

    <!-- Budget Item Modal -->
    <AddBudgetItemModal
      v-if="showBudgetItemModal"
      :show="showBudgetItemModal"
      :editing-item-id="editingItemId"
      @close="showBudgetItemModal = false"
      @itemAdded="fetchBudgetData"
      @itemUpdated="fetchBudgetData"
    />
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
