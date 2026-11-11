<template>
  <footer class="bg-gray-900 text-white text-sm px-6 py-4">
    <div class="flex flex-col md:flex-row justify-between items-center">
      <div class="mb-2 md:mb-0">© {{ year }} Quinvite</div>
      <div class="flex space-x-4">
        <RouterLink to="/terms" class="text-gray-300 hover:text-white transition-colors"
          >Terms</RouterLink
        >
        <RouterLink to="/privacy" class="text-gray-300 hover:text-white transition-colors"
          >Privacy</RouterLink
        >
        <RouterLink to="/help" class="text-gray-300 hover:text-white transition-colors"
          >Help</RouterLink
        >
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
const year = new Date().getFullYear()
</script>
