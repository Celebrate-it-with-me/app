<script setup>
import CHeading from '@/components/UI/headings/CHeading.vue'
import { DollarSign, PieChart, Gauge } from 'lucide-vue-next'
import { computed, ref, onMounted, watch } from 'vue'
import { useBudgetStore } from '@/stores/useBudgetStore'

const emit = defineEmits(['showBudgetForm'])

const budgetStore = useBudgetStore()

const budgetCap = computed(() => budgetStore.budgetCap)
const totalEstimatedCost = computed(() => budgetStore.totalEstimatedCost)
const totalActualCost = computed(() => budgetStore.totalActualCost)
const budgetStatus = computed(() => budgetStore.budgetStatus)
const budgetItemsByCategory = computed(() => budgetStore.budgetItemsByCategory)
const hasBudgetItems = computed(() => budgetStore.hasBudgetItems)

// Chart data
const categoryData = ref([])
const categoryLabels = ref([])

// Calculate budget usage percentage
const budgetUsagePercentage = computed(() => {
  if (budgetCap.value === 0) return 0

  // Calculate percentage of budget used
  const percentUsed = Math.round((totalActualCost.value / budgetCap.value) * 100)

  return percentUsed > 100 ? 100 : percentUsed
})

// Determine color based on percentage
const budgetUsageColor = computed(() => {
  const percentUsed = budgetUsagePercentage.value

  if (percentUsed > 90) {
    return '#ef4444' // Red for over 90%
  } else if (percentUsed > 75) {
    return '#f97316' // Orange for over 75%
  } else {
    return '#22c55e' // Green for under 75%
  }
})

// Budget usage progress chart options
const budgetProgressOptions = computed(() => {
  return {
    chart: {
      height: 150,
      type: 'radialBar',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 0,
          size: '70%',
        },
        track: {
          background: '#e7e7e7',
          strokeWidth: '97%',
          margin: 5,
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '14px',
            offsetY: -10,
          },
          value: {
            fontSize: '22px',
            show: true,
            formatter: function(val) {
              return val + '%'
            },
            offsetY: 10,
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: ['#f43f5e'],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round'
    },
    colors: [budgetUsageColor.value],
    labels: ['Budget Used'],
    valueText: {
      formatter: function(val) {
        return val + '%'
      }
    }
  }
})

// Budget usage progress series
const budgetProgressSeries = computed(() => {
  return [budgetUsagePercentage.value]
})

// Category distribution chart options
const categoryChartOptions = ref({
  chart: {
    type: 'donut',
    height: 250,
  },
  labels: [],
  colors: ['#3b82f6', '#8b5cf6', '#84cc16', '#f97316', '#ec4899', '#14b8a6', '#06b6d4', '#6366f1'],
  legend: {
    position: 'bottom',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    labels: {
      colors: '#6b7280',
    },
    markers: {
      width: 12,
      height: 12,
      radius: 12,
    },
    itemMargin: {
      horizontal: 10,
      vertical: 5
    },
    formatter: function(seriesName, opts) {
      // Add dollar amount to the legend
      return seriesName + ': $' + categoryData.value[opts.seriesIndex].toLocaleString()
    },
    show: true,
  },
  dataLabels: {
    enabled: false
  },
  plotOptions: {
    pie: {
      donut: {
        size: '60%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            formatter: function(w) {
              return '$' + w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString()
            }
          }
        }
      }
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        height: 300
      },
      legend: {
        position: 'bottom',
        fontSize: '12px',
        offsetY: 5
      }
    }
  }]
})


// Process category data for the chart
const processCategoryData = () => {
  if (!hasBudgetItems.value) {
    categoryData.value = []
    categoryLabels.value = []
    return
  }

  const data = []
  const labels = []

  // Process each category
  Object.entries(budgetItemsByCategory.value).forEach(([categoryId, items]) => {
    if (items.length > 0) {
      // Calculate total actual cost for this category
      const categoryCost = items.reduce((sum, item) => sum + (item.actualCost || 0), 0)

      if (categoryCost > 0) {
        // Get category name
        let categoryName = 'Uncategorized'
        if (categoryId !== 'uncategorized') {
          const category = budgetStore.budgetCategories.find(c => c.value === parseInt(categoryId))
          if (category) {
            categoryName = category.label
          }
        }

        data.push(categoryCost)
        labels.push(categoryName)
      }
    }
  })

  categoryData.value = data
  categoryLabels.value = labels
  categoryChartOptions.value.labels = labels
}

// Watch for changes in budget items
watch(() => budgetStore.budgetItems, () => {
  processCategoryData()
}, { deep: true })

// Lifecycle hooks
onMounted(() => {
  processCategoryData()
})

const handleShowBudgetForm = () => {
  emit('showBudgetForm')
}

</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-card border border-gray-200 dark:border-gray-700">
    <div class="flex justify-between items-center mb-4">
      <CHeading :level="4">Budget Summary</CHeading>
      <div class="bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-4 py-2 rounded-lg flex items-center">
        <DollarSign class="w-4 h-4 mr-1" />
        <span
          class="font-semibold cursor-pointer"
          @click="handleShowBudgetForm()"
        >Budget Cap: ${{ budgetCap?.toLocaleString() }}</span>
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
          <div v-if="budgetUsagePercentage > 75"
               :class="budgetUsagePercentage > 90 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'"
               class="text-xs px-2 py-1 rounded-full">
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
          <div class="lg:w-1/2 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg flex flex-col justify-center">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Color Legend:</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div v-for="(label, index) in categoryLabels" :key="index" class="flex items-center">
                <span
                  class="w-4 h-4 rounded-full mr-2"
                  :style="{ backgroundColor: categoryChartOptions.colors[index % categoryChartOptions.colors.length] }"
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
          <p class="text-gray-400 dark:text-gray-500 text-xs mt-1">Add budget items with actual costs to see the distribution</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Add any custom styles here */
</style>
