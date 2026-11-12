<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarDays } from 'lucide-vue-next'
import { UiBadge } from '@/ui'
import { parseEventDate, daysUntil } from './dashboardLogic'

const props = defineProps({
  name: { type: String, default: '' },
  startDate: { type: String, default: '' },
  /** 0..1 as sent by the API (`setupProgress`). */
  progress: { type: Number, default: 0 }
})

const { t, locale } = useI18n()

const date = computed(() => parseEventDate(props.startDate))
const days = computed(() => daysUntil(date.value))

const dateLabel = computed(() =>
  date.value
    ? new Intl.DateTimeFormat(locale.value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date.value)
    : t('app.dashboard.noDate')
)

const countdown = computed(() => {
  if (days.value === null) return ''
  if (days.value < 0) return t('app.dashboard.past')
  return t('app.dashboard.countdown', { n: days.value }, days.value)
})

const percent = computed(() => Math.round(Math.min(1, Math.max(0, props.progress)) * 100))
</script>

<template>
  <header class="pb-6">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <p class="flex items-center gap-2 text-sm text-ink-600">
        <CalendarDays class="h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
        <span class="first-letter:uppercase">{{ dateLabel }}</span>
      </p>
      <UiBadge v-if="countdown" tone="gold" size="sm">{{ countdown }}</UiBadge>
    </div>
    <h1 class="mt-2 font-heading text-3xl text-ink-900 text-balance sm:text-4xl">{{ name }}</h1>

    <div class="mt-5 max-w-md">
      <div class="flex items-baseline justify-between gap-3 text-sm">
        <p class="text-ink-700">{{ t('app.dashboard.setup', { n: percent }) }}</p>
      </div>
      <div
        class="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-300"
        role="progressbar"
        :aria-valuenow="percent"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="t('app.dashboard.setup', { n: percent })"
      >
        <div class="h-full rounded-full bg-gold-500" :style="{ width: percent + '%' }"></div>
      </div>
    </div>
  </header>
</template>
