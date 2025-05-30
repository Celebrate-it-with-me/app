<script setup>
import CHeading from '@/components/UI/headings/CHeading.vue'
import { DollarSign } from 'lucide-vue-next'
import { computed } from 'vue'
import { useBudgetStore } from '@/stores/useBudgetStore'

const emit = defineEmits(['showBudgetForm'])

const budgetStore = useBudgetStore()

const budgetCap = computed(() => budgetStore.budgetCap)
const totalEstimatedCost = computed(() => budgetStore.totalEstimatedCost)
const totalActualCost = computed(() => budgetStore.totalActualCost)
const budgetStatus = computed(() => budgetStore.budgetStatus)


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

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
  </div>
</template>

<style scoped>

</style>
