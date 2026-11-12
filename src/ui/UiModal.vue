<script setup>
import { computed } from 'vue'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose
} from 'reka-ui'
import { X } from 'lucide-vue-next'
import { cx } from './utils'
import { uiText } from './i18n'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  /** sm | md | lg | full */
  size: { type: String, default: 'md' },
  /** On phones a sheet slides up from the bottom; on larger screens both look centered. */
  sheet: { type: Boolean, default: true },
  closeLabel: { type: String, default: () => uiText('common.close') }
})
const emit = defineEmits(['update:open'])

const WIDTHS = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', full: 'sm:max-w-4xl' }

const contentClasses = computed(() =>
  cx(
    'fixed z-50 flex max-h-[92dvh] w-full flex-col bg-white shadow-pop focus:outline-none',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    props.sheet
      ? 'inset-x-0 bottom-0 rounded-t-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl'
      : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl',
    WIDTHS[props.size] ?? WIDTHS.md
  )
)
</script>

<template>
  <DialogRoot :open="open" @update:open="value => emit('update:open', value)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-xs" />
      <DialogContent :class="contentClasses">
        <div class="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
          <div class="min-w-0">
            <DialogTitle v-if="title" class="font-heading text-2xl text-ink-900">
              {{ title }}
            </DialogTitle>
            <DialogDescription v-if="description" class="mt-1 text-base text-ink-500">
              {{ description }}
            </DialogDescription>
          </div>
          <DialogClose
            class="-mr-2 -mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-cream-200"
            :aria-label="closeLabel"
          >
            <X class="h-5 w-5" aria-hidden="true" />
          </DialogClose>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <slot />
        </div>
        <div
          v-if="$slots.footer"
          class="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6"
        >
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
