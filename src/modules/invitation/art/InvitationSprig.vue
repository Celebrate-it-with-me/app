<script setup>
/**
 * Botanical sprig for the corners: a flowing stem, leaves in outline and small blossoms.
 * Drawn from the top-left corner; `flip` mirrors it for the opposite corner. Strokes use the
 * accent color (`currentColor`), blossoms pick up the theme's primary.
 */
defineProps({
  flip: { type: Boolean, default: false }
})
</script>

<template>
  <svg
    viewBox="0 0 220 220"
    fill="none"
    stroke="currentColor"
    stroke-width="1.4"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    :class="flip ? '-scale-x-100' : ''"
  >
    <!-- stem and a thinner offshoot -->
    <path d="M4 8 C 56 12 100 42 124 94 C 142 132 148 172 142 214" />
    <path d="M70 30 C 96 18 128 20 150 36" stroke-opacity=".7" />

    <!-- leaves along the stem -->
    <path d="M30 14 C 40 -2 62 -2 72 12 C 58 24 42 24 30 14Z" />
    <path d="M58 32 C 58 14 76 4 94 10 C 92 28 76 38 58 32Z" />
    <path d="M86 56 C 104 46 122 52 128 66 C 112 76 94 72 86 56Z" />
    <path d="M104 80 C 92 70 94 52 108 44 C 120 56 118 72 104 80Z" />
    <path d="M126 106 C 144 98 162 102 170 116 C 154 128 136 124 126 106Z" />
    <path d="M132 132 C 120 122 120 104 134 96 C 146 108 146 124 132 132Z" />
    <path d="M140 158 C 156 150 174 156 180 170 C 164 180 146 176 140 158Z" />
    <path d="M142 184 C 130 174 132 158 144 150 C 156 162 154 178 142 184Z" />

    <!-- blossoms -->
    <g class="text-inv-primary">
      <g fill="currentColor" fill-opacity=".14">
        <circle cx="100" cy="52" r="6" />
        <circle cx="108" cy="46" r="5" />
        <circle cx="94" cy="46" r="5" />
        <circle cx="104" cy="58" r="5" />
        <circle cx="94" cy="58" r="5" />
      </g>
      <circle cx="100" cy="52" r="2" fill="currentColor" stroke="none" />
      <g fill="currentColor" fill-opacity=".14">
        <circle cx="160" cy="128" r="5" />
        <circle cx="167" cy="123" r="4" />
        <circle cx="153" cy="123" r="4" />
        <circle cx="163" cy="134" r="4" />
        <circle cx="153" cy="134" r="4" />
      </g>
      <circle cx="160" cy="128" r="1.6" fill="currentColor" stroke="none" />
    </g>

    <!-- tiny buds -->
    <circle cx="150" cy="36" r="2" fill="currentColor" stroke="none" />
    <circle cx="60" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="146" cy="214" r="2" fill="currentColor" stroke="none" />
  </svg>
</template>
