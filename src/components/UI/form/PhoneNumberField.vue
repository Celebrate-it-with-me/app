<script setup>
import { computed, toRef, watch } from 'vue'
import { useField } from 'vee-validate'

const emit = defineEmits(['resetErrors', 'update:modelValue', 'update:blur'])
const props = defineProps({
  placeholder: { type: String, default: '123-456-7890' }, // Example formatted placeholder
  label: { type: String, default: 'Phone number' },
  classLabel: { type: String, default: 'text-sm font-medium text-gray-900 dark:text-white' },
  classInput: {
    type: String,
    default: `bg-gray-900 border border-gray-300 text-gray-50 text-sm rounded-lg
              focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5
              dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400
              dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`
  },
  name: { type: String, required: false },
  modelValue: { type: String, default: '' },
  isReadonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  description: { type: String, default: '' },
  showError: { type: Boolean, default: false }
})

const name = toRef(props, 'name')

const {
  value: inputValue,
  errorMessage,
  handleBlur,
  handleChange,
  setValue,
  meta
} = useField(name, {
  initialValue: props.modelValue,
  validateOnValueUpdate: true
})

watch(() => props.modelValue, setValue)

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

<template>
  <div class="max-w-sm">
    <!-- Label -->
    <label
      v-if="label"
      :for="name"
      :class="classLabel"
      class="block mb-2"
    >
      {{ label }}
    </label>

    <!-- Input Wrapper -->
    <div class="relative">
      <!-- Icon -->
      <div
        class="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none"
      >
        <svg
          class="w-4 h-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 19 18"
        >
          <path
            d="M18 13.446a3.02 3.02 0 0 0-.946-1.985l-1.4-1.4a3.054 3.054 0 0 0-4.218 0l-.7.7a.983.983 0 0 1-1.39 0l-2.1-2.1a.983.983 0 0 1 0-1.389l.7-.7a2.98 2.98 0 0 0 0-4.217l-1.4-1.4a2.824 2.824 0 0 0-4.218 0c-3.619 3.619-3 8.229 1.752 12.979C6.785 16.639 9.45 18 11.912 18a7.175 7.175 0 0 0 5.139-2.325A2.9 2.9 0 0 0 18 13.446Z"
          />
        </svg>
      </div>

      <!-- Input Field -->
      <input
        :id="name"
        :class="classInput"
        :disabled="disabled"
        :readonly="isReadonly"
        :name="name"
        :placeholder="placeholder"
        :value="inputValue"
        :pattern="`[0-9]{3}-[0-9]{3}-[0-9]{4}`"
        type="text"
        aria-describedby="helper-text-explanation"
        @blur="handleFieldBlur"
        @input="handleChange"
      />
    </div>

    <!-- Description -->
    <p
      v-if="description"
      id="helper-text-explanation"
      class="mt-2 text-sm text-gray-500 dark:text-gray-400"
    >
      {{ description }}
    </p>

    <!-- Error Feedback -->
    <span
      v-if="showErrorMessage"
      class="text-red-500 text-sm mt-1 block"
    >
      {{ errorMessage }}
    </span>
  </div>
</template>
