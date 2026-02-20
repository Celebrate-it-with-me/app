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
        'w-full border-b transition mb-4',
        borderColorClass,
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
    >
      <textarea
        :id="id"
        v-bind="$attrs"
        v-model="inputValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows"
        class="w-full resize-none bg-transparent border-none outline-none px-1 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 placeholder:font-extralight"
        @blur="handleFieldBlur"
      />
    </div>

    <p v-if="showErrorMessage" class="mt-1 text-xs text-red-500">
      {{ errorMessage }}
    </p>
    <p v-if="description" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
  placeholder: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: String, required: true },
  disabled: { type: Boolean, required: false, default: false },
  description: { type: String, required: true },
  rows: { type: Number, default: 2 },
  showError: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:blur', 'resetErrors'])

const { value: inputValue, errorMessage, handleBlur, setValue, meta } = useField(props.name)

setValue(props.modelValue)

watch(
  () => props.modelValue,
  newValue => {
    setValue(newValue)
  }
)

watch(inputValue, val => {
  emit('update:modelValue', val)
  if (val) emit('resetErrors')
})

const showErrorMessage = computed(() => {
  return props.showError && errorMessage.value && meta.touched
})

const borderColorClass = computed(() => {
  if (showErrorMessage.value) return 'border-red-500 focus-within:border-red-500'
  if (meta.valid && inputValue) return 'border-green-500 focus-within:border-green-500'
  return 'border-primary focus-within:border-primary'
})

const handleFieldBlur = e => {
  emit('update:blur', e.target.value)
  handleBlur(e)
}
</script>
