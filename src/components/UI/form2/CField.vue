<template>
  <div class="space-y-1">
    <label
      v-if="label"
      :for="name"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
    </label>

    <slot />

    <p v-if="description" class="text-xs text-gray-500 dark:text-gray-400">
      {{ description }}
    </p>

    <p v-if="errorMessage" class="text-xs text-red-500 dark:text-red-400">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup>
import { useField } from 'vee-validate'
import { computed } from 'vue'

const props = defineProps({
  name: String,
  label: String,
  description: String
})

const errorMessage = computed(() => {
  if (!props.name) return null

  const { errorMessage } = useField(props.name)
  return errorMessage.value
})
</script>
