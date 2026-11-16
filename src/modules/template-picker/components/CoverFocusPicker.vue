<script setup>
/**
 * Picks the point of a photo that must stay visible. The photo is shown whole, the frame of the cover is drawn over it
 * (what `object-fit: cover` with that `object-position` will show) and a tap, a drag or the arrow keys move it.
 * The value is the `"40% 25%"` text the API validates.
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { focusFromPoint, formatFocus, nudgeFocus, parseAspect, parseFocus, visibleRect } from '../utils/templatePicker'

const props = defineProps({
  src: { type: String, required: true },
  /** Natural size when the API knows it; otherwise it is read from the loaded image. */
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  /** The cover frame as the field declares it ("4:5"). */
  aspect: { type: String, default: '4:5' },
  modelValue: { type: String, default: '50% 50%' }
})
const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const box = ref(null)
const natural = ref({ width: props.width, height: props.height })
const dragging = ref(false)

const focus = computed(() => parseFocus(props.modelValue))
const frameAspect = computed(() => parseAspect(props.aspect) ?? 0.8)
const imageAspect = computed(() => (natural.value.width && natural.value.height ? natural.value.width / natural.value.height : frameAspect.value))
const frame = computed(() => {
  const rect = visibleRect(imageAspect.value, frameAspect.value, focus.value)
  return {
    left: `${rect.left * 100}%`,
    top: `${rect.top * 100}%`,
    width: `${rect.width * 100}%`,
    height: `${rect.height * 100}%`
  }
})
const valueText = computed(() => t('coverPhoto.focus.valueText', { x: focus.value.x, y: focus.value.y }))

function set(next) {
  emit('update:modelValue', formatFocus(next))
}
function fromEvent(event) {
  if (!box.value) return
  set(focusFromPoint(box.value.getBoundingClientRect(), event.clientX, event.clientY))
}
function onDown(event) {
  dragging.value = true
  event.currentTarget.setPointerCapture?.(event.pointerId)
  fromEvent(event)
}
function onMove(event) {
  if (dragging.value) fromEvent(event)
}
function onUp() {
  dragging.value = false
}
function onKey(event) {
  const next = nudgeFocus(focus.value, event.key, event.shiftKey)
  if (!next) return
  event.preventDefault()
  set(next)
}
function onLoad(event) {
  natural.value = { width: event.target.naturalWidth, height: event.target.naturalHeight }
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
    <div
      ref="box"
      class="relative touch-none select-none overflow-hidden rounded-lg bg-cream-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
      :style="{ aspectRatio: String(imageAspect), width: '100%', maxWidth: `calc(min(50dvh, 26rem) * ${imageAspect})` }"
      tabindex="0"
      role="slider"
      :aria-label="t('coverPhoto.focus.label')"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="focus.x"
      :aria-valuetext="valueText"
      @pointerdown.prevent="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @keydown="onKey"
    >
      <img :src="src" alt="" draggable="false" class="pointer-events-none h-full w-full object-fill" @load="onLoad" />
      <span class="pointer-events-none absolute rounded-sm border-2 border-white shadow-[0_0_0_9999px_rgba(43,36,32,0.55)]" :style="frame" aria-hidden="true" />
      <span
        class="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-rose-600/80 shadow-card"
        :style="{ left: `${focus.x}%`, top: `${focus.y}%` }"
        aria-hidden="true"
      />
    </div>

    <div class="flex flex-col items-center gap-2 sm:items-start">
      <p class="text-sm font-semibold text-ink-700">{{ t('coverPhoto.focus.preview') }}</p>
      <div class="w-24 overflow-hidden rounded-t-full rounded-b-md bg-cream-200 ring-1 ring-line" :style="{ aspectRatio: String(frameAspect) }">
        <img :src="src" alt="" class="h-full w-full object-cover" :style="{ objectPosition: formatFocus(focus) }" />
      </div>
      <p class="text-xs text-ink-500" aria-live="polite">{{ valueText }}</p>
    </div>
  </div>
</template>
