<script setup>
import { computed, inject, useSlots } from 'vue'
import { cx } from './utils'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  /** sm | md | lg */
  size: { type: String, default: 'md' },
  invalid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])
const slots = useSlots()
const field = inject('ui-field', null)

const inputId = computed(() => props.id || field?.id.value)
const isInvalid = computed(() => props.invalid || field?.invalid.value)

const SIZES = { sm: 'h-9 text-sm', md: 'h-11 text-base', lg: 'h-13 text-lg' }

const classes = computed(() =>
  cx(
    'w-full rounded-lg border bg-white text-ink-900 shadow-none',
    'transition-colors duration-150 placeholder:text-ink-400',
    'focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400',
    'disabled:bg-cream-200 disabled:text-ink-400 disabled:cursor-not-allowed',
    isInvalid.value ? 'border-danger-500 focus:ring-danger-50' : 'border-line-strong',
    SIZES[props.size],
    slots.leading ? 'pl-10' : 'pl-3.5',
    slots.trailing ? 'pr-10' : 'pr-3.5'
  )
)
</script>

<template>
  <div class="relative">
    <span
      v-if="$slots.leading"
      class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-400"
    >
      <slot name="leading" />
    </span>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :disabled="disabled"
      :aria-invalid="isInvalid || undefined"
      :class="classes"
      v-bind="$attrs"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <span
      v-if="$slots.trailing"
      class="absolute inset-y-0 right-3 flex items-center text-ink-400"
    >
      <slot name="trailing" />
    </span>
  </div>
</template>

<script>
export default { inheritAttrs: false }
</script>
