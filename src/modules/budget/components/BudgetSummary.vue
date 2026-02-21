<script setup>
import CHeading from '@/components/UI/headings/CHeading.vue'
import { DollarSign, Gauge, PieChart } from 'lucide-vue-next'
import { useBudgetSummary } from '@/modules/budget/composables/useBudgetSummary'

const emit = defineEmits(['showBudgetForm'])

const {
  budgetCap,
  totalEstimatedCost,
  totalActualCost,
  budgetStatus,

  // Chart data
  categoryData,
  categoryLabels,
  budgetProgressOptions,
  categoryChartOptions,
  budgetProgressSeries,
  budgetUsagePercentage,

  // functions
  handleShowBudgetForm
} = useBudgetSummary(emit)
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-card border border-gray-200 dark:border-gray-700"
  >
    <div class="flex justify-between items-center mb-4">
      <CHeading :level="4">Budget Summary</CHeading>
      <div
        class="bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-4 py-2 rounded-lg flex items-center"
      >
        <DollarSign class="w-4 h-4 mr-1" />
        <span class="font-semibold cursor-pointer" @click="handleShowBudgetForm()"
          >Budget Cap: ${{ budgetCap?.toLocaleString() }}</span
        >
      </div>
    </div>

    <!-- Basic budget info cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Estimated Total</p>
        <p class="text-xl font-semibold">${{ totalEstimatedCost?.toLocaleString() }}</p>
      </div>
      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Actual Total</p>
        <p class="text-xl font-semibold">${{ totalActualCost?.toLocaleString() }}</p>
      </div>
      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Budget Status</p>
        <p class="text-xl font-semibold" :class="budgetStatus.class">{{ budgetStatus.status }}</p>
      </div>
    </div>

    <!-- Charts section -->
    <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Budget Usage Progress -->
      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center">
            <Gauge class="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
            <h3 class="text-gray-700 dark:text-gray-300 font-medium">Budget Usage</h3>
          </div>
          <div
            v-if="budgetUsagePercentage > 75"
            :class="
              budgetUsagePercentage > 90
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
            "
            class="text-xs px-2 py-1 rounded-full"
          >
            {{ budgetUsagePercentage > 90 ? 'Critical' : 'Warning' }}
          </div>
        </div>
        <div class="flex flex-col items-center">
          <apexchart
            type="radialBar"
            height="200"
            :options="budgetProgressOptions"
            :series="budgetProgressSeries"
          />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            ${{ totalActualCost?.toLocaleString() }} of ${{ budgetCap?.toLocaleString() }}
          </p>
          <p v-if="budgetUsagePercentage > 90" class="text-xs text-red-500 mt-1">
            Budget cap nearly reached or exceeded!
          </p>
          <p v-else-if="budgetUsagePercentage > 75" class="text-xs text-orange-500 mt-1">
            Budget usage is high, consider reviewing expenses.
          </p>
        </div>
      </div>

      <!-- Category Distribution -->
      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg lg:col-span-2">
        <div class="flex items-center mb-2">
          <PieChart class="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
          <h3 class="text-gray-700 dark:text-gray-300 font-medium">Spending by Category</h3>
        </div>
        <div v-if="categoryData.length > 0" class="flex flex-col lg:flex-row gap-4">
          <div class="lg:w-1/2">
            <apexchart
              type="donut"
              height="250"
              :options="categoryChartOptions"
              :series="categoryData"
            />
          </div>
          <div
            class="lg:w-1/2 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg flex flex-col justify-center"
          >
            <p class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Color Legend:</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div v-for="(label, index) in categoryLabels" :key="index" class="flex items-center">
                <span
                  class="w-4 h-4 rounded-full mr-2"
                  :style="{
                    backgroundColor:
                      categoryChartOptions.colors[index % categoryChartOptions.colors.length]
                  }"
                ></span>
                <span class="text-sm text-gray-600 dark:text-gray-300">
                  {{ label }}: ${{ categoryData[index].toLocaleString() }}
                </span>
              </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Each color represents a different budget category and its spending amount.
            </p>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center h-[250px]">
          <p class="text-gray-500 dark:text-gray-400 text-sm">No category data available</p>
          <p class="text-gray-400 dark:text-gray-500 text-xs mt-1">
            Add budget items with actual costs to see the distribution
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any custom styles here */
</style>
