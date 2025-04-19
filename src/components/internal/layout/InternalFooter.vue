<template>
  <footer class="bg-gray-900 text-white text-sm text-right px-6 py-3">
    © {{ year }} Celebrate It With Me
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>
