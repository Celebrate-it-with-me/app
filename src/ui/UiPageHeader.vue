<script setup>
import { ChevronLeft } from 'lucide-vue-next'
import { uiText } from './i18n'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  /** Small label above the title (e.g. the event name). */
  eyebrow: { type: String, default: '' },
  /** Route for the back arrow; omit to hide it. */
  back: { type: [String, Object], default: null },
  backLabel: { type: String, default: () => uiText('common.back') }
})
</script>

<template>
  <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="flex min-w-0 items-start gap-2">
      <router-link
        v-if="back"
        :to="back"
        class="-ml-2 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-cream-200"
        :aria-label="backLabel"
      >
        <ChevronLeft class="h-5 w-5" aria-hidden="true" />
      </router-link>
      <div class="min-w-0">
        <p v-if="eyebrow" class="text-sm font-semibold uppercase tracking-wide text-rose-600">
          {{ eyebrow }}
        </p>
        <h1 class="font-heading text-3xl text-ink-900 sm:text-4xl text-balance">{{ title }}</h1>
        <p v-if="subtitle" class="mt-1 text-base text-ink-500">{{ subtitle }}</p>
      </div>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
