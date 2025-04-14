<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
      {{ label }}
    </label>
    <div
      :class="[
        'flex items-center gap-2 w-full border-b px-1 py-2 transition focus-within:border-b-2',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        error ? 'border-red-500 focus-within:border-red-500' : success ? 'border-green-500 focus-within:border-green-500' : 'border-gray-300 dark:border-gray-600 focus-within:border-primary'
      ]"
    >
      <slot name="icon" />
      <input
        :id="id"
        v-bind="$attrs"
        :type="type"
        v-model="inputValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
      />
    </div>
    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  placeholder: String,
  type: {
    type: String,
    default: 'text'
  },
  id: String,
  error: String,
  success: Boolean,
  disabled: Boolean
})

const emit = defineEmits(['update:modelValue'])

const inputValue = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})
</script>

<style scoped>
/* Input-specific styles if needed */
</style>
