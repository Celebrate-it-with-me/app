<script setup lang="ts">
defineProps({
  iconSize: {
    type: String,
    default: 'w-5 h-5'
  }
})
</script>

<template>
  <svg
    :class="iconSize"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
  </svg>
  <span class="sr-only">Warning icon</span>
</template>

<style scoped>

</style>
