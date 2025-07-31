<script setup>
import { computed } from 'vue'

const emit = defineEmits(['templateSelected'])
const props = defineProps({
  cardTemplate: {
    type: Object,
    required: true
  }
})

const isSelected = computed(() => {
  return props.cardTemplate.selected === true
})

const useThisTemplate = () => {
  emit('templateSelected', props.cardTemplate.id)
}
</script>

<template>
  <div
    class="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
  >
    <a href="#"> </a>
    <div class="p-5">
      <a href="#">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {{ cardTemplate.name }}
        </h5>
      </a>
      <p class="mb-3 font-extralight text-md text-gray-700 dark:text-gray-400">
        {{ cardTemplate.cardDescription }}
      </p>
      <button
class="inline-flex items-center px-3 py-2 text-sm font-medium text-center rounded-lg
                     cursor-pointer
        :class="
          isSelected
            ? `text-white bg-gray-600 hover:bg-gray-100 focus:ring-4 focus:outline-none
                 focus:ring-blue-300 dark:bg-gray-700 dark:hover:bg-gray-700 dark:focus:ring-blue-800`
            : `text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none
                 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700
                 dark:focus:ring-blue-800`
        "
        :disabled="isSelected"
        @click="useThisTemplate"
      >
        <span v-if="isSelected">In Use</span>
        <span v-else>Use this template</span>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
