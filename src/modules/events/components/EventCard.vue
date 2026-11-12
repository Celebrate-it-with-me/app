<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarDays, Users } from 'lucide-vue-next'
import { UiCard, UiBadge, UiButton } from '@/ui'
import { parseEventDate, daysUntil } from '@/views/internal/dashboard/dashboardLogic'
import { useEventsStore } from '../stores/useEventsStore'
import EventStatusBadge from './EventStatusBadge.vue'

const props = defineProps({
  event: { type: Object, required: true },
  /** Is this the event the app is working on right now? */
  active: { type: Boolean, default: false },
  busy: { type: Boolean, default: false }
})
const emit = defineEmits(['open', 'restore'])

const { t, locale } = useI18n()
const eventsStore = useEventsStore()

const date = computed(() => parseEventDate(props.event.startDate))
const dateLabel = computed(() =>
  date.value
    ? new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'long', year: 'numeric' }).format(date.value)
    : t('events.card.noDate')
)
const days = computed(() => daysUntil(date.value))
const countdown = computed(() => {
  if (props.event.status === 'archived' || days.value === null) return ''
  if (days.value < 0) return t('app.dashboard.past')
  return t('app.dashboard.countdown', { n: days.value }, days.value)
})
const isArchived = computed(() => props.event.status === 'archived')
// The API sends the type as an id; the slug comes from the types already loaded in the store.
const typeLabel = computed(() => {
  const slug = eventsStore.eventTypes.find(type => type.id === props.event.eventType)?.slug
  return slug ? t(`events.types.${slug}`) : ''
})
const guests = computed(() => props.event.guestsCount ?? 0)
const replied = computed(() => props.event.rsvpResponse ?? 0)
</script>

<template>
  <UiCard as="article" class="flex h-full flex-col" :class="active && 'border-gold-300 ring-1 ring-gold-300'">
    <div class="flex items-center justify-between gap-3">
      <EventStatusBadge :status="event.status" size="sm" />
      <UiBadge v-if="active" tone="gold" size="sm">{{ t('events.card.activeNow') }}</UiBadge>
    </div>

    <p v-if="typeLabel" class="mt-3 text-sm text-ink-500">{{ typeLabel }}</p>
    <h2 class="mt-0.5 font-heading text-2xl leading-snug text-ink-900 text-balance">{{ event.eventName }}</h2>

    <p class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-600">
      <CalendarDays class="h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
      <span>{{ dateLabel }}</span>
      <UiBadge v-if="countdown" tone="gold" size="sm">{{ countdown }}</UiBadge>
    </p>

    <p class="mt-2 flex items-center gap-2 text-sm text-ink-600">
      <Users class="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
      <span>
        {{ t('events.card.guests', { n: guests }, guests) }}
        <template v-if="guests > 0"> · {{ t('events.card.replied', { n: replied }, replied) }}</template>
      </span>
    </p>

    <div class="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
      <UiButton v-if="!isArchived" class="sm:flex-1" :loading="busy" @click="emit('open', event)">
        {{ t('events.card.open') }}
      </UiButton>
      <UiButton v-else class="sm:flex-1" :loading="busy" @click="emit('restore', event)">
        {{ t('events.card.restore') }}
      </UiButton>
      <UiButton variant="secondary" class="sm:flex-1" :to="{ name: 'edit-event', params: { id: event.id } }">
        {{ t('events.card.edit') }}
      </UiButton>
    </div>
  </UiCard>
</template>
