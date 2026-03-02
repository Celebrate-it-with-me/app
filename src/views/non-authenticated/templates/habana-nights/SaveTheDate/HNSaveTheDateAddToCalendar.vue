<script setup>
import 'add-to-calendar-button'
import { atcb_action } from 'add-to-calendar-button'
import { computed } from 'vue'

const props = defineProps({
  config: { type: Object, default: () => ({}) },
  event: { type: Object, default: null }
})

const section = computed(() => props.config?.sections?.saveTheDate ?? {})

const buttonLabel = computed(() => {
  return section.value?.addToCalendar?.buttonLabel ?? 'Add to Calendar'
})

const buttonStyleCfg = computed(() => {
  return (
    section.value?.addToCalendar?.buttonStyle ?? {
      bgColor: 'transparent',
      fontColor: 'rgba(248,241,231,0.92)',
      hoverColor: 'var(--hn-gold)',
      fontFamily: 'var(--hn-font-body)',
      borderRadius: '14px',
      borderColor: 'rgba(212,175,55,0.55)'
    }
  )
})

const buttonStyle = computed(() => ({
  backgroundColor: buttonStyleCfg.value.bgColor,
  color: buttonStyleCfg.value.fontColor,
  borderColor: buttonStyleCfg.value.borderColor,
  borderRadius: buttonStyleCfg.value.borderRadius,
  fontFamily: buttonStyleCfg.value.fontFamily
}))

const defaultEventCfg = computed(() => {
  const e = props.event

  const eventName = e?.name ?? e?.title ?? 'Event'
  const description = e?.description ?? 'Event reminder'

  // Map your real fields here when ready
  const startDate = e?.date ?? section.value?.date ?? '2026-01-01'
  const startTime = e?.startTime ?? '19:00'
  const endDate = e?.endDate ?? startDate
  const endTime = e?.endTime ?? '23:00'

  return {
    label: eventName,
    name: `[Reminder] ${eventName}`,
    description,
    startDate,
    startTime,
    endDate,
    endTime,
    options: ['Google', 'iCal', 'Apple', 'Outlook.com'],
    timeZone: e?.timeZone ?? 'America/New_York'
  }
})

const eventCfg = computed(() => {
  const overrides = section.value?.addToCalendar?.event ?? {}
  return { ...defaultEventCfg.value, ...overrides }
})

const handleClick = e => {
  e.preventDefault()
  atcb_action(eventCfg.value)
}
</script>

<template>
  <div class="hn-std-atc">
    <button class="hn-std-atc__btn" :style="buttonStyle" type="button" @click="handleClick">
      <span class="hn-std-atc__shine" />
      <span class="hn-std-atc__label">{{ buttonLabel }}</span>
    </button>
  </div>
</template>
