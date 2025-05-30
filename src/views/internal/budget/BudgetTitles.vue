<script setup>
import CHeading from '@/components/UI/headings/CHeading.vue'
import { PlusCircle } from 'lucide-vue-next'
import CButton from '@/components/UI/buttons/CButton.vue'
import { computed } from 'vue'
import { useBudgetStore } from '@/stores/useBudgetStore'

const budgetStore = useBudgetStore()
const emit = defineEmits(['openItemModal'])
const hasEventBudget = computed(() => budgetStore.hasEventBudget)

const openAddBudgetItemModal = () => {
  emit('openItemModal')
}
</script>

<template>
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
</template>

<style scoped>

</style>
