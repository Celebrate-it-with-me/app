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
  options: {
    type: Object,
    default: () => ({
      creditCard: true,
      delimiter: '-'
    })
  }
})

const name = toRef(props, 'name')

const {
  value: inputValue,
  errorMessage,
  handleBlur,
  setValue,
  meta
} = useField(name, {
  initialValue: props.modelValue
})

// Watch for props changes and emit v-model updates
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
        format="MM/dd/yyyy"
        model-type="MM/dd/yyyy"
        :enable-time-picker="false"
        week-start="0"
        auto-apply
        @blur="handleBlur"
        :ui="{ input: inputClasses }"
      />
    </div>

    <!-- Error message -->
    <span
      v-if="showErrorMessage"
      :class="
        msgTooltip
          ? ' inline-block bg-danger-500 text-white text-[10px] px-2 py-1 rounded'
          : ' text-danger-500 block text-sm'
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
  color: #e3342f; /* Adjust the red color according to your needs */
}
.has-error label {
  color: #e3342f;
}
.has-error input {
  border: 1px solid #e3342f;
}
</style>
