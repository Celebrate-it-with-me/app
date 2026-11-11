<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  /** Compact variant for inside cards. */
  compact: { type: Boolean, default: false }
})
</script>

<template>
  <div
    class="flex flex-col items-center text-center"
    :class="compact ? 'px-4 py-8' : 'px-6 py-14'"
  >
    <div
      v-if="$slots.icon"
      class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600"
    >
      <slot name="icon" />
    </div>
    <h3 class="font-heading text-xl text-ink-900 text-balance">{{ title }}</h3>
    <p v-if="description" class="mt-1.5 max-w-sm text-base text-ink-500 text-balance">
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-5 flex flex-wrap justify-center gap-2">
      <slot />
    </div>
  </div>
</template>
