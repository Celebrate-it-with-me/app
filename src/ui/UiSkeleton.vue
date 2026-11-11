<script setup>
defineProps({
  /** Number of text lines to draw; ignored when width/height are given for a block. */
  lines: { type: Number, default: 0 },
  width: { type: String, default: '100%' },
  height: { type: String, default: '1rem' },
  /** Circle placeholder (avatars). */
  circle: { type: Boolean, default: false }
})
</script>

<template>
  <div v-if="lines > 0" class="flex flex-col gap-2" aria-hidden="true">
    <div
      v-for="n in lines"
      :key="n"
      class="h-4 animate-pulse rounded-md bg-cream-300"
      :style="{ width: n === lines ? '60%' : '100%' }"
    />
  </div>
  <div
    v-else
    class="animate-pulse bg-cream-300"
    :class="circle ? 'rounded-full' : 'rounded-md'"
    :style="{ width, height }"
    aria-hidden="true"
  />
</template>
