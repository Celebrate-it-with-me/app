<script setup>
import { LoaderCircle } from 'lucide-vue-next'

defineProps({
  /** primary | outline */
  variant: { type: String, default: 'primary' },
  href: { type: String, default: null },
  type: { type: String, default: 'button' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href || undefined"
    :type="href ? undefined : type"
    :disabled="href ? undefined : disabled || loading"
    :aria-busy="loading || undefined"
    :class="[
      'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-2 text-center text-base font-semibold transition-[background-color,color,opacity,scale] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary active:scale-[0.97] disabled:opacity-50',
      variant === 'outline'
        ? 'border border-inv-primary text-inv-primary hover:bg-inv-primary/10'
        : 'bg-inv-primary text-inv-on-primary hover:opacity-90'
    ]"
  >
    <LoaderCircle v-if="loading" class="h-4 w-4 animate-spin" aria-hidden="true" />
    <slot />
  </component>
</template>
