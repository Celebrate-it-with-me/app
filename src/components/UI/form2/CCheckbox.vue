<template>
  <label class="inline-flex items-center gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      :id="id"
      v-model="inputValue"
      :disabled="disabled"
      class="form-checkbox w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary dark:bg-gray-800 dark:border-gray-600"
    />
    <span class="text-sm text-gray-700 dark:text-gray-300">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: String,
  id: String,
  disabled: Boolean
})

const emit = defineEmits(['update:modelValue'])

const inputValue = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})
</script>
