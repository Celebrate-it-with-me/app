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
  <div class="relative mb-12">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <CHeading :level="1" weight="black" class="text-4xl md:text-5xl text-gray-900 dark:text-white tracking-tight mb-3">
          Event <span class="text-purple-600 dark:text-purple-400">Budget</span>
        </CHeading>
        <p class="text-gray-500 dark:text-gray-400 max-w-xl text-lg leading-relaxed">
          Track and manage your event expenses
        </p>
      </div>

      <div class="flex flex-shrink-0">
        <CButton
          v-if="hasEventBudget"
          variant="gradient"
          class="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-xl shadow-purple-500/20 px-8 h-14 rounded-2xl transition-all hover:-translate-y-0.5 active:scale-95"
          @click="openAddBudgetItemModal"
        >
          <PlusCircle class="w-5 h-5 mr-2" />
          <span class="font-bold">Add Budget Item</span>
        </CButton>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
