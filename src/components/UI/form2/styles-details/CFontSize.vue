<template>
  <div class="flex flex-col gap-1 w-3/4">
    <label
      v-if="label"
      class="text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
    </label>

    <div class="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 shadow-sm w-full">
      <button
        @click="decrease"
        :disabled="currentIndex === 0"
        class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <Minus class="w-4 h-4 text-gray-700 dark:text-gray-200" />
      </button>

      <span class="text-sm font-semibold text-gray-900 dark:text-white">
        {{ currentSize }}
      </span>

      <button
        @click="increase"
        :disabled="currentIndex === sizes.length - 1"
        class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <Plus class="w-4 h-4 text-gray-700 dark:text-gray-200" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'

const props = defineProps({
  modelValue: String,
  label: {
    type: String,
    required: false
  }
})
const emit = defineEmits(['update:modelValue'])

const sizes = [
  { value: '10px', label: 'XS' },
  { value: '12px', label: 'S' },
  { value: '14px', label: 'Base' },
  { value: '16px', label: 'M' },
  { value: '20px', label: 'L' },
  { value: '24px', label: 'XL' },
  { value: '32px', label: '2XL' },
  { value: '40px', label: '3XL' },
  { value: '48px', label: '4XL' },
  { value: '64px', label: 'Huge' },
  { value: '72px', label: '2Huge' },
  { value: '84px', label: '3Huge' },
  { value: '96px', label: '4Huge' },
]

const currentIndex = ref(0)

watch(() => props.modelValue, (newVal) => {
  const foundIndex = sizes.findIndex(s => s.value === newVal)
  if (foundIndex !== -1) {
    currentIndex.value = foundIndex
  }
}, { immediate: true })

const currentSize = computed(() => sizes[currentIndex.value]?.value)

const increase = () => {
  if (currentIndex.value < sizes.length - 1) {
    currentIndex.value++
    emit('update:modelValue', sizes[currentIndex.value].value)
  }
}

const decrease = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    emit('update:modelValue', sizes[currentIndex.value].value)
  }
}
</script>
