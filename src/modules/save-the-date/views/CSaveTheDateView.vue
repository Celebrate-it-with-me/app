<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
    <!-- Header -->
    <CSaveTheDateHeader />

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm"
    >
      <CWMLoading class="w-12 h-12 text-pink-500 mb-4" />
      <p class="text-gray-500 font-medium">Loading settings...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-6">
      <!-- Settings Sections (only if enabled) -->
      <div v-if="isEnabled" class="space-y-6 animate-in fade-in duration-500">
        <!-- Countdown Settings -->
        <CSaveTheDateCountdownSettings v-model="form" />

        <!-- Calendar Settings -->
        <CSaveTheDateCalendarSettings v-model="form" />

        <!-- Save Actions -->
        <CSaveTheDateActions :saving="saving" @save="handleSave" />
      </div>

      <!-- Empty State / Promotion when disabled -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200"
      >
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Calendar class="w-10 h-10 text-gray-300" />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Save the Date</h3>
        <p class="text-gray-500 mb-8 text-center max-w-md">
          This feature shows the countdown and allows saving the event into the calendar.
        </p>
        <CButton variant="primary" class="px-8 h-12 rounded-xl" @click="handleEnable">
          Setup Save the Date
        </CButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Calendar } from 'lucide-vue-next'
import { useSaveTheDateController } from '../composables/useSaveTheDateController'

// Module Components
import CSaveTheDateHeader from '../components/CSaveTheDateHeader.vue'
import CSaveTheDateCountdownSettings from '../components/CSaveTheDateCountdownSettings.vue'
import CSaveTheDateCalendarSettings from '../components/CSaveTheDateCalendarSettings.vue'
import CSaveTheDateActions from '../components/CSaveTheDateActions.vue'

// UI Components
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import CButton from '@/components/UI/buttons/CButton.vue'

const { form, loading, saving, isEnabled, isCreating, handleEnable, handleSave } =
  useSaveTheDateController()
</script>

<style scoped>
.animate-in {
  animation-duration: 0.5s;
}
</style>
