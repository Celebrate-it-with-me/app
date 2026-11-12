<script setup>
/**
 * One-time burst of petals for the moment a guest confirms. Pure CSS (transform + opacity),
 * decorative, hidden under prefers-reduced-motion. The parent mounts it with v-if and removes
 * it when `done` fires.
 */
import { onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['done'])

// A fan of petals: angle, distance, spin and a small delay each, so it reads as a burst and
// not as a grid. Fixed values keep the motion identical on every confirmation.
const PETALS = [
  [-78, 150, 200, 0],
  [-62, 190, -160, 40],
  [-48, 130, 240, 80],
  [-34, 210, -200, 20],
  [-20, 160, 180, 100],
  [-8, 230, -240, 60],
  [6, 140, 220, 0],
  [18, 200, -180, 120],
  [32, 170, 260, 40],
  [46, 220, -220, 90],
  [60, 140, 190, 20],
  [74, 180, -250, 110]
].map(([angle, distance, rot, delay], index) => {
  const rad = (angle * Math.PI) / 180
  return {
    id: index,
    style: {
      '--dx': `${Math.round(Math.sin(rad) * distance)}px`,
      '--dy': `${Math.round(-Math.cos(rad) * distance * 0.9)}px`,
      '--rot': `${rot}deg`,
      '--delay': `${delay}ms`
    },
    tone: index % 3 === 0 ? 'bg-inv-accent' : index % 3 === 1 ? 'bg-inv-primary' : 'bg-inv-primary/55'
  }
})

let timer
onMounted(() => {
  timer = setTimeout(() => emit('done'), 1500)
})
onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex justify-center">
    <span
      v-for="petal in PETALS"
      :key="petal.id"
      :style="petal.style"
      :class="['inv-petal absolute block h-4 w-3 rounded-[100%_0_100%_0]', petal.tone]"
    />
  </div>
</template>
