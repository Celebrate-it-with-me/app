<script setup>
import { computed, ref, watch, toRef } from 'vue'
import { useField } from 'vee-validate'

const emit = defineEmits(['resetErrors', 'update:modelValue'])
const props = defineProps({
  label: { type: String, default: '' },
  classLabel: { type: String, default: ' ' },
  name: { type: String, required: true },
  modelValue: { type: File, default: null },
  isReadonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  horizontal: { type: Boolean, default: false },
  validate: { type: String },
  showError: { type: Boolean, default: false },
  description: { type: String },
  placeholder: { type: String, default: 'Click to Upload' },
  showImgName: { type: Boolean, default: false }
})

const name = toRef(props, 'name')

// VeeValidate field
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

// Watch modelValue and sync it with vee-validate
watch(() => props.modelValue, setValue)

// Watch vee-validate's value and emit modelValue updates
watch(inputValue, val => {
  emit('update:modelValue', val)
  if (val) {
    emit('resetErrors')
  }
})

const showErrorMessage = computed(() => {
  return props.showError && errorMessage.value && meta.touched
})

const previewUrl = ref(null)

// Handle file input
const handleFileChange = e => {
  const file = e.target.files[0]
  if (file) {
    // Update VeeValidate and emit modelValue
    inputValue.value = file

    // Generate preview URL
    previewUrl.value = URL.createObjectURL(file)
  }
}

const handleRemoveImage = () => {
  inputValue.value = null
  previewUrl.value = null
}
</script>

<template>
  <div
    :class="`
      ${showErrorMessage ? 'has-error' : ''}
      ${horizontal ? 'flex' : ''}
      ${validate ? 'is-valid' : ''}
    `"
    class="formGroup relative"
  >
    <!-- Label -->
    <label
      v-if="label"
      :class="`
        ${classLabel}
        ${horizontal ? 'flex-0 mr-6 md:w-[100px] w-[60px] break-words' : ''}
        ltr:inline-block rtl:block input-label`"
      :for="name"
    >
      {{ label }}
    </label>

    <div :class="horizontal ? 'flex-1' : ''" class="relative w-full mt-1">
      <!-- Wrapper for preview and file input -->
      <div
        v-if="!previewUrl"
        class="relative border border-gray-300 p-3 rounded-md bg-white hover:border-blue-400 transition"
      >
        <input
          :id="name"
          ref="fileInput"
          type="file"
          :disabled="disabled"
          :name="name"
          class="sr-only"
          accept="image/*"
          @change="handleFileChange"
          @blur="handleBlur"
        />

        <!-- Placeholder -->
        <div
          class="h-40 w-full flex items-center justify-center text-center text-gray-400 cursor-pointer"
          @click="$refs.fileInput.click()"
        >
          <span>{{ placeholder }}</span>
        </div>
      </div>
      <!-- Image preview -->
      <div v-if="previewUrl" class="flex flex-col">
        <img
          :src="previewUrl"
          alt="Uploaded Image Preview"
          class="w-full h-40 object-cover rounded-md"
        />
        <button
          type="button"
          class="mt-2 text-sm text-blue-500 hover:underline self-start"
          @click="previewUrl = null"
        >
          Clear Image
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <span v-if="showErrorMessage" class="text-danger-500 block text-sm mt-2">
      {{ errorMessage }}
    </span>

    <!-- Description -->
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
