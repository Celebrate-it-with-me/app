<template>
  <div class="flex items-center gap-2">
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}:
    </label>
    <input
      v-model="color"
      type="color"
      class="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 bg-transparent cursor-pointer"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: String,
    default: '#000000'
  },
  label: {
    type: String,
    required: false
  }
})

const color = ref(props.modelValue)

watch(
  color,
  newVal => {
    emit('update:modelValue', newVal)
  },
  { immediate: true }
)
</script>
