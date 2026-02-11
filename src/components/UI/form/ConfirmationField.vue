<script setup>
import { toRef, computed, watch } from 'vue'
import { useField } from 'vee-validate'

const emit = defineEmits(['resetErrors', 'update:modelValue', 'update:blur'])
const props = defineProps({
  name: { type: String, required: true },
  modelValue: { type: String, default: 'pending' },
  label: { type: String, default: 'Confirm' },
  description: { type: String, default: '' },
  classLabel: { type: String, default: 'text-gray-700' },
  classInput: { type: String, default: '' },
  options: {
    type: Array,
    default: () => [
      { value: 'attending', label: 'Yes, I will be there' },
      { value: 'not-attending', label: 'Sorry, I can’t come' }
    ]
  },
  showError: { type: Boolean, default: true }
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
  initialValue: props.modelValue
})

watch(() => props.modelValue, setValue)

watch(inputValue, val => {
  emit('update:modelValue', val)
  if (val) {
    emit('resetErrors')
  }
})

const showErrorMessage = computed(() => {
  return props.showError && errorMessage.value && meta.touched
})

const handleFieldBlur = e => {
  emit('update:blur', e.target.value)
  handleBlur(e)
}
</script>

<template>
  <div class="form-group">
    <label v-if="label" :for="name" :class="`block mb-2 ${classLabel}`">
      {{ label }}
    </label>

    <fieldset class="flex flex-col sm:flex-row gap-4">
      <legend class="sr-only">{{ label }}</legend>
      <div v-for="option in options" :key="option.value" class="flex-1">
        <label
          :for="`${name}-${option.value}`"
          :class="[
            'cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all h-full',
            inputValue === option.value
              ? 'border-blue-800 bg-blue-50 text-blue-800'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          ]"
          @click.prevent="
            () => {
              inputValue = option.value
              handleChange(option.value)
            }
          "
        >
          <input
            :id="`${name}-${option.value}`"
            type="radio"
            :name="name"
            :value="option.value"
            :checked="inputValue === option.value"
            class="sr-only"
            @blur="handleFieldBlur"
          />
          <div
            class="w-6 h-6 rounded-full border-2 mb-2 flex items-center justify-center"
            :class="inputValue === option.value ? 'border-blue-800' : 'border-gray-300'"
          >
            <div v-if="inputValue === option.value" class="w-3 h-3 rounded-full bg-blue-800"></div>
          </div>
          <span class="text-sm font-bold text-center">{{ option.label }}</span>
        </label>
      </div>
    </fieldset>

    <p v-if="showErrorMessage" class="text-red-500 text-sm mt-2">
      {{ errorMessage }}
    </p>

    <p v-if="description" class="text-gray-500 text-sm mt-1">
      {{ description }}
    </p>
  </div>
</template>
