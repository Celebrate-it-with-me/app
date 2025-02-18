<script setup>
import { toRef, computed, watch } from 'vue'
import { useField } from 'vee-validate'

const emit = defineEmits(['resetErrors', 'update:modelValue', 'update:blur'])
const props = defineProps({
  name: { type: String, required: true },
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Confirm' },
  description: { type: String, default: '' },
  classLabel: { type: String, default: 'text-gray-700' },
  classInput: { type: String, default: '' },
  options: {
    type: Array,
    default: () => [
      { value: 'yes', label: 'Yes, I will be there' },
      { value: 'no', label: 'Sorry, I can’t come' }
    ]
  },
  showError: { type: Boolean, default: true }
})

const name = toRef(props, 'name')

// Initialize vee-validate's `useField`
const {
  value: inputValue,
  errorMessage,
  handleBlur,
  handleChange,
  setValue,
  meta
} = useField(name, {
  initialValue: props.modelValue
})

// Watch `modelValue` for external updates
watch(() => props.modelValue, setValue)

// Emit `update:modelValue` when inputValue updates
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
  <div class="form-group">
    <!-- Label -->
    <label
      v-if="label"
      :for="name"
      :class="`block mb-2 ${classLabel}`"
    >
      {{ label }}
    </label>

    <!-- Radio Group -->
    <fieldset class="flex flex-row gap-4">
      <legend class="sr-only">{{ label }}</legend>
      <div
        v-for="option in options"
        :key="option.value"
        class="flex items-center space-x-3"
      >
        <input
          type="radio"
          :id="`${name}-${option.value}`"
          :name="name"
          :value="option.value"
          :checked="inputValue === option.value"
          @blur="handleFieldBlur"
          @change="handleChange"
          class="hidden peer"
        />
        <span
          class="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center peer-checked:border-purple-400 peer-checked:bg-purple-400"
        >
          <span
            class="w-2.5 h-2.5 bg-purple-600 rounded-full hidden peer-checked:block"
          ></span>
        </span>
        <label
          :for="`${name}-${option.value}`"
          class="cursor-pointer text-gray-600"
        >
          {{ option.label }}
        </label>
      </div>
    </fieldset>

    <!-- Error Message -->
    <p
      v-if="showErrorMessage"
      class="text-red-500 text-sm mt-2"
    >
      {{ errorMessage }}
    </p>

    <!-- Description -->
    <p
      v-if="description"
      class="text-gray-500 text-sm mt-1"
    >
      {{ description }}
    </p>
  </div>
</template>
