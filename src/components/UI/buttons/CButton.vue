<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl px-4 py-2 text-sm',
      variantClasses,
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      full ? 'w-full' : '',
    ]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'button' },
  full: { type: Boolean, default: false },
  variant: {
    type: String,
    default: 'primary',
    validator: val =>
      ['primary', 'secondary', 'outline', 'ghost', 'danger', 'link', 'gradient'].includes(val)
  },
  disabled: { type: Boolean, default: false }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'gradient':
      return 'bg-gradient-to-r from-primary to-secondary text-white hover:from-primary hover:to-secondary shadow-md'
    case 'primary':
      return 'bg-primary text-white hover:bg-pink-600 shadow-pink-300 shadow-md'
    case 'secondary':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
    case 'outline':
      return 'border border-primary text-primary hover:bg-primary hover:text-white'
    case 'ghost':
      return 'bg-transparent text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'
    case 'danger':
      return 'bg-red-500 text-white hover:bg-red-600'
    case 'link':
      return 'bg-transparent text-primary underline px-0 py-0 hover:text-pink-600'
    default:
      return ''
  }
})
</script>
