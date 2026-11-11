<script setup>
import { RadioGroupRoot, RadioGroupItem, RadioGroupIndicator } from 'reka-ui'
import { cx } from './utils'

defineProps({
  modelValue: { type: [String, Number], default: undefined },
  /** [{ value, label, description? , disabled? }] */
  options: { type: Array, default: () => [] },
  /** vertical | horizontal */
  orientation: { type: String, default: 'vertical' },
  /** Renders each option as a selectable card instead of a plain radio. */
  cards: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <RadioGroupRoot
    :model-value="modelValue"
    :orientation="orientation"
    :disabled="disabled"
    :class="cx('flex gap-3', orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col')"
    @update:model-value="value => emit('update:modelValue', value)"
  >
    <label
      v-for="option in options"
      :key="option.value"
      :class="
        cx(
          'flex cursor-pointer items-start gap-3',
          cards &&
            'rounded-lg border border-line-strong bg-white p-4 transition-colors has-[[data-state=checked]]:border-rose-600 has-[[data-state=checked]]:bg-rose-50',
          (option.disabled || disabled) && 'cursor-not-allowed opacity-60'
        )
      "
    >
      <RadioGroupItem
        :value="option.value"
        :disabled="option.disabled"
        class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line-strong bg-white transition-colors data-[state=checked]:border-rose-600 focus-visible:outline-2 focus-visible:outline-rose-400 focus-visible:outline-offset-2"
      >
        <RadioGroupIndicator class="h-2.5 w-2.5 rounded-full bg-rose-600" />
      </RadioGroupItem>
      <span class="flex flex-col">
        <span class="text-base leading-5 text-ink-900">{{ option.label }}</span>
        <span v-if="option.description" class="text-sm text-ink-500">{{ option.description }}</span>
      </span>
    </label>
  </RadioGroupRoot>
</template>
