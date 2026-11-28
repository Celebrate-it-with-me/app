<script setup>
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle } from 'reka-ui'

/**
 * A light sheet that rises from the bottom (phones): a handle, an optional small line above the title, and the content.
 * It is a dialog (focus trapped, Escape and a tap on the overlay close it, focus goes back to what opened it). For a long
 * form or a flow with a footer use UiModal; this one is for short lists of actions or choices.
 */
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  /** A small line above the title (e.g. whom the sheet is about). */
  subtitle: { type: String, default: '' }
})
const emit = defineEmits(['update:open'])
</script>

<template>
  <DialogRoot :open="open" @update:open="value => emit('update:open', value)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-[rgba(30,20,20,.38)] data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <DialogContent
        :aria-describedby="undefined"
        class="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85dvh] w-full overflow-y-auto rounded-t-[20px] bg-white px-4 pt-2 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-[0_-6px_24px_rgba(0,0,0,.12)] focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out sm:max-w-md"
        data-testid="bottom-sheet"
      >
        <div class="mx-auto mb-3 h-1 w-9 rounded-full bg-black/15" aria-hidden="true" />
        <p v-if="subtitle" class="text-xs text-ink-500" data-testid="bottom-sheet-subtitle">{{ subtitle }}</p>
        <DialogTitle class="font-heading text-lg text-ink-900">{{ title }}</DialogTitle>
        <div class="mt-2">
          <slot />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
