<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 font-medium rounded-full',
      variantClass,
      sizeClass
    ]"
  >
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'gray',
    validator: val =>
      ['gray', 'primary', 'secondary', 'success', 'warning', 'error', 'gradient'].includes(val)
  },
  size: {
    type: String,
    default: 'md',
    validator: val => ['sm', 'md', 'lg'].includes(val)
  }
})

const variantClass = computed(() => {
  return (
    {
      gray: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      primary: 'bg-primary text-white',
      secondary: 'bg-secondary text-white',
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      gradient: 'bg-gradient-to-r from-primary to-secondary text-white shadow-glow'
    }[props.variant] || ''
  )
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-xs'
    case 'lg':
      return 'text-base px-3 py-1'
    case 'md':
    default:
      return 'text-sm'
  }
})
</script>
