<script setup>
// UI Components
import CButton from '@/components/UI/buttons/CButton.vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'

// Icons
import { AlertCircle, RefreshCw } from 'lucide-vue-next'

// Budget Components
import BudgetTitles from '@/modules/budget/components/BudgetTitles.vue'
import CreateEditEventBudget from '@/modules/budget/components/CreateEditEventBudget.vue'
import AddBudgetItemModal from '@/modules/budget/components/AddBudgetItemModal.vue'
import BudgetSummary from '@/modules/budget/components/BudgetSummary.vue'
import AddFirstBudgetItem from '@/modules/budget/components/AddFirstBudgetItem.vue'
import BudgetItemsByCategory from '@/modules/budget/components/BudgetItemsByCategory.vue'
import { useBudgetView } from '@/modules/budget/composables/useBudgetView'

const {
  loading,
  error,
  showCreateBudgetForm,
  budgetFormMode,
  showBudgetForm,
  showBudgetItemModal,
  editingItemId,
  handleBudgetItemModal,
  handleShowBudgetForm,
  fetchBudgetData
} = useBudgetView()
</script>

<template>
  <section class="budget-view">
    <!-- Page Header -->
    <BudgetTitles @open-item-modal="() => handleBudgetItemModal({ mode: 'create' })" />

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
      <CButton variant="text" size="sm" class="mt-2" @click="fetchBudgetData">
        <RefreshCw class="w-4 h-4 mr-1" /> Try Again
      </CButton>
    </CAlert>

    <!-- Budget Creation Form -->
    <CreateEditEventBudget
      v-if="showCreateBudgetForm"
      :mode="budgetFormMode"
      @budget-updated="showBudgetForm = false"
      @open-budget-form="showBudgetForm = false"
    />

    <!-- Content when budget exists -->
    <template v-else>
      <!-- Budget Summary -->
      <BudgetSummary @show-budget-form="handleShowBudgetForm" />

      <!-- Empty State for Budget Items -->
      <AddFirstBudgetItem @open-item-modal="() => handleBudgetItemModal({ mode: 'create' })" />

      <!-- Budget Items by Category -->
      <BudgetItemsByCategory @open-budget-item-modal="handleBudgetItemModal" />
    </template>

    <!-- Budget Item Modal -->
    <AddBudgetItemModal
      v-if="showBudgetItemModal"
      :show="showBudgetItemModal"
      :editing-item-id="editingItemId"
      @close="showBudgetItemModal = false"
      @item-added="fetchBudgetData"
      @item-updated="fetchBudgetData"
    />
  </section>
</template>

<style scoped>
.budget-view {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
