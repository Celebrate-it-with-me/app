import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { routerKey } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import EventSwitcher from '../EventSwitcher.vue'

describe('EventSwitcher countdown', () => {
  beforeEach(() => {
    setLocale('es')
    vi.useFakeTimers({ toFake: ['Date'] })
    // Noon in Miami on November 26, 2026.
    vi.setSystemTime(new Date('2026-11-26T17:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  function mountWith(event) {
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useEventsStore().activeEvent = event ? { id: 7, eventName: 'Los XV', status: 'published', timezone: 'America/New_York', ...event } : null
    return mount(EventSwitcher, { global: { plugins: [i18n, pinia], provide: { [routerKey]: { push: vi.fn() } } } })
  }
  const trigger = w => w.get('[aria-label]').text()

  it('counts the days to the event on its own calendar day', () => {
    expect(trigger(mountWith({ startsAt: '2026-11-29T23:00:00Z' }))).toContain('Faltan 3 días')
    expect(trigger(mountWith({ startsAt: '2026-11-27T04:30:00Z' }))).toContain('Es hoy')
    expect(trigger(mountWith({ startDate: '11/27/2026 18:00' }))).toContain('Falta 1 día')
  })
  it('says the event is over, and stays quiet for archived events, events without a date or no event', () => {
    expect(trigger(mountWith({ startsAt: '2026-11-20T23:00:00Z' }))).toContain('Ya pasó')
    for (const w of [mountWith({ startsAt: '2026-11-29T23:00:00Z', status: 'archived' }), mountWith({ startDate: '' }), mountWith(null)]) {
      expect(trigger(w)).not.toMatch(/Falta|Es hoy|Ya pasó/)
    }
    expect(trigger(mountWith(null))).toContain(i18n.global.t('app.noEvent'))
  })
})
