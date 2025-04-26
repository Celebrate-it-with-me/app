<script setup>
import STDCountDown from '@/components/internal/save-the-date/STDCountDown.vue'
import STDAddToCalendar from '@/components/internal/save-the-date/STDAddToCalendar.vue'
import { useSaveTheDateStore } from '@/stores/useSaveTheDateStore'

const stdStore = useSaveTheDateStore()

</script>

<template>
  <div
    class="event-handle w-full rounded-2xl border border-gray-200 dark:border-gray-100
           flex flex-col justify-center items-center p-6 bg-cover bg-center"
  >
    <div class="titles-section text-center space-y-2">
      <h1
        v-if="stdStore.title"
        :style="stdStore.titleStyles"
      >
        {{ stdStore.title }}
      </h1>

      <h3
        v-if="stdStore?.message"
        :style="stdStore.messageStyles"
      >
        {{ stdStore.message }}
      </h3>
    </div>

    <div v-if="stdStore?.useCountdown" class="mt-8">
      <STDCountDown />
    </div>

    <div v-if="stdStore?.addToCalendar" class="mt-6">
      <STDAddToCalendar />
    </div>
  </div>
</template>


<style scoped>

</style>
