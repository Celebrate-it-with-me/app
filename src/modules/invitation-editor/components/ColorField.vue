<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { TriangleAlert } from 'lucide-vue-next'
import { UiInput } from '@/ui'
import { SWATCHES, isHex, lowContrast, normalizeHex, toSixDigit } from '../utils/editorFields'

const props = defineProps({
  field: { type: Object, required: true },
  baseId: { type: String, required: true },
  describedBy: { type: String, default: undefined },
  invalid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update'])
const { t } = useI18n()

const draft = ref(props.field.value ?? '')
// The text box keeps what is being typed; the value only follows when it is changed from outside (reset, server).
watch(
  () => props.field.value,
  value => {
    if (normalizeHex(draft.value) !== value) draft.value = value ?? ''
  }
)

const swatchList = computed(() => {
  const list = [...SWATCHES]
  if (isHex(props.field.default) && !list.includes(props.field.default.toLowerCase())) list.unshift(props.field.default.toLowerCase())
  return list
})
const current = computed(() => (isHex(props.field.value) ? props.field.value.toLowerCase() : null))
const preview = computed(() => toSixDigit(isHex(draft.value) ? draft.value : props.field.value) ?? '#ffffff')
const warn = computed(() => isHex(props.field.value) && lowContrast(props.field.value))

function onType(value) {
  draft.value = value
  const normalized = normalizeHex(value)
  if (isHex(normalized)) emit('update', normalized)
}
// An incomplete hex is only reported when the person leaves the box, never while she is still typing it.
function onBlur() {
  const normalized = normalizeHex(draft.value)
  if (!isHex(normalized)) emit('update', draft.value.trim())
  else draft.value = normalized
}
function pickSwatch(color) {
  draft.value = color
  emit('update', color)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3">
      <input
        type="color"
        class="h-11 w-11 shrink-0 cursor-pointer rounded-lg border border-line-strong bg-white p-1 disabled:cursor-not-allowed disabled:opacity-60"
        :value="preview"
        :disabled="disabled"
        :aria-label="t('invitationEditor.field.color.pick', { name: '' }).trim()"
        data-testid="color-native"
        @input="pickSwatch($event.target.value)"
      />
      <div class="min-w-0 flex-1">
        <UiInput
          :id="`${baseId}-hex`"
          :model-value="draft"
          :disabled="disabled"
          :invalid="invalid"
          size="md"
          autocomplete="off"
          spellcheck="false"
          :aria-label="t('invitationEditor.field.color.hex')"
          :aria-describedby="describedBy"
          data-testid="color-hex"
          @update:model-value="onType"
          @blur="onBlur"
        />
      </div>
    </div>

    <div class="flex flex-wrap gap-2" role="group" :aria-label="t('invitationEditor.field.color.swatches')">
      <button
        v-for="color in swatchList"
        :key="color"
        type="button"
        class="touch-target relative h-9 w-9 rounded-full border border-line-strong outline-offset-2 focus-visible:outline-2 focus-visible:outline-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
        :class="current === color && 'ring-2 ring-rose-600 ring-offset-2'"
        :style="{ backgroundColor: color }"
        :disabled="disabled"
        :aria-label="color"
        :aria-pressed="current === color"
        data-testid="swatch"
        @click="pickSwatch(color)"
      />
    </div>

    <p v-if="warn" class="flex items-start gap-1.5 text-sm text-warning-700" role="status" data-testid="contrast-warning">
      <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      {{ t('invitationEditor.field.color.lowContrast') }}
    </p>
  </div>
</template>
