import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useEventDateTime } from '../useEventDateTime'

function run(source) {
  let api
  mount({ setup() { api = useEventDateTime(source); return () => null } }, { global: { plugins: [i18n] } })
  return api
}

describe('useEventDateTime', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setLocale('es')
  })

  it('formats in the language of the app and the zone of the active event', () => {
    useEventsStore().activeEvent = { id: 1, timezone: 'America/New_York' }
    const { format } = run()
    expect(format('2027-01-02T21:30:00Z', 'time')).toMatch(/^4:30 p\.\s?m\.$/)
    expect(format('01/02/2027 16:30')).toBe('2 de enero de 2027')
  })

  it('formats an event start and end, preferring its ISO instants', () => {
    const { formatEvent } = run()
    const event = { startDate: '01/02/2027 16:30', endDate: '01/03/2027 01:00', timezone: 'America/New_York' }
    expect(formatEvent(event, 'date')).toBe('2 de enero de 2027')
    expect(formatEvent(event, 'time', 'end')).toMatch(/^1:00 a\.\s?m\.$/)
    expect(formatEvent({ ...event, startsAt: '2027-01-02T16:30:00-05:00' }, 'time')).toMatch(/^4:30 p\.\s?m\.$/)
  })

  it('takes the event from a given source instead of the active one', () => {
    useEventsStore().activeEvent = { id: 1, timezone: 'Asia/Tokyo' }
    const { format } = run(() => ({ timezone: 'America/New_York' }))
    expect(format('2027-01-02T21:30:00Z', 'time')).toMatch(/^4:30 p\.\s?m\.$/)
  })

  it('answers an empty string for nothing', () => {
    const { format, formatEvent } = run()
    expect(format(null)).toBe('')
    expect(formatEvent(null)).toBe('')
  })
})
