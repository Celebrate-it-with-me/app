<template>
  <div :class="['rounded-xl px-4 py-3 flex items-center gap-3', variantClass]">
    <slot name="icon" />
    <div class="flex-1">
      <slot name="title" />
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'info'
  }
})

const variantClass = computed(() => {
  return (
    {
      info: 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-800',
      success:
        'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-100 dark:border-green-800',
      warning:
        'bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-100 dark:border-yellow-800',
      error:
        'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-100 dark:border-red-800'
    }[props.variant] || ''
  )
})
</script>
