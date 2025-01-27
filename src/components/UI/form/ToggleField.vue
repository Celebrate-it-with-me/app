<script setup>
import { useField } from 'vee-validate';
import { ref, watch } from 'vue';

const emit = defineEmits(['update:modelValue', 'resetErrors']);
const props = defineProps({
  name: { type: String, required: true },
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: '' },
  validate: { type: String, default: '' },
});

const { value, errorMessage, setValue } = useField(props.name, {
  initialValue: props.modelValue,
});

const localValue = ref(props.modelValue); // Local state

// Sync prop/modelValue to vee-validate and emit changes
watch(localValue, (val) => {
  setValue(val); // Update vee-validate value
  emit('update:modelValue', val); // Emit the new value
  if (val) emit('resetErrors'); // Reset errors if needed
});

// Sync vee-validate value back to component
watch(value, (val) => {
  localValue.value = val;
});
</script>

<template>
  <div class="flex items-center">
    <label class="inline-flex items-center cursor-pointer">
      <!-- Hidden input for validation -->
      <input
        type="checkbox"
        :name="name"
        :value="localValue"
        :disabled="disabled"
        class="sr-only peer"
        v-model="localValue"
      />

      <!-- Toggle design -->
      <div
        class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-400 dark:peer-checked:bg-yellow-400"
      ></div>

      <!-- Label -->
      <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
        {{ label }}
      </span>
    </label>

    <!-- Error Message -->
    <span v-if="errorMessage" class="text-danger-500 text-sm ms-3">
      {{ errorMessage }}
    </span>
  </div>
</template>

