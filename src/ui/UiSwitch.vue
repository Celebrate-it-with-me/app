<script setup>
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import { uniqueId } from './utils'

defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
const id = uniqueId('switch')
</script>

<template>
  <label
    :for="id"
    class="flex cursor-pointer items-center justify-between gap-4"
    :class="disabled && 'cursor-not-allowed opacity-60'"
  >
    <span v-if="label || $slots.default" class="flex flex-col">
      <span class="text-base leading-5 text-ink-900"><slot>{{ label }}</slot></span>
      <span v-if="description" class="text-sm text-ink-500">{{ description }}</span>
    </span>
    <SwitchRoot
      :id="id"
      :model-value="modelValue"
      :disabled="disabled"
      class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full bg-ink-300 transition-colors data-[state=checked]:bg-rose-600 focus-visible:outline-2 focus-visible:outline-rose-400 focus-visible:outline-offset-2"
      @update:model-value="value => emit('update:modelValue', value)"
    >
      <SwitchThumb
        class="block h-5 w-5 translate-x-1 rounded-full bg-white shadow-soft transition-transform data-[state=checked]:translate-x-6"
      />
    </SwitchRoot>
  </label>
</template>
