import { computed, onMounted, ref, watch } from 'vue'
import { useBudgetStore } from '@/modules/budget/stores/useBudgetStore'

export function useBudgetSummary(emit) {
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
            size: '70%'
          },
          track: {
            background: '#e7e7e7',
            strokeWidth: '97%',
            margin: 5
          },
          dataLabels: {
            name: {
              show: true,
              fontSize: '14px',
              offsetY: -10
            },
            value: {
              fontSize: '22px',
              show: true,
              formatter: function (val) {
                return val + '%'
              },
              offsetY: 10
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
        formatter: function (val) {
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
      height: 250
    },
    labels: [],
    colors: [
      '#3b82f6',
      '#8b5cf6',
      '#84cc16',
      '#f97316',
      '#ec4899',
      '#14b8a6',
      '#06b6d4',
      '#6366f1'
    ],
    legend: {
      position: 'bottom',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      labels: {
        colors: '#6b7280'
      },
      markers: {
        width: 12,
        height: 12,
        radius: 12
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      },
      formatter: function (seriesName, opts) {
        // Add dollar amount to the legend
        return seriesName + ': $' + categoryData.value[opts.seriesIndex].toLocaleString()
      },
      show: true
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
              formatter: function (w) {
                return '$' + w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString()
              }
            }
          }
        }
      }
    },
    responsive: [
      {
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
      }
    ]
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
            const category = budgetStore.budgetCategories.find(
              c => c.value === parseInt(categoryId)
            )
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
  watch(
    () => budgetStore.budgetItems,
    () => {
      processCategoryData()
    },
    { deep: true }
  )

  // Lifecycle hooks
  onMounted(() => {
    processCategoryData()
  })

  const handleShowBudgetForm = () => {
    emit('showBudgetForm')
  }

  return {
    budgetCap,
    totalEstimatedCost,
    totalActualCost,
    budgetStatus,
    budgetItemsByCategory,
    hasBudgetItems,

    // Chart data
    categoryData,
    categoryLabels,
    budgetProgressOptions,
    categoryChartOptions,
    budgetProgressSeries,
    budgetUsageColor,
    budgetUsagePercentage,

    // functions
    handleShowBudgetForm,
    processCategoryData
  }
}
