<script setup>
import { toRef } from 'vue'

const props = defineProps({
  color: { type: String, required: false, default: 'black' },
  width: { type: [String, Number], required: false, default: '512' },
  height: { type: [String, Number], required: false, default: '512' }
})

const color = toRef(props, 'color')
const width = toRef(props, 'width')
const height = toRef(props, 'height')
</script>

<template>
  <svg
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 24 24"
    :width="width"
    :height="height"
  >
    <rect y="11" width="24" height="2" :fill="color" />
    <rect y="4" width="24" height="2" :fill="color" />
    <rect y="18" width="24" height="2" :fill="color" />
  </svg>
</template>
