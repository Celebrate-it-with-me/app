<script setup>
import { UiCard } from '@/ui'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  error: { type: String, default: '' }
})
</script>

<template>
  <UiCard class="w-full max-w-md" padding="lg">
    <div class="mb-6 text-center">
      <h1 class="font-heading text-3xl text-ink-900 text-balance">{{ title }}</h1>
      <p v-if="subtitle" class="mt-2 text-base text-ink-500">{{ subtitle }}</p>
    </div>
    <p
      v-if="error"
      class="mb-5 rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700"
      role="alert"
    >
      {{ error }}
    </p>
    <slot />
    <div v-if="$slots.footer" class="mt-6 text-center text-sm text-ink-500">
      <slot name="footer" />
    </div>
  </UiCard>
</template>
