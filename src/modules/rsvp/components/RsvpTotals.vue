<template>
  <div>
    <CButton variant="outline" :disabled="loading" @click="toggleShowTotals">
      <LucideBarChart2 class="w-4 h-4 mr-2" />
      Show Totals
    </CButton>

    <div v-if="showTotals" class="mt-4 bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">RSVP Summary</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="(value, label) in formattedTotals" :key="label" class="text-center">
          <div class="text-2xl font-bold text-primary">{{ value }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-300">{{ label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import { LucideBarChart2 } from 'lucide-vue-next'
import { useRsvpTotals } from '../composables/useRsvpTotals'

const { loading, showTotals, toggleShowTotals, formattedTotals } = useRsvpTotals()
</script>
