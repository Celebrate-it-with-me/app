<script setup>
import { cx } from './utils'

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  hint: { type: String, default: '' },
  /** neutral | rose | gold | success | warning | danger */
  tone: { type: String, default: 'neutral' }
})

const TONES = {
  neutral: 'bg-cream-200 text-ink-700',
  rose: 'bg-rose-100 text-rose-700',
  gold: 'bg-gold-100 text-gold-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700'
}
</script>

<template>
  <div class="flex items-center gap-4 rounded-xl border border-line bg-white p-4 shadow-soft">
    <div
      v-if="$slots.icon"
      :class="cx('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', TONES[tone] ?? TONES.neutral)"
    >
      <slot name="icon" />
    </div>
    <div class="min-w-0">
      <p class="text-sm text-ink-500">{{ label }}</p>
      <p class="font-heading text-2xl leading-tight text-ink-900 tabular-nums">{{ value }}</p>
      <p v-if="hint" class="mt-0.5 truncate text-xs text-ink-400">{{ hint }}</p>
    </div>
  </div>
</template>
