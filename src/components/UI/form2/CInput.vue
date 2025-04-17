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
        'flex items-center gap-2 w-full border-b transition focus-within:border-b-2 mb-4',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        showErrorMessage ? 'border-red-500 focus-within:border-red-500'
        : meta.valid
          ? 'border-green-500 focus-within:border-green-500'
          : 'border-gray-300 dark:border-gray-600 focus-within:border-primary'
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
        @blur="handleFieldBlur"
        class="pl-1 w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 placeholder:font-extralight"
      />
    </div>
    <p
      v-if="showErrorMessage"
      class="mt-1 text-xs text-red-500"
    >
      {{ errorMessage }}
    </p>
    <p
      v-if="description"
      class="mt-1 text-xs text-gray-500"
    >
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
  placeholder: { type: String, default: '' },
  label: { type: String },
  type: {
    type: String,
    default: 'text',
    validator: (value) => {
      return ['text', 'password', 'email', 'number', 'tel', 'url'].includes(value)
    }
  },
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  horizontal: { type: Boolean, default: false },
  description: { type: String },
  showError: { type: Boolean, default: false },
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

watch(() => props.modelValue, (newValue) => {
  setValue(newValue)
})

watch(inputValue, (val) => {
  emit('update:modelValue', val)
  if (val) {
    emit('resetErrors')
  }
})

const showErrorMessage = computed(() => {
  return props.showError && errorMessage.value && meta.touched
})

const handleFieldBlur = (e) => {
  emit('update:blur', e.target.value)
  handleBlur(e)
}
</script>
