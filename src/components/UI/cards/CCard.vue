<template>
  <div :class="['rounded-xl transition-all duration-300', baseStyle, variantClass]">
    <slot name="image" />
    <slot name="header" />
    <div v-if="variant !== 'gallery'" :class="`${padding} space-y-3`">
      <slot name="icon" />
      <slot name="title" />
      <slot name="subtitle" />
      <slot name="content" />
      <slot name="cta" />
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  padding: {
    type: String,
    default: 'p-6' // p-6, p-4, p-2
  },
  variant: {
    type: String,
    default: 'default' // default, testimonial, pricing, gallery, feature
  }
})

const baseStyle = 'bg-white dark:bg-gray-800 shadow-card'

const variantClass = computed(() => {
  return (
    {
      default: '',
      testimonial: 'text-left',
      pricing: 'text-center bg-white dark:bg-gray-800',
      gallery: 'p-0 shadow-xl',
      feature: 'text-left border border-gray-200 dark:border-gray-700'
    }[props.variant] || ''
  )
})
</script>
