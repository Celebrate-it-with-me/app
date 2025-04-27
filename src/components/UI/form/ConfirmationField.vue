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
    <label
      v-if="label"
      :for="name"
      :class="`block mb-2 ${classLabel}`"
    >
      {{ label }}
    </label>

    <fieldset class="flex flex-row gap-4">
      <legend class="sr-only">{{ label }}</legend>
      <div
        v-for="option in options"
        :key="option.value"
        class="flex items-center space-x-3"
      >
        <label
          :for="`${name}-${option.value}`"
          class="cursor-pointer text-dark-blue flex items-center space-x-3"
        >
          <div class="relative">
            <input
              type="radio"
              :id="`${name}-${option.value}`"
              :name="name"
              :value="option.value"
              :checked="inputValue === option.value"
              @blur="handleFieldBlur"
              @change="handleChange"
              class="opacity-0 absolute w-5 h-5 cursor-pointer"
            />
            <span
              class="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center"
              :class="{ 'border-purple-400 bg-purple-400': inputValue === option.value }"
            >
              <span
                class="w-2.5 h-2.5 bg-purple-600 rounded-full"
                :class="{ 'hidden': inputValue !== option.value }"
              ></span>
            </span>
          </div>
          <span>{{ option.label }}</span>
        </label>
      </div>
    </fieldset>

    <p
      v-if="showErrorMessage"
      class="text-red-500 text-sm mt-2"
    >
      {{ errorMessage }}
    </p>

    <p
      v-if="description"
      class="text-gray-500 text-sm mt-1"
    >
      {{ description }}
    </p>
  </div>
</template>
