<script setup>
/**
 * Divider with a diamond and curling leaves. It draws itself outward once, when armed.
 * The paths carry `inv-stroke` (not an attribute selector): SVG attribute names are case-sensitive
 * and browsers can miss restyling descendants selected by `[pathLength]` when a class changes.
 */
</script>

<template>
  <svg
    viewBox="0 0 200 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    data-draw
    class="inv-draw mx-auto h-6 w-48 text-inv-accent"
  >
    <path class="inv-stroke" pathLength="1" d="M92 12 H 58 C 48 12 44 6 36 6 C 28 6 26 12 30 14" />
    <path class="inv-stroke" pathLength="1" d="M58 12 C 52 18 42 19 36 16" />
    <path class="inv-stroke" pathLength="1" d="M108 12 H 142 C 152 12 156 6 164 6 C 172 6 174 12 170 14" />
    <path class="inv-stroke" pathLength="1" d="M142 12 C 148 18 158 19 164 16" />
    <g class="inv-draw-fade">
      <path d="M100 5 L107 12 L100 19 L93 12Z" fill="currentColor" fill-opacity=".85" stroke="none" />
      <circle cx="22" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="178" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </g>
  </svg>
</template>
