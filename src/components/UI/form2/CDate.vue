<template>
  <div class="w-full mb-4">
    <label
      v-if="label"
      :for="name"
      class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200"
    >
      {{ label }}
    </label>

    <div
      class="relative flex items-center w-full border-b transition"
      :class="borderColorClass"
    >
      <VueDatePicker
        v-model="localValue"
        :format="format"
        :placeholder="placeholder"
        :disabled="disabled"
        :enable-time-picker="alsoTime"
        :hide-input-icon="true"
        input-class-name="custom-datepicker-input"
        @blur="handleFieldBlur"
      />
    </div>

    <p v-if="showError" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useField } from 'vee-validate'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const props = defineProps({
  modelValue: [String, Date],
  name: { type: String, required: true },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Select date' },
  disabled: { type: Boolean, default: false },
  alsoTime: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const {
  value: fieldValue,
  errorMessage,
  handleBlur,
  meta,
  setValue
} = useField(props.name)

// Local binding
const localValue = ref(props.modelValue ?? '')

onMounted(() => {
  setValue(localValue.value)
})

watch(localValue, (val) => {
  emit('update:modelValue', val)
  const formatted =
    val instanceof Date
      ? format.value === 'MM/dd/yyyy HH:mm'
        ? val.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).replace(',', '')
        : val.toLocaleDateString('en-US')
      : val

  setValue(formatted)
})


const showError = computed(() => !!errorMessage.value && meta.touched)
const format = computed(() => (props.alsoTime ? 'MM/dd/yyyy HH:mm' : 'MM/dd/yyyy'))

const borderColorClass = computed(() => {
  if (showError.value) return 'border-red-500 focus-within:border-red-500'
  if (meta.touched && meta.valid) return 'border-green-500 focus-within:border-green-500'
  return 'border-primary focus-within:border-primary'
})

const handleFieldBlur = (e) => {
  handleBlur(e)
}
</script>

<style scoped>
::v-deep(.dp__input_wrap) {
  @apply w-full bg-transparent border-none rounded-none outline-none shadow-none;
  padding: 0 !important;
}

::v-deep(input.dp__input) {
  @apply text-sm w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  height: 40px;
  border: none !important;
  box-shadow: none !important;
}
</style>
