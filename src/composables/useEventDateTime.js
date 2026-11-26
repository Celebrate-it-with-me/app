import { toValue } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { eventMoment, formatEventDate } from '@/utils/eventDateTime'

/**
 * Dates and times of the panel in the app's language and the event's zone, so no screen passes `locale` by hand.
 * `format(value, style)` prints a wall-clock text or an instant; `formatEvent(event, style, which)` prints an event's
 * start or end (the ISO `startsAt` when the API sends it, else `startDate`).
 * @param {import('vue').MaybeRefOrGetter<object|null>} [eventSource] defaults to the active event
 */
export function useEventDateTime(eventSource) {
  const { locale } = useI18n()
  const events = useEventsStore()
  const event = () => toValue(eventSource) ?? events.activeEvent ?? null

  return {
    locale,
    format: (value, style = 'date') => formatEventDate(value, style, locale.value, event()?.timezone),
    formatEvent: (target, style = 'date', which = 'start') =>
      formatEventDate(eventMoment(target, which), style, locale.value, target?.timezone ?? event()?.timezone)
  }
}
