<template>
  <component
    :is="tag"
    :class="[
      'font-display leading-tight',
      sizeClass,
      weightClass,
      gradient
        ? 'bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text'
        : textColorClass
    ]"
  >
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  level: {
    type: Number,
    default: 1,
    validator: val => val >= 1 && val <= 6
  },
  gradient: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: ''
  },
  weight: {
    type: String,
    default: 'bold'
  }
})

const tag = computed(() => `h${props.level}`)

const sizeClass = computed(() => {
  return {
    1: 'text-4xl sm:text-5xl',
    2: 'text-3xl sm:text-4xl',
    3: 'text-2xl sm:text-3xl',
    4: 'text-xl sm:text-2xl',
    5: 'text-lg sm:text-xl',
    6: 'text-base sm:text-lg'
  }[props.level]
})

const textColorClass = computed(() => {
  return props.color ? props.color : 'text-text dark:text-white'
})

const weightClass = computed(() => `font-${props.weight}`)
</script>
