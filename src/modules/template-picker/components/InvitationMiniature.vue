<script setup>
/**
 * The real invitation in miniature: the cover as guests will see it, drawn by the app's own /preview/invitation page in
 * an inert iframe (390x844) scaled down. It works without guests and without a published event.
 *
 *   <InvitationMiniature :event-id="event.id" :width="56" :fallback-image="template.previewImage" :name="event.name" />
 *
 * Loads lazily (when it scrolls into view) and takes a slot from `iframeSlots` so only a few iframes live at once. If the
 * payload fails, takes too long or the API answers 429, it falls back to `fallbackImage` or a stationery card.
 * `width` fixes the size; without it the miniature fills its parent's width (the height follows the phone ratio).
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Sparkles } from 'lucide-vue-next'
import { iframeSlots } from '../composables/useIframeSlots'
import { useInvitationMiniature } from '../composables/useInvitationMiniature'

const BASE_W = 390
const BASE_H = 844

const props = defineProps({
  eventId: { type: [Number, String], default: null },
  /** Template to draw; the event's active one when empty. */
  templateId: { type: [Number, String], default: null },
  /** Width in px. Empty: fill the parent. */
  width: { type: Number, default: null },
  /** Image shown when the live view cannot be drawn. */
  fallbackImage: { type: String, default: '' },
  name: { type: String, default: '' },
  /** Already formatted date line for the stationery card. */
  dateLabel: { type: String, default: '' },
  /** false: skip the live view and draw the fallback straight away (roles that cannot call the preview). */
  live: { type: Boolean, default: true },
  /** ms before giving up on the live view. */
  timeout: { type: Number, default: 10000 }
})

const { t, locale } = useI18n()
const root = ref(null)
const frame = ref(null)
const measured = ref(0)
const visible = ref(false)
const frameReady = ref(false)
const slotGranted = ref(false)
const imageFailed = ref(false)
const origin = window.location.origin

const mini = useInvitationMiniature(() => props.eventId, {
  templateId: () => props.templateId,
  locale: () => locale.value,
  timeout: props.timeout
})

let slot = null
const boxWidth = computed(() => props.width ?? measured.value)
const scale = computed(() => (boxWidth.value > 0 ? boxWidth.value / BASE_W : 0))
const boxStyle = computed(() => (props.width ? { width: `${props.width}px`, height: `${Math.round((props.width * BASE_H) / BASE_W)}px` } : null))
const frameStyle = computed(() => ({ width: `${BASE_W}px`, height: `${BASE_H}px`, transform: `scale(${scale.value})`, transformOrigin: 'top left' }))

const failed = computed(() => !props.live || !props.eventId || mini.status.value === 'failed')
const showFrame = computed(() => !failed.value && slotGranted.value)
const shown = computed(() => showFrame.value && mini.status.value === 'ready' && frameReady.value)
const showText = computed(() => boxWidth.value >= 90)
const showImage = computed(() => failed.value && !!props.fallbackImage && !imageFailed.value)
const label = computed(() => t('templatePicker.miniature.alt', { name: props.name }))

function free() {
  slot?.cancel()
  slot = null
  slotGranted.value = false
  frameReady.value = false
}

async function start() {
  if (slot || failed.value) return
  slot = iframeSlots.acquire()
  const mine = slot
  await mine.promise
  if (slot !== mine) return
  slotGranted.value = true
  await mini.load()
}

function send() {
  const target = frame.value?.contentWindow
  if (!frameReady.value || !mini.payload.value || !target) return
  target.postMessage({ type: 'qv-preview', payload: JSON.parse(JSON.stringify(mini.payload.value)) }, origin)
}

function onMessage(event) {
  if (event.origin !== origin || !frame.value || event.source !== frame.value.contentWindow) return
  if (event.data?.type !== 'qv-preview-ready') return
  frameReady.value = true
  send()
}

let io = null
let ro = null
onMounted(() => {
  window.addEventListener('message', onMessage)
  measured.value = root.value?.clientWidth ?? 0
  if (!props.width && typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(entries => (measured.value = entries[0]?.contentRect.width ?? measured.value))
    ro.observe(root.value)
  }
  if (typeof IntersectionObserver === 'undefined') {
    visible.value = true
  } else {
    io = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        visible.value = true
        io?.disconnect()
      }
    })
    io.observe(root.value)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage)
  io?.disconnect()
  ro?.disconnect()
  free()
})

watch(
  [visible, () => props.live, () => props.eventId],
  () => visible.value && !failed.value && start(),
  { immediate: true }
)
watch(failed, value => value && free())
watch(() => mini.payload.value, send)
watch(() => props.fallbackImage, () => (imageFailed.value = false))
</script>

<template>
  <div
    ref="root"
    class="relative overflow-hidden bg-cream-100"
    :class="width ? '' : 'aspect-[390/844] w-full'"
    :style="boxStyle"
    role="img"
    :aria-label="label"
    data-testid="invitation-miniature"
    :data-state="failed ? 'fallback' : shown ? 'ready' : 'loading'"
  >
    <iframe
      v-if="showFrame"
      ref="frame"
      src="/preview/invitation"
      tabindex="-1"
      aria-hidden="true"
      inert
      referrerpolicy="same-origin"
      loading="eager"
      class="pointer-events-none absolute left-0 top-0 max-w-none border-0 bg-cream-100 transition-opacity duration-200 ease-out motion-reduce:transition-none"
      :class="shown ? 'opacity-100' : 'opacity-0'"
      :style="frameStyle"
      data-testid="miniature-frame"
    ></iframe>

    <div v-if="!failed && !shown" class="absolute inset-0 bg-cream-200 motion-safe:animate-pulse" aria-hidden="true" data-testid="miniature-skeleton"></div>

    <img
      v-if="showImage"
      :src="fallbackImage"
      alt=""
      class="absolute inset-0 h-full w-full object-cover object-top"
      data-testid="miniature-image"
      @error="imageFailed = true"
    />
    <div
      v-else-if="failed"
      class="absolute inset-0 bg-gradient-to-b from-cream-50 via-cream-100 to-rose-100 p-[8%]"
      data-testid="miniature-card"
    >
      <div class="flex h-full flex-col items-center justify-center gap-[6%] rounded-xl border border-gold-300 px-[6%] text-center">
        <Sparkles class="h-4 w-4 shrink-0 text-gold-500" aria-hidden="true" />
        <template v-if="showText">
          <span class="h-px w-10 bg-gold-500" aria-hidden="true"></span>
          <p class="font-heading text-lg leading-tight text-ink-900 text-balance sm:text-2xl">{{ name }}</p>
          <p v-if="dateLabel" class="text-xs text-ink-600 first-letter:uppercase sm:text-sm">{{ dateLabel }}</p>
          <span class="h-px w-10 bg-gold-500" aria-hidden="true"></span>
        </template>
      </div>
    </div>
  </div>
</template>
