<script setup>
/**
 * Quinvite wordmark. Inline SVG so it inherits the page fonts and `currentColor`.
 * - `mark`: only the monogram (navbar on phones, favicon-like uses)
 * - default: monogram + wordmark
 */
defineProps({
  mark: { type: Boolean, default: false },
  /** Height in Tailwind units via class (e.g. h-8). Width follows the aspect ratio. */
  title: { type: String, default: 'Quinvite' }
})
</script>

<template>
  <svg
    v-if="mark"
    viewBox="0 0 40 40"
    role="img"
    :aria-label="title"
    class="inline-block h-9 w-auto"
    v-bind="$attrs"
  >
    <rect width="40" height="40" rx="12" class="fill-rose-600" />
    <text
      x="20"
      y="28"
      text-anchor="middle"
      font-family="Fraunces, Georgia, serif"
      font-size="25"
      font-weight="500"
      class="fill-white"
    >
      Q
    </text>
    <circle cx="31" cy="9" r="3" class="fill-gold-300" />
  </svg>
  <svg
    v-else
    viewBox="0 0 170 40"
    role="img"
    :aria-label="title"
    class="inline-block h-9 w-auto"
    v-bind="$attrs"
  >
    <rect width="40" height="40" rx="12" class="fill-rose-600" />
    <text
      x="20"
      y="28"
      text-anchor="middle"
      font-family="Fraunces, Georgia, serif"
      font-size="25"
      font-weight="500"
      class="fill-white"
    >
      Q
    </text>
    <circle cx="31" cy="9" r="3" class="fill-gold-300" />
    <text
      x="50"
      y="28.5"
      font-family="Fraunces, Georgia, serif"
      font-size="26"
      font-weight="500"
      letter-spacing="-0.5"
      class="fill-current"
    >
      Quinvite
    </text>
  </svg>
</template>

<script>
export default { inheritAttrs: false }
</script>
