<template>
  <div class="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Spinner -->
    <div class="flex flex-col items-center">
      <div class="text-2xl font-bold"> CelebrateItWith<span class="text-yellow-300">Me!</span></div>
      <div class="relative flex flex-col items-center mt-10">
        <!-- Circle Pulsing Animation -->
        <div class="relative w-20 h-20">
          <div class="absolute top-0 left-0 right-0 bottom-0 m-auto w-full h-full border-4
                      border-t-transparent border-yellow-300 rounded-full animate-spin"
          ></div>
          <div class="absolute top-0 left-0 right-0 bottom-0 m-auto w-16 h-16 border-4
                      border-t-transparent border-gray-700 rounded-full animate-pulse"></div>
          <div class="absolute top-0 left-0 right-0 bottom-0 m-auto w-12 h-12
                      bg-white rounded-full"
          ></div>
        </div>

        <!-- Text Below the Loader -->
        <p class="mt-6 text-lg font-semibold text-white drop-shadow-md animate-bounce mt-10">
          Loading your app...
        </p>
      </div>
    </div>
  </div>


</template>

<script setup>
defineProps({
  loadingText: {
    type: String,
    default: 'Loading, please wait...',
  },
});
</script>
