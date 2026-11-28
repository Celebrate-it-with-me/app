<script setup>
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator
} from 'reka-ui'
import { Check, ChevronRight } from 'lucide-vue-next'
import { cx } from './utils'

defineProps({
  /**
   * [{ label, icon?, danger?, disabled?, separator?, onSelect }] — `separator: true` draws a line before the item.
   * An item may open a submenu instead of acting: `children: [items]` (plain items) or
   * `radio: { value, options: [{ value, label }], onChange(value) }` (one choice among several, the current one checked).
   */
  items: { type: Array, default: () => [] },
  /** start | center | end */
  align: { type: String, default: 'end' }
})

const ITEM = 'flex cursor-pointer select-none items-center gap-2.5 rounded-md px-3 py-2.5 text-base outline-none data-[highlighted]:bg-cream-200 data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-300'
const PANEL = 'z-50 min-w-48 rounded-lg border border-line bg-white p-1 shadow-pop'
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <slot name="trigger" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent :align="align" :side-offset="6" :class="PANEL">
        <template v-for="(item, index) in items" :key="index">
          <DropdownMenuSeparator v-if="item.separator" class="my-1 h-px bg-line" />
          <DropdownMenuSub v-if="item.children || item.radio">
            <DropdownMenuSubTrigger :disabled="item.disabled" :class="cx(ITEM, 'text-ink-900')">
              <component :is="item.icon" v-if="item.icon" class="h-4 w-4 text-ink-500" aria-hidden="true" />
              <span class="flex-1">{{ item.label }}</span>
              <ChevronRight class="h-4 w-4 text-ink-400" aria-hidden="true" />
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent :side-offset="4" :class="PANEL">
                <DropdownMenuRadioGroup v-if="item.radio" :model-value="item.radio.value" @update:model-value="item.radio.onChange?.($event)">
                  <DropdownMenuRadioItem v-for="option in item.radio.options" :key="option.value" :value="option.value" :class="cx(ITEM, 'pl-8 text-ink-900 relative')">
                    <DropdownMenuItemIndicator class="absolute left-2.5 inline-flex items-center">
                      <Check class="h-4 w-4 text-rose-600" aria-hidden="true" />
                    </DropdownMenuItemIndicator>
                    {{ option.label }}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <template v-else>
                  <DropdownMenuItem
                    v-for="(child, childIndex) in item.children"
                    :key="childIndex"
                    :disabled="child.disabled"
                    :class="cx(ITEM, child.danger ? 'text-danger-700' : 'text-ink-900')"
                    @select="child.onSelect?.()"
                  >
                    <component :is="child.icon" v-if="child.icon" class="h-4 w-4 text-ink-500" aria-hidden="true" />
                    {{ child.label }}
                  </DropdownMenuItem>
                </template>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem
            v-else
            :disabled="item.disabled"
            :class="cx(ITEM, item.danger ? 'text-danger-700' : 'text-ink-900')"
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
