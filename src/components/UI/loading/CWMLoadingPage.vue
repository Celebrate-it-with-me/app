<template>
  <div
    class="flex items-center justify-center h-screen bg-white dark:bg-gray-900 text-text font-[Poppins]"
  >
    <div class="flex flex-col items-center">
      <div class="text-3xl font-extrabold text-gray-900 dark:text-white">
        Celebrate<span class="text-primary">It</span><span class="text-secondary">WithMe!</span>
      </div>

      <div class="relative w-24 h-24 mt-10">
        <div
          class="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent"
        ></div>
        <div
          class="absolute inset-4 animate-pulse rounded-full border-4 border-secondary border-b-transparent"
        ></div>
        <div class="absolute inset-8 rounded-full bg-white dark:bg-gray-900 shadow-inner"></div>
      </div>

      <p class="mt-8 text-lg text-primary dark:text-secondary font-medium animate-pulse">
        {{ loadingText }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loadingText: {
    type: String,
    default: 'Loading your celebration...'
  }
})
</script>
