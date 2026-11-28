<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarPlus } from 'lucide-vue-next'
import { timeLeft } from '../utils/stage'

/**
 * A phone-shaped mock of the public "Guarda la fecha" page, drawn from the form's live state (nothing is saved). When a
 * real preview route exists (an iframe fed by postMessage, like the invitation's), swap the markup for it in the same frame.
 */
const props = defineProps({
  eventName: { type: String, default: '' },
  /** The long date, already formatted ("Sábado, 2 de enero de 2027"). */
  dateLabel: { type: String, default: '' },
  /** The event's start as a Date (an instant), for the countdown; null hides it. */
  target: { type: Date, default: null },
  message: { type: String, default: '' },
  showCountdown: { type: Boolean, default: false },
  showCalendar: { type: Boolean, default: false },
  /** True when the notice is not what guests see (the full invitation is already published). */
  inactive: { type: Boolean, default: false },
  /** Shrinks the phone (1 = 270x500) so it fits a short screen. */
  scale: { type: Number, default: 1 }
})

const { t } = useI18n()
const FRAME = { width: 270, height: 500 }

const now = ref(new Date())
let timer = null
onMounted(() => {
  timer = setInterval(() => (now.value = new Date()), 60_000)
})
onBeforeUnmount(() => clearInterval(timer))

const left = computed(() => (props.target ? timeLeft(props.target, now.value) : null))
const boxes = computed(() =>
  left.value
    ? [
        { key: 'days', value: left.value.days },
        { key: 'hours', value: left.value.hours },
        { key: 'minutes', value: left.value.minutes }
      ]
    : []
)
const text = computed(() => props.message.trim())
const outerStyle = computed(() => ({ width: `${FRAME.width * props.scale}px`, height: `${FRAME.height * props.scale}px` }))
const innerStyle = computed(() => (props.scale === 1 ? undefined : { transform: `scale(${props.scale})`, transformOrigin: 'top left' }))
</script>

<template>
  <div class="mx-auto" :style="outerStyle" data-testid="std-preview">
    <div
      class="relative flex h-[500px] w-[270px] flex-col items-center justify-center gap-3.5 overflow-hidden rounded-[40px] border-[10px] border-ink-900 bg-cream-50 px-[22px] py-7 text-center shadow-[0_18px_40px_rgba(43,37,35,.18)]"
      :style="innerStyle"
    >
      <span
        v-if="inactive"
        class="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink-900/80 px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-white"
        data-testid="std-preview-inactive"
      >
        {{ t('app.saveTheDate.preview.inactive') }}
      </span>
      <p class="text-[11px] font-semibold tracking-[.22em] text-wine-800 uppercase">{{ t('app.saveTheDate.preview.kicker') }}</p>
      <p class="font-heading text-[30px] leading-[1.1] break-words text-ink-900" data-testid="std-preview-name">{{ eventName }}</p>
      <p v-if="dateLabel" class="text-[13px] text-ink-500">{{ dateLabel }}</p>
      <span class="h-px w-10 bg-ink-300" aria-hidden="true" />
      <p
        class="max-w-[220px] text-sm leading-normal break-words italic"
        :class="text ? 'text-ink-700' : 'text-ink-500'"
        data-testid="std-preview-message"
      >
        {{ text || t('app.saveTheDate.preview.messageEmpty') }}
      </p>
      <div v-if="showCountdown && boxes.length" class="flex gap-2" data-testid="std-preview-countdown">
        <div v-for="box in boxes" :key="box.key" class="w-14 rounded-xl border border-cream-300 bg-white py-2">
          <p class="text-xl leading-none font-semibold text-ink-900">{{ box.value }}</p>
          <p class="mt-1 text-[10px] tracking-wide text-ink-500 uppercase">{{ t(`app.saveTheDate.preview.${box.key}`) }}</p>
        </div>
      </div>
      <span
        v-if="showCalendar"
        class="inline-flex items-center gap-2 rounded-full bg-wine-800 px-4 py-2.5 text-[13px] font-semibold text-white"
        aria-hidden="true"
        data-testid="std-preview-calendar"
      >
        <CalendarPlus class="h-4 w-4" />
        {{ t('app.saveTheDate.preview.calendar') }}
      </span>
    </div>
  </div>
</template>
