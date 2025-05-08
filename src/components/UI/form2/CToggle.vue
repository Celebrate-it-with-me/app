<template>
  <div class="flex items-center justify-between w-full mb-2">
    <!-- Label (optional) -->
    <label
      v-if="label"
      :for="name"
      class="text-sm font-medium text-gray-700 dark:text-gray-300 select-none"
    >
      {{ label }}
    </label>

    <!-- Toggle -->
    <button
      :id="name"
      type="button"
      @click="toggle"
      :class="[
        'relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none',
        localValue ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
      ]"
    >
      <span
        class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300"
        :class="{ 'translate-x-5': localValue }"
      />
    </button>
  </div>

  <!-- Optional Error -->
  <p
    v-if="showError"
    class="text-xs text-red-500 mt-1"
  >
    {{ errorMessage }}
  </p>
</template>

<script setup>
import { useField } from 'vee-validate'
import { ref, watch, onMounted } from 'vue'

const emit = defineEmits(['update:modelValue', 'resetErrors'])

const props = defineProps({
  name: { type: String, required: true },
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  showError: { type: Boolean, default: false }
})

const { value, errorMessage, setValue, meta } = useField(props.name, {
  initialValue: props.modelValue
})

const localValue = ref(false)

onMounted(() => {
  localValue.value = props.modelValue
})

watch(
  () => props.modelValue,
  (val) => {
    localValue.value = val
    setValue(val)
  }
)

watch(localValue, (val) => {
  emit('update:modelValue', val)
  setValue(val)
  if (val) emit('resetErrors')
})

const toggle = () => {
  localValue.value = !localValue.value
}
</script>

<style scoped>
.bg-primary {
  background-color: #EC4899;
}
</style>
