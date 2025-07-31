<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  id: { type: String, required: true }, // Unique input ID
  name: { type: String, default: '' }, // Input field name
  modelValue: { type: String, default: '' }, // Bound value
  disabled: { type: Boolean, default: false }, // Is the input disabled?
  placeholder: { type: String, default: '' }, // Placeholder text
  label: { type: String, default: '' } // Label for input
})

const localValue = ref(props.modelValue)

// Watch for changes in `modelValue` from parent
watch(
  () => props.modelValue,
  newValue => {
    localValue.value = newValue
  }
)

// Emit changes to parent when user edits input
const handleInput = event => {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="flex flex-col">
    <!-- Label -->
    <label :for="id" class="mb-1 text-sm font-medium text-gray-900 dark:text-gray-300">
      {{ label }}
    </label>

    <!-- Text Input -->
    <input
      :id="id"
      :name="name"
      :disabled="disabled"
      :value="localValue"
      :placeholder="placeholder"
      type="text"
      class="w-full px-3 py-2 text-gray-900 bg-gray-100 rounded-lg border border-gray-300 focus:ring focus:ring-blue-500 focus:border-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500"
      @input="handleInput"
    />
  </div>
</template>
