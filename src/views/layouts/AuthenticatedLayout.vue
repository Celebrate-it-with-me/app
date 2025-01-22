<script setup>
import Header from '@/components/authenticated/header/Header.vue'
</script>

<template>
  <div class="relative min-h-screen bg-gray-900 text-gray-200">
    <!-- Floating Navigation Bar -->
    <Header />

    <!-- Main Content -->
    <div class="container md:w-[80%] mx-auto px-6 pt-32">
      <router-view />
    </div>
  </div>

</template>

<style scoped>

</style>
