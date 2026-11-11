<script setup>
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from 'reka-ui'
import { cx } from './utils'

defineProps({
  /** [{ label, icon?, danger?, disabled?, separator?, onSelect }] — `separator: true` draws a line before the item. */
  items: { type: Array, default: () => [] },
  /** start | center | end */
  align: { type: String, default: 'end' }
})
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <slot name="trigger" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        :align="align"
        :side-offset="6"
        class="z-50 min-w-48 rounded-lg border border-line bg-white p-1 shadow-pop"
      >
        <template v-for="(item, index) in items" :key="index">
          <DropdownMenuSeparator v-if="item.separator" class="my-1 h-px bg-line" />
          <DropdownMenuItem
            :disabled="item.disabled"
            :class="
              cx(
                'flex cursor-pointer select-none items-center gap-2.5 rounded-md px-3 py-2.5 text-base outline-none',
                'data-[highlighted]:bg-cream-200 data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-300',
                item.danger ? 'text-danger-700' : 'text-ink-900'
              )
            "
            @select="item.onSelect?.()"
          >
            <component :is="item.icon" v-if="item.icon" class="h-4 w-4 text-ink-500" aria-hidden="true" />
            {{ item.label }}
          </DropdownMenuItem>
        </template>
        <slot />
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
