<script setup>
import { ref } from 'vue'
const enabled = ref(false)
</script>

<template>
  <section class="mb-10 max-w-md">
    <h2 class="text-xl font-bold mb-4">Toggle</h2>
    <label class="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        v-model="enabled"
        class="sr-only peer"
      />
      <div
        class="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary dark:bg-gray-700 peer-checked:bg-primary transition-all duration-300"
      ></div>
      <div
        class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 peer-checked:translate-x-5"
      ></div>
      <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">Enable feature</span>
    </label>
  </section>
</template>

<style scoped>
/* Toggle-specific styles if needed */
</style>
