<script setup>
import { computed, defineProps } from 'vue'

const props = defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'medium' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  customClasses: { type: String, default: '' }
})

const buttonClasses = computed(() => {
  const baseStyles =
    'w-full inline-flex items-center justify-center font-medium tracking-wide rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantStyles = {
    primary:
      'bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-yellow-300 disabled:bg-yellow-300',
    secondary:
      'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400 disabled:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300 disabled:bg-red-300'
  }

  const sizeStyles = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-5 py-3 text-base',
    large: 'px-6 py-4 text-lg'
  }

  return [
    baseStyles,
    variantStyles[props.variant] || variantStyles.primary,
    sizeStyles[props.size] || sizeStyles.medium,
    props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
    props.customClasses
  ].join(' ')
})
</script>

<template>
  <button :type="type" :class="buttonClasses" :disabled="disabled || loading">
    <slot />
  </button>
</template>

<style scoped>
.spinner-border {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #fff;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
