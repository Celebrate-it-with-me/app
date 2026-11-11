<script setup>
import { computed, inject } from 'vue'
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectItemIndicator
} from 'reka-ui'
import { ChevronDown, Check } from 'lucide-vue-next'
import { cx } from './utils'

const props = defineProps({
  modelValue: { type: [String, Number], default: undefined },
  /** [{ value, label, disabled? }] */
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Selecciona una opción' },
  /** sm | md | lg */
  size: { type: String, default: 'md' },
  invalid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])
const field = inject('ui-field', null)

const triggerId = computed(() => props.id || field?.id.value)
const isInvalid = computed(() => props.invalid || field?.invalid.value)

const SIZES = { sm: 'h-9 text-sm', md: 'h-11 text-base', lg: 'h-13 text-lg' }

const triggerClasses = computed(() =>
  cx(
    'flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3.5 text-left',
    'text-ink-900 transition-colors duration-150 data-[placeholder]:text-ink-400',
    'focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400',
    'disabled:bg-cream-200 disabled:text-ink-400 disabled:cursor-not-allowed',
    isInvalid.value ? 'border-danger-500' : 'border-line-strong',
    SIZES[props.size]
  )
)

/** Reka works with string values; keep the original type when emitting. */
const byKey = computed(() => new Map(props.options.map(o => [String(o.value), o.value])))
const selected = computed(() => (props.modelValue == null ? undefined : String(props.modelValue)))

function onUpdate(value) {
  emit('update:modelValue', byKey.value.get(value))
}
</script>

<template>
  <SelectRoot :model-value="selected" :disabled="disabled" @update:model-value="onUpdate">
    <SelectTrigger :id="triggerId" :class="triggerClasses" :aria-invalid="isInvalid || undefined">
      <SelectValue :placeholder="placeholder" class="truncate" />
      <ChevronDown class="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
    </SelectTrigger>
    <SelectPortal>
      <SelectContent
        position="popper"
        :side-offset="6"
        class="z-50 min-w-(--reka-select-trigger-width) overflow-hidden rounded-lg border border-line bg-white shadow-pop"
      >
        <SelectViewport class="max-h-72 p-1">
          <SelectItem
            v-for="option in options"
            :key="String(option.value)"
            :value="String(option.value)"
            :disabled="option.disabled"
            class="relative flex cursor-pointer select-none items-center rounded-md py-2.5 pl-9 pr-3 text-base text-ink-900 outline-none data-[highlighted]:bg-cream-200 data-[disabled]:text-ink-300 data-[disabled]:cursor-not-allowed"
          >
            <SelectItemIndicator class="absolute left-3 inline-flex items-center text-rose-600">
              <Check class="h-4 w-4" aria-hidden="true" />
            </SelectItemIndicator>
            <SelectItemText>{{ option.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
