<script setup>
import { computed, onMounted } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'
import { useBudgetStore } from '@/stores/useBudgetStore'
import { useNotification } from '@kyvg/vue3-notification'

// UI Components
import CHeading from '@/components/UI/headings/CHeading.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import CBadge from '@/components/UI/badges/CBadge.vue'

// Icons
import { PlusCircle, AlertCircle, RefreshCw, DollarSign, Wallet } from 'lucide-vue-next'

const eventsStore = useEventsStore()
const budgetStore = useBudgetStore()
const { notify } = useNotification()

// Computed properties
const activeEvent = computed(() => eventsStore.activeEvent)
const loading = computed(() => budgetStore.loading)
const error = computed(() => budgetStore.error)
const budgetItems = computed(() => budgetStore.budgetItems)
const hasBudgetItems = computed(() => budgetStore.hasBudgetItems)
const totalEstimatedCost = computed(() => budgetStore.totalEstimatedCost)
const totalActualCost = computed(() => budgetStore.totalActualCost)
const totalPaid = computed(() => budgetStore.totalPaid)
const totalRemaining = computed(() => budgetStore.totalRemaining)
const budgetStatus = computed(() => budgetStore.budgetStatus)

// Methods
const fetchBudgetData = async () => {
  try {
    // For mock implementation, we'll add a delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // In a real implementation, this would call the API through the store
    // await budgetStore.loadBudgetItems();
    // await budgetStore.loadBudgetSummary();

    // For now, we'll use the mock data in the component
    if (budgetStore.budgetItems.length === 0) {
      // Add mock data to the store
      budgetStore.budgetItems = [
        { id: 1, category: 'Venue', name: 'Main Hall Rental', estimatedCost: 2500, actualCost: 2700, paid: true },
        { id: 2, category: 'Catering', name: 'Food & Beverages', estimatedCost: 3500, actualCost: 3200, paid: true },
        { id: 3, category: 'Decoration', name: 'Flowers & Centerpieces', estimatedCost: 1200, actualCost: 1350, paid: false },
        { id: 4, category: 'Entertainment', name: 'DJ Services', estimatedCost: 800, actualCost: 800, paid: true },
        { id: 5, category: 'Photography', name: 'Professional Photographer', estimatedCost: 1500, actualCost: 1500, paid: false },
      ];
    }

    budgetStore.loading = false;
  } catch (err) {
    budgetStore.error = 'Failed to load budget data. Please try again.';
    budgetStore.loading = false;
    console.error('Error fetching budget data:', err);
  }
}

const addBudgetItem = () => {
  // This would open a modal or navigate to a form to add a new budget item
  notify({
    title: 'Feature Coming Soon',
    text: 'Adding new budget items will be available in the next update',
    type: 'info'
  });
}

const markAsPaid = async (item) => {
  try {
    // In a real implementation, this would call the API through the store
    // await budgetStore.markBudgetItemAsPaid(item.id);

    // For now, we'll update the mock data directly
    const index = budgetStore.budgetItems.findIndex(i => i.id === item.id);
    if (index !== -1) {
      budgetStore.budgetItems[index].paid = true;
      notify({
        title: 'Item Updated',
        text: `${item.name} marked as paid`,
        type: 'success'
      });
    }
  } catch (error) {
    notify({
      title: 'Error',
      text: 'Failed to mark item as paid',
      type: 'error'
    });
    console.error('Error marking item as paid:', error);
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
      <CButton variant="gradient" @click="addBudgetItem" class="bg-gradient-to-r from-rose to-rose-dark hover:from-rose-dark hover:to-rose-darken text-white">
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

    <!-- Empty State -->
    <div v-else-if="!hasBudgetItems" class="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-card border border-gray-200 dark:border-gray-700">
      <Wallet class="w-16 h-16 mx-auto text-rose mb-4" />
      <CHeading :level="4" class="mb-2">No Budget Items Yet</CHeading>
      <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Start tracking your event expenses by adding budget items. This will help you stay organized and within budget.
      </p>
      <CButton variant="gradient" @click="addBudgetItem" class="bg-gradient-to-r from-rose to-rose-dark hover:from-rose-dark hover:to-rose-darken text-white">
        <PlusCircle class="w-4 h-4 mr-2" />
        Add Your First Budget Item
      </CButton>
    </div>

    <!-- Content when budget items exist -->
    <template v-else>
      <!-- Budget Summary -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-card border border-gray-200 dark:border-gray-700">
        <CHeading :level="4" class="mb-4">Budget Summary</CHeading>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Estimated Total</p>
            <p class="text-xl font-semibold">${{ totalEstimatedCost.toLocaleString() }}</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Actual Total</p>
            <p class="text-xl font-semibold">${{ totalActualCost.toLocaleString() }}</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Paid</p>
            <p class="text-xl font-semibold">${{ totalPaid.toLocaleString() }}</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Remaining</p>
            <p class="text-xl font-semibold">${{ totalRemaining.toLocaleString() }}</p>
          </div>
        </div>
        <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Budget Status</p>
            <p class="text-lg font-medium" :class="budgetStatus.class">{{ budgetStatus.status }}</p>
          </div>
          <div class="text-right">
            <p class="text-gray-500 dark:text-gray-400 text-sm">Difference</p>
            <p class="text-lg font-medium" :class="budgetStatus.class">
              ${{ Math.abs(totalEstimatedCost - totalActualCost).toLocaleString() }}
              {{ totalEstimatedCost >= totalActualCost ? 'under' : 'over' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Budget Items Table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-card border border-gray-200 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <CHeading :level="4">Budget Items</CHeading>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700 text-left">
              <tr>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estimated</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actual</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="item in budgetItems" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">{{ item.category }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ item.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap">${{ item.estimatedCost.toLocaleString() }}</td>
                <td class="px-6 py-4 whitespace-nowrap">${{ item.actualCost.toLocaleString() }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="item.paid ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'"
                  >
                    {{ item.paid ? 'Paid' : 'Pending' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <CButton
                    v-if="!item.paid"
                    @click="markAsPaid(item)"
                    variant="outline"
                    size="sm"
                  >
                    <DollarSign class="w-4 h-4 mr-1" />
                    Mark as Paid
                  </CButton>
                  <span v-else class="text-gray-400 dark:text-gray-500 text-sm">Completed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
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
