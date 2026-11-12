<script setup>
/** Shared frame for every section: gold ornament, heading, optional text and a body slot. */
defineProps({
  /** Anchor id, also used to label the section. */
  id: { type: String, required: true },
  title: { type: String, default: null },
  text: { type: String, default: null },
  /** Slightly darker surface to separate consecutive sections. */
  alt: { type: Boolean, default: false }
})
</script>

<template>
  <section
    :id="id"
    :aria-labelledby="title ? `${id}-title` : undefined"
    :class="['px-6 py-16 sm:py-20', alt ? 'bg-inv-surface-alt' : '']"
  >
    <div class="mx-auto max-w-2xl text-center">
      <div aria-hidden="true" class="mb-6 flex items-center justify-center gap-3">
        <span class="h-px w-10 bg-inv-accent/60" />
        <span class="h-1.5 w-1.5 rotate-45 bg-inv-accent" />
        <span class="h-px w-10 bg-inv-accent/60" />
      </div>
      <h2 v-if="title" :id="`${id}-title`" class="font-inv-heading text-3xl text-balance sm:text-4xl">
        {{ title }}
      </h2>
      <p v-if="text" class="mx-auto mt-3 max-w-prose text-lg text-inv-ink-soft text-pretty">{{ text }}</p>
      <div class="mt-8"><slot /></div>
    </div>
  </section>
</template>
