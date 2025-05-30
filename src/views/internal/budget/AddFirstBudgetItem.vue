<script setup>
import CHeading from '@/components/UI/headings/CHeading.vue'
import { PlusCircle, Wallet } from 'lucide-vue-next'
import CButton from '@/components/UI/buttons/CButton.vue'
import { computed } from 'vue'
import { useBudgetStore } from '@/stores/useBudgetStore'

const emit = defineEmits(['openItemModal'])

const budgetStore = useBudgetStore()

const hasBudgetItems = computed(() => budgetStore.hasBudgetItems)

const openAddBudgetItemModal = () => {
  emit('openItemModal')
}
</script>

<template>
  <div v-if="!hasBudgetItems" class="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-card border border-gray-200 dark:border-gray-700">
    <Wallet class="w-16 h-16 mx-auto text-rose mb-4" />
    <CHeading :level="4" class="mb-2">No Budget Items Yet</CHeading>
    <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
      Start tracking your event expenses by adding budget items. This will help you stay organized and within budget.
    </p>
    <CButton
      variant="gradient"
      @click="openAddBudgetItemModal"
      class="bg-gradient-to-r from-rose to-rose-dark hover:from-rose-dark hover:to-rose-darken text-white"
    >
      <PlusCircle class="w-4 h-4 mr-2" />
      Add Your First Budget Item
    </CButton>
  </div>
</template>

<style scoped>

</style>
