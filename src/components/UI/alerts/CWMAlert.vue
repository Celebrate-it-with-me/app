<script setup>
import { computed } from 'vue'

const props = defineProps({
  alertType: {
    type: String,
    default: 'default'
  }
})

const alertClass = computed(() => {
  switch (props.alertType) {
    case 'default':
      return 'text-gray-800 dark:text-gray-300'
    case 'info':
      return 'text-blue-800 dark:text-blue-400'
    case 'danger':
      return 'text-red-800 dark:text-red-400'
    case 'success':
      return 'text-green-800 dark:text-green-400'
    case 'warning':
      return 'text-yellow-800 dark:text-yellow-300'
    default:
      return 'text-gray-800 dark:text-gray-300'
  }
})
</script>

<template>
  <div
    class="p-4 mb-4 text-sm rounded-lg bg-red-50 dark:bg-gray-800"
    :class="alertClass"
    role="alert"
  >
    <slot></slot>
  </div>
</template>

<style scoped></style>
