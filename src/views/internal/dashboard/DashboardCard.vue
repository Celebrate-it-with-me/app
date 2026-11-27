<script setup>
/**
 * The Inicio's card: flat like the prototype (no shadow), 24 px corners, a `cream-300` hairline, 20 px of padding on a
 * phone and 24 px from 1024 px, and a Fraunces semibold title (20 px, 22 px from 1024 px). Only the Inicio uses it; the
 * rest of the app keeps `UiCard`.
 */
defineProps({
  as: { type: String, default: 'section' },
  title: { type: String, default: '' },
  /** Heading tag for the title: the blocks are h2 under the hero's h1. */
  headingLevel: { type: String, default: 'h2' },
  /** false: the caller sets its own padding. */
  padded: { type: Boolean, default: true }
})
</script>

<template>
  <component :is="as" class="min-w-0 rounded-2xl border border-cream-300 bg-white" :class="padded ? 'p-5 lg:p-6' : ''">
    <header v-if="title || $slots.actions" class="mb-3.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 lg:mb-4">
      <component :is="headingLevel" v-if="title" class="font-heading text-xl font-semibold leading-tight text-ink-900 lg:text-[22px]" data-testid="card-title">{{ title }}</component>
      <div v-if="$slots.actions" class="shrink-0"><slot name="actions" /></div>
    </header>
    <slot />
  </component>
</template>
