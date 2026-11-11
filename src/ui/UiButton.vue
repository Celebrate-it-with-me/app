<script setup>
import { computed } from 'vue'
import { LoaderCircle } from 'lucide-vue-next'
import { cx } from './utils'

const props = defineProps({
  /** primary | secondary | ghost | danger | link */
  variant: { type: String, default: 'primary' },
  /** sm | md | lg */
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  /** Renders a router-link when set. */
  to: { type: [String, Object], default: null },
  /** Renders an anchor when set. */
  href: { type: String, default: null },
  block: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  /** Square button for a single icon. */
  icon: { type: Boolean, default: false }
})

const VARIANTS = {
  primary:
    'bg-rose-600 text-white shadow-soft hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-300',
  secondary:
    'bg-white text-ink-900 border border-line-strong shadow-soft hover:bg-cream-100 active:bg-cream-200 disabled:text-ink-400',
  ghost: 'bg-transparent text-ink-700 hover:bg-cream-200 active:bg-cream-300 disabled:text-ink-400',
  danger: 'bg-danger-500 text-white shadow-soft hover:bg-danger-700 disabled:opacity-60',
  link: 'bg-transparent text-rose-600 underline-offset-4 hover:underline px-0 disabled:text-ink-400'
}

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-base gap-2',
  lg: 'h-13 px-6 text-lg gap-2.5'
}

const ICON_SIZES = { sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-13 w-13' }

const tag = computed(() => (props.to ? 'router-link' : props.href ? 'a' : 'button'))

const classes = computed(() =>
  cx(
    'inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap',
    'transition-[background-color,color,transform] duration-150 select-none active:scale-[0.97]',
    'disabled:cursor-not-allowed',
    VARIANTS[props.variant] ?? VARIANTS.primary,
    props.icon ? ICON_SIZES[props.size] : SIZES[props.size],
    props.block && 'w-full'
  )
)
</script>

<template>
  <component
    :is="tag"
    :to="to || undefined"
    :href="href || undefined"
    :type="tag === 'button' ? type : undefined"
    :disabled="tag === 'button' ? disabled || loading : undefined"
    :aria-disabled="disabled || loading || undefined"
    :aria-busy="loading || undefined"
    :class="classes"
  >
    <LoaderCircle v-if="loading" class="h-4 w-4 animate-spin" aria-hidden="true" />
    <slot v-else name="icon" />
    <slot />
  </component>
</template>
