<script setup>
import { computed, toRef, watch } from 'vue'
import { useField } from 'vee-validate'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const emit = defineEmits(['resetErrors', 'update:modelValue', 'update:blur'])
const props = defineProps({
  placeholder: { type: String, default: 'Select Date' },
  label: { type: String },
  classLabel: { type: String, default: ' ' },
  classInput: { type: String, default: 'classinput' },
  name: { type: String },
  modelValue: { type: [String, Date], default: '' },
  isReadonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  horizontal: { type: Boolean, default: false },
  validate: { type: String },
  msgTooltip: { type: Boolean, default: false },
  description: { type: String },
  showError: { type: Boolean, default: false },
  alsoTime: { type: Boolean, default: false },
  options: {
    type: Object,
    default: () => ({
      creditCard: true,
      delimiter: '-'
    })
  }
})

const name = toRef(props, 'name')

// Function to format Date objects into MM/DD/YYYY HH:mm if alsoTime is enabled
const formatDateToString = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return ''
  }
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return props.alsoTime ? `${month}/${day}/${year} ${hours}:${minutes}` : `${month}/${day}/${year}`
}

// Function to parse a MM/DD/YYYY HH:mm string back into a Date object
const parseStringToDate = (dateStr) => {
  const [datePart, timePart] = dateStr.split(' ')
  const [month, day, year] = datePart.split('/').map(Number)
  const [hours, minutes] = (timePart || '00:00').split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes)
}

// Use vee-validate field bindings
const {
  value: inputValue,
  errorMessage,
  handleBlur,
  setValue,
  meta
} = useField(name, {
  initialValue:
    props.modelValue instanceof Date && !isNaN(props.modelValue.getTime())
      ? formatDateToString(props.modelValue) // Convert Date to string if needed
      : props.modelValue
})

// Flag to prevent circular updates
let isSyncing = false

// Watch for changes to props.modelValue and update inputValue if needed
watch(
  () => props.modelValue,
  (newValue) => {
    if (!isSyncing) {
      const formattedValue =
        newValue instanceof Date && !isNaN(newValue.getTime())
          ? formatDateToString(newValue) // Format Date to string if needed
          : newValue
      if (formattedValue !== inputValue.value) {
        isSyncing = true
        setValue(formattedValue)
        isSyncing = false
      }
    }
  }
)

// Watch for changes to inputValue and emit up if needed
watch(inputValue, (val) => {
  if (!isSyncing) {
    isSyncing = true
    emit('update:modelValue', val) // Emit formatted string
    if (val) {
      emit('resetErrors') // Reset errors only if there’s a valid value
    }
    isSyncing = false
  }
})

// Computed property for dynamic date formats (MM/DD/YYYY or MM/DD/YYYY HH:mm)
const dateFormat = computed(() =>
  props.alsoTime ? 'MM/dd/yyyy HH:mm' : 'MM/dd/yyyy'
)

// Error handling and dynamic class logic
const showErrorMessage = computed(() => {
  return props.showError && errorMessage.value && meta.touched
})

const inputClasses = computed(() => {
  return `${props.classInput} input-control w-full block focus:outline-none h-[40px]`
})
</script>

<template>
  <div
    :class="`${showErrorMessage ? 'has-error' : ''} ${horizontal ? 'flex' : ''} ${validate ? 'is-valid' : ''}`"
    class="fromGroup relative"
  >
    <label
      v-if="label"
      :for="name"
      :class="`
        ${classLabel}
        ${horizontal ? 'flex-0 mr-6 md:w-[100px] w-[60px] break-words' : ''}
        ltr:inline-block rtl:block input-label
      `"
    >
      {{ label }}
    </label>
    <div
      class="relative w-full mt-1"
      :class="horizontal ? 'flex-1' : ''"
    >
      <VueDatePicker
        v-model="inputValue"
        :placeholder="placeholder"
        :id="name"
        :dark="true"
        :format="dateFormat"
        :enable-time-picker="alsoTime"
        :week-start="0"
        :enable-seconds="false"
        :disabled="disabled"
        :readonly="isReadonly"
        :ui="{ input: inputClasses }"
        :parse="(str) => parseStringToDate(str)"
        @blur="handleBlur"
      />
    </div>

    <!-- Error message -->
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
    <!-- Validation message -->
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
  color: #e3342f; /* Adjust the red color here */
}
.has-error label {
  color: #e3342f;
}
.has-error input {
  border: 1px solid #e3342f;
}
</style>
