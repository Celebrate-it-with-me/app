// Example: CButton.vue (first UI design component)
<template>
  <button
    :class="[
      'inline-flex items-center justify-center font-display transition-all duration-200 ease-in-out focus:outline-none',
      sizeClass,
      variantClass,
      rounded ? 'rounded-xl' : 'rounded',
      full ? 'w-full' : ''
    ]"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, outline, gradient
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
  },
  rounded: {
    type: Boolean,
    default: true
  },
  full: {
    type: Boolean,
    default: false
  }
})

const sizeClass = computed(() => {
  return {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2 text-base',
    lg: 'px-8 py-3 text-lg',
  }[props.size]
})

const variantClass = computed(() => {
  return {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-glow dark:bg-primary-dark dark:hover:bg-primary',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark dark:bg-secondary-dark dark:hover:bg-secondary',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white dark:border-primary dark:text-primary dark:hover:bg-primary dark:hover:text-white',
    gradient: 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-glow dark:from-primary-dark dark:to-secondary-dark',
  }[props.variant]
})
</script>

<style scoped>
/* Optionally you can add transitions, focus rings or disabled styles here */
</style>
