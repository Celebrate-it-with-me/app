<script setup>
import { computed } from 'vue'

const props = defineProps({
  bgColor: {
    type: String,
    default: 'blue'
  }
})

const backgroundClasses = {
  blue: 'bg-blue-100',
  red: 'bg-red-200',
  purple: 'bg-purple-100',
  green: 'bg-green-100'
}

const background = computed(() => {
  return backgroundClasses[props.bgColor] || backgroundClasses.blue
})
</script>

<template>
  <div :class="['separator-container py-10 px-5', background]">
    <p class="text-sm text-gray-800 text-center">
      <slot></slot>
    </p>
  </div>
</template>

<style scoped></style>
