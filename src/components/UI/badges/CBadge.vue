<template>
  <span :class="['inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full', variantClass]">
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'gray',
  }
})

const variantClass = computed(() => {
  return {
    gray: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    gradient: 'bg-gradient-to-r from-primary to-secondary text-white shadow-glow'
  }[props.variant] || ''
})
</script>
