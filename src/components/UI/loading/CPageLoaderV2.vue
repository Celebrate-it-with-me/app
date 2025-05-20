<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-400 via-fuchsia-500 to-purple-600 animate-fadeIn">
    <div class="flex flex-col items-center space-y-6">
      <img
        :src="logo"
        alt="Celebrate It With Me Logo"
        class="w-40 md:w-64 animate-glow"
      />
      <p class="text-white text-lg font-semibold tracking-wide animate-pulse">Loading your celebration...</p>
    </div>
  </div>
</template>

<script setup>
const logo = new URL('@/assets/images/commons/logo_primary_2.png', import.meta.url).href
</script>

<style scoped>
@keyframes glow {
  0%, 100% {
    filter: drop-shadow(0 0 5px #ec4899) drop-shadow(0 0 10px #f472b6);
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 20px #8b5cf6) drop-shadow(0 0 40px #ec4899);
    transform: scale(1.05);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-glow {
  animation: glow 2.5s ease-in-out infinite;
}

.animate-fadeIn {
  animation: fadeIn 1.2s ease-out;
}
</style>
