<script setup>
/**
 * Live preview of an invitation payload in an iframe of the app's own /preview/invitation page, the same engine the
 * guests get (including the integrity guard and the fallback to Clásica). The payload comes from the API
 * (`POST invitation/preview`); this only hands it over with postMessage, to our own origin and to nobody else.
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  payload: { type: Object, default: null },
  title: { type: String, required: true }
})

const frame = ref(null)
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

onMounted(() => window.addEventListener('message', onMessage))
onBeforeUnmount(() => window.removeEventListener('message', onMessage))
watch(() => props.payload, send)
</script>

<template>
  <iframe
    ref="frame"
    src="/preview/invitation"
    :title="title"
    loading="eager"
    referrerpolicy="same-origin"
    class="h-full w-full border-0 bg-cream-100"
  />
</template>
