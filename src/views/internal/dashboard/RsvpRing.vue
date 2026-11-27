<script setup>
/**
 * The answers ring: attending, pending and declined people as arcs of one circle, with the response rate in the middle.
 * The whole drawing is one image for screen readers ("29 asisten, 7 pendientes, 3 no asisten"); colour is never the only
 * cue, the list next to it names every figure.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ringSegments } from './dashboardLogic'

const props = defineProps({
  attending: { type: Number, default: 0 },
  pending: { type: Number, default: 0 },
  declined: { type: Number, default: 0 },
  /** 0-100: share of invitations that answered. */
  rate: { type: Number, default: 0 }
})

const { t } = useI18n()
const R = 62
const LENGTH = 2 * Math.PI * R
const segments = computed(() => ringSegments(props, LENGTH))
const STROKES = { attending: 'stroke-success-500', pending: 'stroke-gold-500', declined: 'stroke-ink-400' }
const label = computed(() =>
  [
    t('app.dashboard.rsvp.ring.attending', { n: props.attending }, props.attending),
    t('app.dashboard.rsvp.ring.pending', { n: props.pending }, props.pending),
    t('app.dashboard.rsvp.ring.declined', { n: props.declined }, props.declined)
  ].join(', ') + `. ${t('app.dashboard.rsvp.ring.rate', { n: props.rate })}`
)
</script>

<template>
  <div class="relative size-30 shrink-0 @md:size-[150px]" data-testid="rsvp-ring">
    <svg viewBox="0 0 150 150" class="size-full -rotate-90" role="img" :aria-label="label">
      <circle cx="75" cy="75" :r="R" fill="none" class="stroke-cream-300" stroke-width="16" />
      <circle
        v-for="segment in segments"
        :key="segment.key"
        cx="75"
        cy="75"
        :r="R"
        fill="none"
        :class="STROKES[segment.key]"
        stroke-width="16"
        :stroke-dasharray="`${segment.dash} ${LENGTH - segment.dash}`"
        :stroke-dashoffset="segment.offset"
        :data-segment="segment.key"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
      <span class="font-heading text-[28px] leading-none text-ink-900 tabular-nums @md:text-[34px]">{{ rate }} %</span>
      <span class="mt-1 text-[11px] text-ink-500 @md:text-xs">{{ t('app.dashboard.rsvp.responded') }}</span>
    </div>
  </div>
</template>
