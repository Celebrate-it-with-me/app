<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="id"
      class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200"
    >
      {{ label }}
    </label>

    <div
      :class="[
        'flex items-center gap-2 w-full border-b transition focus-within:border-b-2 mb-2',
        borderColorClass,
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
    >
      <select
        :id="id"
        v-bind="$attrs"
        v-model="inputValue"
        :disabled="disabled"
        @blur="handleFieldBlur"
        class="w-full bg-transparent px-1 py-2 text-sm text-gray-900 dark:text-white border-none focus:outline-none focus:ring-0"
      >
        <option disabled value="">Select an option</option>
        <option
          v-for="(option, index) in options"
          :key="index"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>

    <p v-if="showErrorMessage" class="mt-1 text-xs text-red-500">
      {{ errorMessage }}
    </p>

    <p v-if="description" class="mt-1 text-xs text-gray-500">
      {{ description }}
    </p>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useField } from 'vee-validate'

const props = defineProps({
  id: { type: String, required: true },
  name: { type: String, required: true },
  label: { type: String },
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  description: { type: String },
  options: { type: Array, required: true },
  showError: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:blur', 'resetErrors'])

const {
  value: inputValue,
  errorMessage,
  handleBlur,
  setValue,
  meta
} = useField(props.name)

setValue(props.modelValue)

watch(() => props.modelValue, (val) => setValue(val))
watch(inputValue, (val) => {
  emit('update:modelValue', val)
  if (val) emit('resetErrors')
})

const showErrorMessage = computed(() => props.showError && errorMessage.value && meta.touched)

const borderColorClass = computed(() => {
  if (showErrorMessage.value) return 'border-red-500 focus-within:border-red-500'
  if (meta.valid && inputValue.value) return 'border-green-500 focus-within:border-green-500'
  return 'border-primary focus-within:border-primary'
})

const handleFieldBlur = (e) => {
  emit('update:blur', e.target.value)
  handleBlur(e)
}
</script>

<style>
select option {
  background-color: white !important;
  color: black !important;
}

.dark select option {
  background-color: #1f2937 !important; /* Tailwind: bg-gray-800 */
  color: white !important;
}
</style>
