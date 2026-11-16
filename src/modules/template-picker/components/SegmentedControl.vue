<script setup>
/** Small exclusive choice (language, stage, palette) as pressed buttons; the parent owns the value. */
defineProps({
  modelValue: { type: String, default: '' },
  /** [{ value, label }] */
  options: { type: Array, default: () => [] },
  label: { type: String, required: true }
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div role="group" :aria-label="label" class="inline-flex max-w-full flex-wrap gap-1 rounded-full bg-cream-200 p-1">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-pressed="modelValue === option.value"
      class="min-h-9 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rose-600"
      :class="modelValue === option.value ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-600 hover:text-ink-900'"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
