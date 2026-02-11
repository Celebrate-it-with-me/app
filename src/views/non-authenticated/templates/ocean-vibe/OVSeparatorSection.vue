<script setup>
import { computed } from 'vue'

const props = defineProps({
  bgColor: {
    type: String,
    default: 'blue'
  }
})

/**
 * We keep bgColor as the switch, but instead of flat backgrounds
 * we use subtle gradients aligned with the Ocean Vibe palette.
 */
const backgroundClasses = {
  blue: 'sep-blue',
  red: 'sep-red',
  purple: 'sep-purple',
  green: 'sep-green'
}

const background = computed(() => {
  return backgroundClasses[props.bgColor] || backgroundClasses.blue
})
</script>

<template>
  <div :class="['separator-container py-10 px-5', background]">
    <p class="separator-text text-center">
      <slot></slot>
    </p>
  </div>
</template>

<style scoped>
/* Base container */
.separator-container {
  position: relative;
  overflow: hidden;
}

/* Subtle highlight layer to add depth (no texture, no shapes) */
.separator-container::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;

  /* Soft “shine” that works across all gradients */
  background: radial-gradient(
    900px 180px at 50% 0%,
    rgba(255, 255, 255, 0.55),
    rgba(255, 255, 255, 0) 70%
  );
  opacity: 0.7;
}

/* Text (aligned with your Ocean vibe nav colors) */
.separator-text {
  position: relative;
  z-index: 1;
  font-size: 0.95rem;
  line-height: 1.8;
  font-weight: 500;
  color: #0b4a5a; /* deep ocean teal */
}

/* --- Gradient variants --- */
/* Ocean / Ice blue */
.sep-blue {
  background: linear-gradient(90deg, #eef7ff 0%, #dbeafe 45%, #eef7ff 100%);
}

/* Warm accent (if needed for some sections) */
.sep-red {
  background: linear-gradient(90deg, #fff1f2 0%, #ffe4e6 45%, #fff1f2 100%);
}

/* Soft lavender (if your section below is more purple-ish) */
.sep-purple {
  background: linear-gradient(90deg, #f5f3ff 0%, #ede9fe 45%, #f5f3ff 100%);
}

/* Mint/seafoam */
.sep-green {
  background: linear-gradient(90deg, #ecfeff 0%, #d1fae5 45%, #ecfeff 100%);
}
</style>
