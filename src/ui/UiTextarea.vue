<script setup>
import { computed, inject } from 'vue'
import { cx } from './utils'

const props = defineProps({
  modelValue: { type: String, default: '' },
  rows: { type: Number, default: 4 },
  invalid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  maxlength: { type: Number, default: null },
  id: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])
const field = inject('ui-field', null)

const inputId = computed(() => props.id || field?.id.value)
const isInvalid = computed(() => props.invalid || field?.invalid.value)

const classes = computed(() =>
  cx(
    'w-full rounded-lg border bg-white px-3.5 py-3 text-base text-ink-900 leading-relaxed',
    'transition-colors duration-150 placeholder:text-ink-400 resize-y',
    'focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400',
    'disabled:bg-cream-200 disabled:text-ink-400 disabled:cursor-not-allowed',
    isInvalid.value ? 'border-danger-500 focus:ring-danger-50' : 'border-line-strong'
  )
)
</script>

<template>
  <div class="relative">
    <textarea
      :id="inputId"
      :value="modelValue"
      :rows="rows"
      :disabled="disabled"
      :maxlength="maxlength || undefined"
      :aria-invalid="isInvalid || undefined"
      :class="classes"
      v-bind="$attrs"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <span
      v-if="maxlength"
      class="pointer-events-none absolute bottom-2 right-3 text-xs text-ink-400"
      aria-hidden="true"
    >
      {{ modelValue.length }}/{{ maxlength }}
    </span>
  </div>
</template>

<script>
export default { inheritAttrs: false }
</script>
