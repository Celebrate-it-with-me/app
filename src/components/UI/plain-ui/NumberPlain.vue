<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  id: { type: String, required: true },
  name: { type: String, default: '' },
  modelValue: { type: [String, Number], default: '' },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  label: { type: String, default: '' },
  min: { type: Number, default: null },
  max: { type: Number, default: null },
  step: { type: Number, default: null }
})

const localValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  newValue => {
    localValue.value = newValue
  }
)

const handleInput = event => {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="flex flex-col mb-4">
    <label :for="id" class="mb-1 text-sm font-medium text-gray-900 dark:text-gray-300">
      {{ label }}
    </label>

    <input
      :id="id"
      :name="name"
      :disabled="disabled"
      :value="localValue"
      :placeholder="placeholder"
      type="number"
      :min="min"
      :max="max"
      :step="step"
      class="w-1/3 px-3 py-2 text-gray-900 bg-gray-100 rounded-lg border border-gray-300 focus:ring focus:ring-blue-500 focus:border-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500"
      @input="handleInput"
    />
  </div>
</template>
