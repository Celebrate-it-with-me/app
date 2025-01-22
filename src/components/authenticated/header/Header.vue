<script setup lang="ts">

</script>

<template>
  <nav class="fixed top-10 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[80%] bg-white/5 backdrop-blur-sm rounded-lg shadow-lg z-50">
    <div class="container mx-auto px-6 py-4 flex justify-between items-center">
      <div class="text-2xl font-bold">
        CelebrateItWith<span class="text-yellow-300">Me!</span>
      </div>
      <ul class="hidden md:flex space-x-6">
        <li><a href="#" class="hover:text-yellow-300 transition-colors duration-500">Home</a></li>
        <li>
          <router-link
            :to="'/dashboard/events'"
            tag="a"
            class="hover:text-yellow-300 transition-colors duration-500"
          >
            Events
          </router-link>
        </li>
        <li><a href="#" class="hover:text-yellow-300 transition-colors duration-500">Calendar</a></li>
        <li><a href="#" class="hover:text-yellow-300 transition-colors duration-500">Profile</a></li>
      </ul>
      <button class="md:hidden">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>
  </nav>
</template>

<style scoped>

</style>
