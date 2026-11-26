<script setup>
/**
 * Live preview of an invitation payload in an iframe of the app's own /preview/invitation page, the same engine the
 * guests get (including the integrity guard and the fallback to Clásica). The payload comes from the API
 * (`POST invitation/preview`); this only hands it over with postMessage, to our own origin and to nobody else.
 *
 * `scaled`: the page is laid out at the phone size (390x844) and shrunk to the width of the box, so the box can be any size
 * and shows the cover as a small phone. With `inert` the page cannot be scrolled, focused or clicked: a picture of the
 * cover, no scroll of its own. `ready` is emitted when the page drew the payload, to take the skeleton away.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  payload: { type: Object, default: null },
  title: { type: String, required: true },
  scaled: { type: Boolean, default: false },
  inert: { type: Boolean, default: false }
})
const emit = defineEmits(['ready'])
const BASE_W = 390
const BASE_H = 844

const frame = ref(null)
const box = ref(null)
const measured = ref(0)
const ready = ref(false)
const origin = window.location.origin

function send() {
  if (!ready.value || !props.payload || !frame.value?.contentWindow) return
  frame.value.contentWindow.postMessage({ type: 'qv-preview', payload: JSON.parse(JSON.stringify(props.payload)) }, origin)
}

function onMessage(event) {
  if (event.origin !== origin || event.source !== frame.value?.contentWindow) return
  if (event.data?.type !== 'qv-preview-ready') return
  ready.value = true
  send()
}

const scale = computed(() => (measured.value > 0 ? measured.value / BASE_W : 0))
const frameStyle = computed(() => (props.scaled ? { width: `${BASE_W}px`, height: `${BASE_H}px`, transform: `scale(${scale.value})`, transformOrigin: 'top left' } : null))

let observer = null
onMounted(() => {
  window.addEventListener('message', onMessage)
  if (!props.scaled) return
  measured.value = box.value?.clientWidth ?? 0
  if (typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(entries => (measured.value = entries[0]?.contentRect.width ?? measured.value))
  observer.observe(box.value)
})
onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage)
  observer?.disconnect()
})
watch(() => props.payload, send)
// The page answers "ready" once, then draws each payload it gets: the first drawn payload is the one the skeleton waits for.
watch(
  () => props.payload,
  payload => payload && ready.value && emit('ready'),
  { flush: 'post' }
)
watch(ready, value => value && props.payload && emit('ready'))
</script>

<template>
  <div v-if="scaled" ref="box" class="relative h-full w-full overflow-hidden bg-cream-100">
    <iframe
      ref="frame"
      src="/preview/invitation"
      :title="title"
      loading="eager"
      referrerpolicy="same-origin"
      scrolling="no"
      :inert="inert || undefined"
      :tabindex="inert ? -1 : undefined"
      class="absolute left-0 top-0 max-w-none border-0 bg-cream-100"
      :class="inert ? 'pointer-events-none' : ''"
      :style="frameStyle"
    />
  </div>
  <iframe
    v-else
    ref="frame"
    src="/preview/invitation"
    :title="title"
    loading="eager"
    referrerpolicy="same-origin"
    class="h-full w-full border-0 bg-cream-100"
  />
</template>
