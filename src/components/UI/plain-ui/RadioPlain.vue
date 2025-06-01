<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  id: { type: String, default: '' },
  name: { type: String, default: '' },
  value: { type: String, required: true },
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, required: false },
  label: { type: String, default: '' }
})

const localValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  newValue => {
    localValue.value = newValue
  }
)

// Emit value on input change
const handleChange = () => {
  emit('update:modelValue', props.value)
}
</script>

<template>
  <div class="flex items-center mb-4">
    <input
      :id="id"
      v-model="localValue"
      type="radio"
      :value="value"
      :disabled="disabled"
      :name="name"
      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      @change="handleChange"
    />

    <label :for="id" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
      {{ label }}
    </label>
  </div>
</template>
