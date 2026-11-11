<script setup>
import { computed } from 'vue'
import { cx } from './utils'

const props = defineProps({
  /** neutral | rose | gold | success | warning | danger | info */
  tone: { type: String, default: 'neutral' },
  /** sm | md */
  size: { type: String, default: 'md' },
  /** Shows a colored dot before the text (status badges). */
  dot: { type: Boolean, default: false }
})

const TONES = {
  neutral: ['bg-cream-200 text-ink-700', 'bg-ink-400'],
  rose: ['bg-rose-100 text-rose-800', 'bg-rose-600'],
  gold: ['bg-gold-100 text-gold-700', 'bg-gold-500'],
  success: ['bg-success-50 text-success-700', 'bg-success-500'],
  warning: ['bg-warning-50 text-warning-700', 'bg-warning-500'],
  danger: ['bg-danger-50 text-danger-700', 'bg-danger-500'],
  info: ['bg-info-50 text-info-700', 'bg-info-500']
}

const tone = computed(() => TONES[props.tone] ?? TONES.neutral)
const classes = computed(() =>
  cx(
    'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold',
    props.size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
    tone.value[0]
  )
)
</script>

<template>
  <span :class="classes">
    <span v-if="dot" :class="cx('h-1.5 w-1.5 rounded-full', tone[1])" aria-hidden="true" />
    <slot />
  </span>
</template>
