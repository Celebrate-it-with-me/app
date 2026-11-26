<script setup>
/**
 * The loading / error / ready switch every Inicio block shares, so a slow or failed request only affects its own block:
 * the skeleton (same height as the content, so nothing jumps), an error with "Reintentar" that repeats just that
 * request, or the content. Draws no frame: the block brings its own card.
 */
import { useI18n } from 'vue-i18n'
import { TriangleAlert } from 'lucide-vue-next'
import { UiButton } from '@/ui'

defineProps({
  /** loading | error | ready */
  status: { type: String, default: 'ready' },
  /** What the error says (already translated). */
  errorText: { type: String, default: '' }
})
defineEmits(['retry'])

const { t } = useI18n()
</script>

<template>
  <div v-if="status === 'loading'" aria-busy="true" data-testid="block-loading">
    <slot name="skeleton" />
  </div>
  <div
    v-else-if="status === 'error'"
    class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-danger-50 px-4 py-3 text-danger-700"
    role="alert"
    data-testid="block-error"
  >
    <TriangleAlert class="h-5 w-5 shrink-0" aria-hidden="true" />
    <!-- basis-40: on narrow phones "Reintentar" drops to its own line instead of squeezing the text to a word per line. -->
    <p class="min-w-0 flex-1 basis-40 text-sm font-medium">{{ errorText }}</p>
    <UiButton variant="secondary" size="md" data-testid="block-retry" @click="$emit('retry')">{{ t('app.dashboard.retry') }}</UiButton>
  </div>
  <slot v-else />
</template>
