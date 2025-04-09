<script setup>
import { computed, onMounted, ref, toRef, watch } from 'vue'
import { useField } from 'vee-validate'

// Emit events for parent reactivity
const emit = defineEmits(['resetErrors', 'update:modelValue', 'update:blur'])

// Props for extending ColorPickerField behavior
const props = defineProps({
  placeholder: { type: String, default: 'Pick a color' },
  label: { type: String },
  classLabel: { type: String, default: ' ' },
  classInput: { type: String, default: 'classinput' },
  name: { type: String },
  modelValue: { type: String, default: '' },
  isReadonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  horizontal: { type: Boolean, default: false },
  validate: { type: String },
  msgTooltip: { type: Boolean, default: false },
  description: { type: String },
  showError: { type: Boolean, default: false },
  colorPickerOptions: {
    type: Object,
    default: () => ({
      type: 'component',
      showPalette: true,
      showSelectionPalette: true
    })
  }
})

// Manage field state using vee-validate
const name = toRef(props, 'name')
const selectedColor = ref(props.modelValue)
const {
  value: inputValue,
  errorMessage,
  handleBlur,
  setValue,
  meta
} = useField(name, {
  initialValue: props.modelValue
})


onMounted(() => {
  if (props.modelValue) {
    setValue(props.modelValue)
  }
})


// Update prop-dependent internal value when modelValue changes
watch(
  () => props.modelValue,
  (newValue) => {
    selectedColor.value = newValue
    setValue(newValue)
  }
)

// Update parent when internal value changes
const handleInputChange = (val) => {
  emit('update:modelValue', val)
  emit('resetErrors')
}

// Control error message visibility
const showErrorMessage = computed(() => {
  return props.showError && errorMessage.value && meta.touched
})

// Sync blurred field with parent
const handleFieldBlur = (e) => {
  emit('update:blur', e.target.value)
  handleBlur(e)
}

// Track direct color-picker updates
const handleColorPickerChange = (newColor) => {
  selectedColor.value = newColor
  emit('update:modelValue', newColor)
  if (newColor) {
    emit('resetErrors')
  }
}
</script>

<template>
  <div
    :class="`${showErrorMessage ? 'has-error' : ''} ${horizontal ? 'flex' : ''} ${validate ? 'is-valid' : ''}`"
    class="formGroup relative"
  >
    <!-- Label -->
    <label
      v-if="label"
      :class="`${classLabel} ${horizontal ? 'flex-0 mr-6 md:w-[100px] w-[60px] break-words' : ''}`"
      :for="name"
    >
      {{ label }}
    </label>

    <!-- Input Wrapper -->
    <div :class="horizontal ? 'flex-1' : ''" class="relative w-full mt-1">
      <input
        type="text"
        :id="name"
        :class="`${classInput} input-control w-full block focus:outline-none h-[40px]`"
        :disabled="disabled"
        :name="name"
        :placeholder="placeholder"
        :readonly="isReadonly"
        :value="modelValue"
        v-colorpicker="{
          ...colorPickerOptions,
          color: selectedColor
        }"
        @blur="handleFieldBlur"
        @input="(e) => handleInputChange(e.target.value)"
        @change="handleColorPickerChange($event.target.value)"
      />
    </div>

    <!-- Error/Validation/Description Messages -->
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

    <span v-if="description" class="block text-secondary-500 font-light leading-4 text-xs mt-2">
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
