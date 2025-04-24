<template>
  <div class="flex flex-col items-center justify-center gap-2 p-6">
    <Loader :class="`animate-spin size-${size} text-primary`" />
    <span class="text-sm text-gray-600 dark:text-gray-300">Loading...</span>
  </div>
</template>

<script setup>
import { Loader } from 'lucide-vue-next'

defineProps({
  size: {
    type: Number,
    default: 6
  }
})
</script>
