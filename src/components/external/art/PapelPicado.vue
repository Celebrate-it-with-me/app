<script setup>
/**
 * A papel picado garland: cut-paper flags on a string, the ornament of every Latino party.
 * Pure SVG, repeats to fill the width. Sways gently; still under reduced motion.
 */
defineProps({
  /** Flag colors cycle through this list. */
  colors: { type: Array, default: () => ['#f0c6d0', '#e6cf93', '#d27a91', '#f6ecd4', '#e3a1b1'] },
  /** How many flags to draw. */
  count: { type: Number, default: 14 }
})
</script>

<template>
  <svg
    class="papel-picado block h-14 w-full sm:h-16"
    viewBox="0 0 1400 120"
    preserveAspectRatio="xMinYMin slice"
    aria-hidden="true"
  >
    <defs>
      <!-- Cut pattern: a small flower and diamonds, like the punched paper. -->
      <mask id="pp-cut">
        <rect width="100" height="100" fill="white" />
        <!-- a six-petal flower -->
        <g fill="black" transform="translate(50 40)">
          <circle r="5" />
          <ellipse rx="4.5" ry="9" transform="translate(0 -12)" />
          <ellipse rx="4.5" ry="9" transform="rotate(60) translate(0 -12)" />
          <ellipse rx="4.5" ry="9" transform="rotate(120) translate(0 -12)" />
          <ellipse rx="4.5" ry="9" transform="rotate(180) translate(0 -12)" />
          <ellipse rx="4.5" ry="9" transform="rotate(240) translate(0 -12)" />
          <ellipse rx="4.5" ry="9" transform="rotate(300) translate(0 -12)" />
        </g>
        <!-- small diamonds in the corners and along the bottom -->
        <g fill="black">
          <path d="M16 12 l4 5 -4 5 -4 -5z M84 12 l4 5 -4 5 -4 -5z" />
          <path d="M28 64 l3 4 -3 4 -3 -4z M50 66 l3 4 -3 4 -3 -4z M72 64 l3 4 -3 4 -3 -4z" />
        </g>
      </mask>
    </defs>
    <path d="M0 6 Q700 26 1400 6" fill="none" stroke="#9a7a2e" stroke-width="1.5" />
    <g v-for="i in count" :key="i" class="pp-flag" :style="{ '--i': i }">
      <g :transform="`translate(${(i - 1) * 100} 8)`">
        <path
          d="M0 0 H100 V72 L88 84 L76 72 L64 84 L52 72 L40 84 L28 72 L16 84 L4 72 Z"
          :fill="colors[(i - 1) % colors.length]"
          mask="url(#pp-cut)"
        />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.pp-flag {
  transform-box: fill-box;
  transform-origin: 50% 0;
  animation: pp-sway 5.5s ease-in-out infinite alternate;
  animation-delay: calc(var(--i) * -0.4s);
}
@keyframes pp-sway {
  from {
    transform: rotate(-1.6deg);
  }
  to {
    transform: rotate(1.6deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .pp-flag {
    animation: none;
  }
}
</style>
