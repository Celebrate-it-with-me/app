<script setup>
import { computed, inject, ref } from 'vue'
import { CalendarDays, Clock } from 'lucide-vue-next'
import i18n from '@/locales/i18n'
import { formatEventDate } from '@/utils/eventDateTime'
import { cx, uniqueId } from './utils'
import { uiText } from './i18n'

/**
 * A date, a time or both. It SHOWS the value already spelled out ("2 ene 2027, 4:30 p. m.") with the one formatter
 * of the app, and tapping it opens the browser's own picker (the phone's wheel or calendar). Underneath is a real
 * `<input type="date|time|datetime-local">` stretched over the whole control, so the keyboard, autofill and the
 * native picker keep working; only what is drawn changes.
 *
 * `v-model` is the same string the native input uses: `2026-12-25T18:30`, `2026-12-25` or `18:30` ('' when empty).
 * The picker's own panel still follows the browser's format; the field never does.
 */
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: String, default: '' },
  /** datetime | date | time */
  mode: { type: String, default: 'datetime', validator: value => ['datetime', 'date', 'time'].includes(value) },
  invalid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: '' },
  placeholder: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])
const field = inject('ui-field', null)
const fallbackId = uniqueId('datetime')
const input = ref(null)

const inputId = computed(() => props.id || field?.id.value || fallbackId)
const isInvalid = computed(() => props.invalid || field?.invalid.value)
const NATIVE = { datetime: 'datetime-local', date: 'date', time: 'time' }
const STYLE = { datetime: 'dateTime', date: 'date', time: 'time' }

const label = computed(() => {
  if (!props.modelValue) return ''
  const wall = props.mode === 'time' ? `1970-01-01T${props.modelValue}` : props.modelValue
  return formatEventDate(wall, STYLE[props.mode], i18n.global.locale.value)
})
const hint = computed(
  () => props.placeholder || uiText({ datetime: 'common.pickDateTime', date: 'common.pickDate', time: 'common.pickTime' }[props.mode])
)

/** Desktop browsers only open the picker from their tiny icon; ask for it on any click. A failure leaves the input usable. */
function openPicker() {
  // A disabled input never receives the click, so there is nothing to guard here.
  try {
    input.value?.showPicker?.()
  } catch {
    // Not allowed here (no user gesture, or an old browser): the native input still takes typing.
  }
}
</script>

<template>
  <div class="relative" :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer'">
    <div
      :class="
        cx(
          'flex h-11 w-full items-center gap-2 rounded-lg border bg-white px-3.5 text-base text-ink-900 transition-colors duration-150',
          'focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-200',
          disabled && 'bg-cream-200 text-ink-400',
          isInvalid ? 'border-danger-500 focus-within:ring-danger-50' : 'border-line-strong'
        )
      "
      data-testid="datetime-face"
    >
      <span class="min-w-0 flex-1 truncate" :class="label ? '' : 'text-ink-500'" data-testid="datetime-label">{{ label || hint }}</span>
      <component :is="mode === 'time' ? Clock : CalendarDays" class="h-4.5 w-4.5 shrink-0 text-ink-500" aria-hidden="true" />
    </div>
    <input
      :id="inputId"
      ref="input"
      :type="NATIVE[mode]"
      :value="modelValue"
      :disabled="disabled"
      :aria-invalid="isInvalid || undefined"
      :aria-describedby="field?.describedBy.value"
      :aria-required="field?.required.value || undefined"
      class="absolute inset-0 h-full w-full opacity-0 disabled:cursor-not-allowed"
      :class="disabled ? '' : 'cursor-pointer'"
      v-bind="$attrs"
      @click="openPicker"
      @input="emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
