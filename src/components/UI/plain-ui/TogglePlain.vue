<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  name: { type: String, required: true },
  modelValue: { type: Boolean, required: false },
  disabled: { type: Boolean, required: false },
  label: { type: String, default: '' }
})

const localValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  newValue => {
    localValue.value = newValue
  }
)

watch(localValue, newValue => {
  emit('update:modelValue', newValue)
})
</script>

<template>
  <div class="flex items-center">
    <label class="inline-flex items-center cursor-pointer">
      <input
        v-model="localValue"
        type="checkbox"
        :name="name"
        :value="localValue"
        :disabled="disabled"
        class="sr-only peer"
      />

      <div
        class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-400 dark:peer-checked:bg-yellow-400"
      ></div>

      <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
        {{ label }}
      </span>
    </label>
  </div>
</template>

<style scoped></style>
