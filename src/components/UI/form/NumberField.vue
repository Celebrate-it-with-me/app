<script setup>
import { computed, toRef, watch } from 'vue'
import { useField } from 'vee-validate'

const emit = defineEmits(['resetErrors', 'update:modelValue', 'update:blur'])
const props = defineProps({
  placeholder: { type: String, default: 'Enter a number' },
  label: { type: String },
  classLabel: { type: String, default: ' ' },
  classInput: { type: String, default: 'classinput' },
  name: { type: String },
  modelValue: { type: [Number, String], default: null },
  isReadonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  horizontal: { type: Boolean, default: false },
  validate: { type: String },
  msgTooltip: { type: Boolean, default: false },
  description: { type: String },
  showError: { type: Boolean, default: false },
  min: { type: Number, default: null },
  max: { type: Number, default: null },
  step: { type: Number, default: 1 },
  decimals: { type: Number, default: null },
  integerOnly: { type: Boolean, default: false },
})

const name = toRef(props, 'name')

const {
  value: inputValue,
  errorMessage,
  handleBlur,
  handleChange,
  setValue,
  meta
} = useField(name)

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== inputValue.value) {
      setValue(newValue)
    }
  },
  { immediate: true }
)

watch(inputValue, (val) => {
  const parsedValue = props.decimals !== null
    ? parseFloat(Number(val).toFixed(props.decimals))
    : props.integerOnly
      ? parseInt(val)
      : Number(val)

  emit('update:modelValue', parsedValue)
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
  <div
    :class="`${showErrorMessage ? 'has-error' : ''}  ${horizontal ? 'flex' : ''}  ${validate ? 'is-valid' : ''} `"
    class="formGroup relative"
  >
    <label
      v-if="label"
      :class="`${classLabel} ${horizontal ? 'flex-0 mr-6 md:w-[100px] w-[60px] break-words' : ''} ltr:inline-block rtl:block input-label`"
      :for="name"
    >
      {{ label }}
    </label>

    <div :class="horizontal ? 'flex-1' : ''" class="relative w-full mt-1">
      <input
        :id="name"
        :class="`${classInput} input-control w-full block focus:outline-none h-[40px]`"
        :disabled="disabled"
        :name="name"
        :placeholder="placeholder"
        :value="inputValue"
        :readonly="isReadonly"
        type="number"
        :step="step"
        :min="min"
        :max="max"
        @blur="handleFieldBlur"
        @input="handleChange"
      />
    </div>

    <span
      v-if="showErrorMessage"
      :class="
        msgTooltip
          ? 'inline-block bg-danger-500 text-white text-[10px] px-2 py-1 rounded'
          : 'text-danger-500 block text-sm'
      "
      class="mt-2"
    >
      {{ errorMessage }}
    </span>

    <span
      v-if="validate"
      :class="
        msgTooltip
          ? 'inline-block bg-success-500 text-white text-[10px] px-2 py-1 rounded'
          : 'text-success-500 block text-sm'
      "
      class="mt-2"
    >
      {{ validate }}
    </span>

    <!-- Additional Description -->
    <span
      v-if="description"
      class="block text-secondary-500 font-light leading-4 text-xs mt-2"
    >
      {{ description }}
    </span>
  </div>
</template>

<style scoped>
.has-error {
  @apply text-red-500;

  label {
    @apply text-red-500;
  }

  input {
    @apply border border-red-500;
  }
}
</style>
