<script setup>
import { computed, ref, watch, toRef } from 'vue';
import { useField } from 'vee-validate';

const emit = defineEmits(['resetErrors', 'update:modelValue']);
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
  placeholder: { type: String, default: 'Choose an image...' },
  showImgName: { type: Boolean, default: false }
});

const name = toRef(props, 'name');

// VeeValidate field
const {
  value: inputValue,
  errorMessage,
  handleBlur,
  handleChange,
  setValue,
  meta,
} = useField(name, {
  initialValue: props.modelValue,
});

// Watch modelValue and sync it with vee-validate
watch(() => props.modelValue, setValue);

// Watch vee-validate's value and emit modelValue updates
watch(inputValue, (val) => {
  emit('update:modelValue', val);
  if (val) {
    emit('resetErrors');
  }
});

const showErrorMessage = computed(() => {
  return props.showError && errorMessage.value && meta.touched;
});

const previewUrl = ref(null);

// Handle file input
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Update VeeValidate and emit modelValue
    inputValue.value = file;

    // Generate preview URL
    previewUrl.value = URL.createObjectURL(file);
  }
};

const handleRemoveImage = () => {
  inputValue.value = null;
  previewUrl.value = null;
};

const handleClick = () => {
  const inputElement = document.getElementById(props.name)
  inputElement.click()
  console.log(inputElement)
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
        ltr:inline-block rtl:block input-label`
      "
      :for="name"
    >
      {{ label }}
    </label>

    <div :class="horizontal ? 'flex-1' : ''" class="relative w-full mt-1">
      <div class="relative border border-gray-300 p-3 rounded-md bg-white">
        <input
          type="file"
          :id="name"
          :disabled="disabled"
          :name="name"
          @change="handleFileChange"
          @blur="handleBlur"
          class="sr-only"
          accept="image/*"
        />

        <!-- Display placeholder or preview -->
        <div
          class="flex items-center justify-between cursor-pointer"
          @click="handleClick()"
        >
          <div class="flex items-center space-x-3">
            <template v-if="previewUrl">
              <img
                :src="previewUrl"
                alt="Preview"
                class="h-16 w-16 object-cover rounded-md border"
              />
              <span
                class="text-gray-700 text-sm"
                v-if="showImgName"
              >
                {{ modelValue?.name }}
              </span>
            </template>
            <template v-else>
              <span class="text-gray-400 text-sm">{{ placeholder }}</span>
            </template>
          </div>

          <!-- Remove button -->
          <button
            v-if="previewUrl"
            type="button"
            class="bg-red-500 text-white px-3 py-1 text-sm rounded"
            @click.stop="handleRemoveImage"
          >
            Remove
          </button>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <span
      v-if="showErrorMessage"
      class="text-danger-500 block text-sm mt-2"
    >
      {{ errorMessage }}
    </span>

    <!-- Description -->
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
