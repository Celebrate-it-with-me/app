<script setup>
import { computed, ref, toRef, watch } from 'vue';
import { useField } from 'vee-validate';

// Emits and props
const emit = defineEmits(['resetErrors', 'update:modelValue', 'update:blur']);
const props = defineProps({
  label: { type: String },
  classLabel: { type: String, default: ' ' },
  classInput: { type: String, default: 'classinput' },
  optionsClass: { type: String, default: ' ' },
  name: { type: String, required: true }, // Required field name for validation
  modelValue: { type: [String, Number], default: '' }, // Model bound via v-model
  hasIcon: { type: Boolean, default: false },
  isReadonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  horizontal: { type: Boolean, default: false },
  validate: { type: String },
  msgTooltip: { type: Boolean, default: false },
  description: { type: String },
  showError: { type: Boolean, default: false },
  items: { type: Array, default: () => [] }, // Dropdown options
});

// Define data
const name = toRef(props, 'name');
const {
  value: inputValue,
  errorMessage,
  handleBlur,
  setValue,
  meta
} = useField(name, {
  initialValue: props.modelValue, // Initialize vee-validate with modelValue
});

// Initialization: if props.modelValue is defined, make sure vee-validate syncs immediately
watch(() => props.modelValue, (newValue) => {
  console.log('Props modelValue updated:', newValue);
  if (newValue !== inputValue.value) {
    setValue(newValue); // Ensure vee-validate uses the correct value
  }
}, { immediate: true }); // Run immediately to manage initial value

// Sync changes from <select> back to parent via v-model
watch(inputValue, (val) => {
  console.log('Input value updated:', val);
  emit('update:modelValue', val); // Emit for v-model binding
  if (val) {
    emit('resetErrors'); // Optional: Reset errors if a valid value is selected
  }
});

// Compute error display
const showErrorMessage = computed(() => {
  return props.showError && errorMessage.value && meta.touched;
});

const handleFieldBlur = (e) => {
  emit('update:blur', e.target.value);
  handleBlur(e);
};
</script>

<template>
  <div
    :class="`fromGroup relative ${showErrorMessage ? 'has-error' : ''} ${horizontal ? 'flex' : ''}`"
  >
    <label
      :for="name"
      :class="`${classLabel} ${horizontal ? 'flex-0 mr-6 md:w-[100px] w-[60px] break-words' : ''} ltr:inline-block rtl:block input-label`"
    >
      {{ label }}
    </label>
    <select
      v-model="inputValue"
      :id="name"
      :disabled="disabled"
      :class="props.classInput"
      @blur="handleFieldBlur"
    >
      <option
        v-for="item in items"
        :value="item.value"
        :key="item.value"
        :class="props.optionsClass"
      >
        {{ item.text }}
      </option>
    </select>

    <!-- Display error message -->
    <span
      v-if="showErrorMessage"
      :class="msgTooltip
        ? 'inline-block bg-danger-500 text-white text-[10px] px-2 py-1 rounded'
        : 'text-danger-500 block text-sm'"
      class="mt-2"
    >
      {{ errorMessage }}
    </span>
  </div>
</template>

<style scoped>
.has-error label {
  color: rgb(241 89 92 / var(--tw-text-opacity));
}

.fromGroup {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  .input-control {
    background-color: transparent;
    border: solid 1px #808da5;
    border-radius: 4px;
  }
}
</style>
