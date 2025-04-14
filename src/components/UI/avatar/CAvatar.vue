<template>
  <div
    :class="[
      'inline-flex items-center justify-center overflow-hidden rounded-full',
      sizeClass,
      bordered ? 'ring-2 ring-primary' : ''
    ]"
  >
    <img v-if="src" :src="src" :alt="alt" class="object-cover w-full h-full" />
    <span v-else class="text-sm font-medium text-white bg-gray-400 w-full h-full flex items-center justify-center">
      {{ initials }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  src: String,
  alt: {
    type: String,
    default: 'User Avatar'
  },
  name: String,
  size: {
    type: String,
    default: 'md', // sm, md, lg
  },
  bordered: {
    type: Boolean,
    default: false
  }
})

const sizeClass = computed(() => {
  return {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base'
  }[props.size]
})

const initials = computed(() => {
  if (!props.name) return '👤'
  const parts = props.name.split(' ')
  return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
})
</script>
