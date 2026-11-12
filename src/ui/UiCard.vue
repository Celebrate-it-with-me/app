<script setup>
import { computed } from 'vue'
import { cx } from './utils'

const props = defineProps({
  as: { type: String, default: 'div' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  /** Heading tag for the title: keep the page's outline (h2 under an h1, h3 under an h2). */
  headingLevel: { type: String, default: 'h3' },
  /** none | sm | md | lg */
  padding: { type: String, default: 'md' },
  /** Lifts on hover; use for clickable cards. */
  hoverable: { type: Boolean, default: false },
  /** Transparent, border only. */
  flat: { type: Boolean, default: false }
})

const PADDINGS = { none: '', sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-6 sm:p-8' }

const classes = computed(() =>
  cx(
    'min-w-0 rounded-xl border border-line',
    props.flat ? 'bg-transparent' : 'bg-white shadow-card',
    props.hoverable && 'transition-shadow hover:shadow-pop',
    PADDINGS[props.padding] ?? PADDINGS.md
  )
)
</script>

<template>
  <component :is="as" :class="classes">
    <header
      v-if="title || subtitle || $slots.header || $slots.actions"
      class="mb-4 flex items-start justify-between gap-3"
    >
      <div class="min-w-0">
        <slot name="header">
          <component :is="headingLevel" v-if="title" class="font-heading text-xl text-ink-900">{{ title }}</component>
          <p v-if="subtitle" class="mt-0.5 text-sm text-ink-500">{{ subtitle }}</p>
        </slot>
      </div>
      <div v-if="$slots.actions" class="shrink-0"><slot name="actions" /></div>
    </header>
    <slot />
    <footer v-if="$slots.footer" class="mt-4 border-t border-line pt-4">
      <slot name="footer" />
    </footer>
  </component>
</template>
