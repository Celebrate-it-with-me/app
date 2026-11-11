<script setup>
import { computed, provide } from 'vue'
import { useId } from './utils'

const props = defineProps({
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  id: { type: String, default: '' }
})

const generatedId = useId('field')
const controlId = computed(() => props.id || generatedId)
const invalid = computed(() => Boolean(props.error))

/** Controls inside read these instead of repeating props. */
provide('ui-field', { id: controlId, invalid })
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="controlId" class="text-sm font-semibold text-ink-700">
      {{ label }}
      <span v-if="required" class="text-rose-600" aria-hidden="true">*</span>
    </label>
    <slot :id="controlId" :invalid="invalid" />
    <p v-if="error" class="text-sm text-danger-700" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-ink-500">{{ hint }}</p>
  </div>
</template>
