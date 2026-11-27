<script setup>
/**
 * The Inicio's buttons, drawn like the prototype with the existing tokens and without icons: primary (`rose-700` face),
 * secondary (white with a `line-strong` border) and outline (`rose-700` border and text). A router link when `to` is set.
 * `size="hero"` is the hero's 46 px button (48 px on a phone); `md` the 44 px one inside the blocks.
 */
import { computed } from 'vue'

const props = defineProps({
  to: { type: [String, Object], default: null },
  /** primary | secondary | outline */
  variant: { type: String, default: 'primary' },
  /** hero | md */
  size: { type: String, default: 'md' },
  block: { type: Boolean, default: false },
  type: { type: String, default: 'button' }
})

const VARIANTS = {
  primary: 'bg-rose-700 text-white hover:bg-rose-800 active:bg-rose-900',
  secondary: 'border border-line-strong bg-white text-ink-900 hover:bg-cream-100 active:bg-cream-200',
  outline: 'border border-rose-700 bg-white text-rose-700 hover:bg-rose-50 active:bg-rose-100'
}
const SIZES = {
  hero: 'min-h-12 rounded-[14px] px-3 py-2 text-[15px] sm:min-h-[46px] sm:px-5 sm:whitespace-nowrap',
  md: 'min-h-12 rounded-md px-4 py-2 text-sm sm:min-h-11'
}

const classes = computed(() => [
  'inline-flex min-w-0 items-center justify-center text-center font-semibold leading-tight select-none',
  'transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700',
  VARIANTS[props.variant] ?? VARIANTS.primary,
  SIZES[props.size] ?? SIZES.md,
  props.block && 'w-full'
])
</script>

<template>
  <router-link v-if="to" :to="to" :class="classes"><slot /></router-link>
  <button v-else :type="type" :class="classes"><slot /></button>
</template>
