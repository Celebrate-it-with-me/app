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
        'flex items-center gap-2 w-full border-b transition mb-2',
        borderColorClass,
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
    >
      <slot name="icon" class="text-gray-400 dark:text-gray-500" />
      <input
        :id="id"
        v-bind="$attrs"
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        class="pl-1 w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 placeholder:font-extralight"
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
  placeholder: { type: String, default: '' },
  label: { type: String, default: '' },
  type: {
    type: String,
    default: 'text',
    validator: value => ['text', 'password', 'email', 'number', 'tel', 'url'].includes(value)
  },
  modelValue: { type: [String, Number], default: '' },
  disabled: { type: Boolean, default: false },
  description: { type: String, default: '' },
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
