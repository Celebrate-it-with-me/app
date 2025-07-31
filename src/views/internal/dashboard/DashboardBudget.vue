<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  Wallet,
  Plus,
  Trash2,
  DollarSign,
  AlertCircle,
  Loader2,
  ArrowUpRight
} from 'lucide-vue-next'
import CButton from '@/components/UI/buttons/CButton.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'

// Mock data - would be replaced with actual API calls
const budgetItems = ref([
  { id: 1, category: 'Venue', description: 'Main hall rental', amount: 2500, paid: 1000 },
  { id: 2, category: 'Catering', description: 'Food and beverages', amount: 3500, paid: 1750 },
  {
    id: 3,
    category: 'Decoration',
    description: 'Flowers and table settings',
    amount: 1200,
    paid: 600
  },
  { id: 4, category: 'Entertainment', description: 'DJ services', amount: 800, paid: 400 }
])

// Component state
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const isAddingItem = ref(false)

// New budget item form
const newItem = ref({
  category: '',
  description: '',
  amount: '',
  paid: '0'
})

// Category options
const categoryOptions = [
  { value: 'Venue', label: 'Venue' },
  { value: 'Catering', label: 'Catering' },
  { value: 'Decoration', label: 'Decoration' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Photography', label: 'Photography' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Attire', label: 'Attire' },
  { value: 'Other', label: 'Other' }
]

// Computed properties
const totalBudget = computed(() => {
  return budgetItems.value.reduce((total, item) => total + Number(item.amount), 0)
})

const totalPaid = computed(() => {
  return budgetItems.value.reduce((total, item) => total + Number(item.paid), 0)
})

const totalRemaining = computed(() => {
  return totalBudget.value - totalPaid.value
})

const budgetProgress = computed(() => {
  return totalBudget.value > 0 ? (totalPaid.value / totalBudget.value) * 100 : 0
})

// Methods
const addBudgetItem = () => {
  if (!newItem.value.category || !newItem.value.description || !newItem.value.amount) {
    return
  }

  const id = Math.max(0, ...budgetItems.value.map(item => item.id)) + 1

  budgetItems.value.push({
    id,
    category: newItem.value.category,
    description: newItem.value.description,
    amount: Number(newItem.value.amount),
    paid: Number(newItem.value.paid)
  })

  // Reset form
  newItem.value = {
    category: '',
    description: '',
    amount: '',
    paid: '0'
  }

  // Close add item form
  isAddingItem.value = false
}

const removeBudgetItem = id => {
  budgetItems.value = budgetItems.value.filter(item => item.id !== id)
}

// Load budget data
const loadBudgetData = () => {
  isLoading.value = true
  hasError.value = false

  // Simulate API call
  setTimeout(() => {
    // In a real implementation, you would fetch data from an API
    isLoading.value = false
  }, 500)
}

// Event listener for dashboard refresh
const handleDashboardRefresh = () => {
  loadBudgetData()
}

// Lifecycle hooks
onMounted(() => {
  // Initial data load
  loadBudgetData()

  // Listen for dashboard refresh events
  document.addEventListener('dashboard-refresh', handleDashboardRefresh)
})

onBeforeUnmount(() => {
  // Clean up event listener
  document.removeEventListener('dashboard-refresh', handleDashboardRefresh)
})
</script>

<template>
  <section
    class="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl relative overflow-hidden"
    :class="{ 'opacity-75': isLoading }"
    aria-labelledby="budget-title"
  >
    <!-- Loading overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-70 flex items-center justify-center z-10"
    >
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div
        id="budget-title"
        class="flex items-center gap-2 text-amber-600 font-semibold text-sm bg-amber-50 dark:bg-amber-950 px-3 py-1.5 rounded-full"
      >
        <Wallet class="w-4 h-4" aria-hidden="true" />
        <span>Budget Tracker</span>
      </div>
      <CButton
        :variant="isAddingItem ? 'secondary' : 'primary'"
        size="sm"
        class="rounded-full flex items-center gap-1 transition-transform hover:scale-105"
        @click="isAddingItem = !isAddingItem"
      >
        <Plus v-if="!isAddingItem" class="w-4 h-4" aria-hidden="true" />
        <span>{{ isAddingItem ? 'Cancel' : 'Add Expense' }}</span>
      </CButton>
    </div>

    <!-- Error state -->
    <div v-if="hasError" class="text-center py-4">
      <div class="text-red-500 mb-2">
        <AlertCircle class="h-10 w-10 mx-auto" aria-hidden="true" />
      </div>
      <p class="text-red-600 dark:text-red-400 font-medium">{{ errorMessage }}</p>
      <button
        class="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium transition-colors"
        aria-label="Retry loading budget data"
        @click="loadBudgetData"
      >
        Try again
      </button>
    </div>

    <!-- Add new budget item form -->
    <div v-if="isAddingItem" class="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <CSelect
            v-model="newItem.category"
            name="category"
            placeholder="Category"
            :options="categoryOptions"
            class="w-full"
          />
        </div>
        <div>
          <CInput
            v-model="newItem.description"
            name="description"
            placeholder="Description"
            class="w-full"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div class="relative">
          <CInput
            v-model="newItem.amount"
            name="amount"
            placeholder="Total Amount"
            type="number"
            min="0"
            class="w-full pl-8"
          />
          <DollarSign
            class="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          />
        </div>
        <div class="relative">
          <CInput
            v-model="newItem.paid"
            name="paid"
            placeholder="Amount Paid"
            type="number"
            min="0"
            class="w-full pl-8"
          />
          <DollarSign
            class="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          />
        </div>
      </div>

      <div class="flex justify-end">
        <CButton
          variant="primary"
          :disabled="!newItem.category || !newItem.description || !newItem.amount"
          @click="addBudgetItem"
        >
          Add Item
        </CButton>
      </div>
    </div>

    <!-- Budget summary -->
    <div class="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Budget</div>
        <div class="text-xl font-bold text-gray-800 dark:text-white">
          ${{ totalBudget.toLocaleString() }}
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Paid</div>
        <div class="text-xl font-bold text-green-600">${{ totalPaid.toLocaleString() }}</div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Remaining</div>
        <div class="text-xl font-bold text-amber-600">${{ totalRemaining.toLocaleString() }}</div>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="mb-4">
      <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>Budget Progress</span>
        <span>{{ Math.round(budgetProgress) }}%</span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div class="bg-amber-500 h-2.5 rounded-full" :style="{ width: `${budgetProgress}%` }"></div>
      </div>
    </div>

    <!-- Budget items list -->
    <div class="overflow-y-auto max-h-64">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              scope="col"
              class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Category
            </th>
            <th
              scope="col"
              class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Description
            </th>
            <th
              scope="col"
              class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Amount
            </th>
            <th
              scope="col"
              class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Paid
            </th>
            <th
              scope="col"
              class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          <tr
            v-for="item in budgetItems"
            :key="item.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
              {{ item.category }}
            </td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ item.description }}
            </td>
            <td
              class="px-3 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right"
            >
              ${{ item.amount.toLocaleString() }}
            </td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-green-600 text-right">
              ${{ item.paid.toLocaleString() }}
            </td>
            <td class="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
              <button class="text-red-500 hover:text-red-700" @click="removeBudgetItem(item.id)">
                <Trash2 class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- View full budget link -->
    <div class="mt-4 text-right">
      <a
        href="#"
        class="text-amber-600 hover:text-amber-800 text-sm font-medium inline-flex items-center"
      >
        View Full Budget
        <ArrowUpRight class="w-3 h-3 ml-1" />
      </a>
    </div>

    <!-- Loading indicator when refreshing with existing data -->
    <div v-if="isLoading" class="absolute bottom-4 right-4 flex items-center justify-center">
      <Loader2 class="w-4 h-4 text-amber-500 animate-spin" aria-hidden="true" />
      <span class="ml-2 text-xs text-gray-500">Refreshing...</span>
    </div>
  </section>
</template>
