<script setup>
import { computed, provide } from 'vue'
import { uniqueId } from './utils'

const props = defineProps({
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  id: { type: String, default: '' }
})

const generatedId = uniqueId('field')
const controlId = computed(() => props.id || generatedId)
const invalid = computed(() => Boolean(props.error))
const messageId = computed(() => `${controlId.value}-msg`)
/** id of the error (or hint) so controls can reference it with aria-describedby */
const describedBy = computed(() => (props.error || props.hint ? messageId.value : undefined))
const required = computed(() => props.required)

/** Controls inside read these instead of repeating props. */
provide('ui-field', { id: controlId, invalid, describedBy, required })
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="controlId" class="text-sm font-semibold text-ink-700">
      {{ label }}
      <span v-if="required" class="text-rose-600" aria-hidden="true">*</span>
    </label>
    <slot :id="controlId" :invalid="invalid" />
    <p v-if="error" :id="messageId" class="text-sm text-danger-700" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="messageId" class="text-sm text-ink-500">{{ hint }}</p>
  </div>
</template>
