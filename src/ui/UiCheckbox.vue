<script setup>
import { CheckboxRoot, CheckboxIndicator } from 'reka-ui'
import { Check } from 'lucide-vue-next'
import { useId } from './utils'

defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
const id = useId('checkbox')
</script>

<template>
  <label :for="id" class="flex cursor-pointer items-start gap-3" :class="disabled && 'cursor-not-allowed opacity-60'">
    <CheckboxRoot
      :id="id"
      :model-value="modelValue"
      :disabled="disabled"
      class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-line-strong bg-white transition-colors data-[state=checked]:border-rose-600 data-[state=checked]:bg-rose-600 focus-visible:outline-2 focus-visible:outline-rose-400 focus-visible:outline-offset-2"
      @update:model-value="value => emit('update:modelValue', value === true)"
    >
      <CheckboxIndicator>
        <Check class="h-3.5 w-3.5 text-white" stroke-width="3" aria-hidden="true" />
      </CheckboxIndicator>
    </CheckboxRoot>
    <span v-if="label || $slots.default" class="flex flex-col">
      <span class="text-base text-ink-900 leading-5"><slot>{{ label }}</slot></span>
      <span v-if="description" class="text-sm text-ink-500">{{ description }}</span>
    </span>
  </label>
</template>
