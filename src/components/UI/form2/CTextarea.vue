<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
      {{ label }}
    </label>
    <textarea
      :id="id"
      v-bind="$attrs"
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      rows="4"
      class="w-full resize-none bg-transparent border-b px-1 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary focus:ring-0"
    />
    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  id: String,
  error: String,
  disabled: Boolean
})

const emit = defineEmits(['update:modelValue'])

const inputValue = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})
</script>

<style scoped>
/* Textarea-specific styles if needed */
</style>
