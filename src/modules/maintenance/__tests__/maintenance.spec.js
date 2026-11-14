import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import es from '@/locales/es'
import en from '@/locales/en'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('axios', () => ({ default: { create: () => ({ get, interceptors: { request: { use: () => {} }, response: { use: () => {} } } }) } }))

const imp = vi.hoisted(() => ({ active: false }))
vi.mock('@/modules/impersonation/stores/useImpersonationStore', () => ({ useImpersonationStore: () => imp }))

import {
  formatEstimatedEnd,
  isMaintenanceError,
  parseStatus,
  retryDelaySeconds
} from '../utils/maintenance'
import { useSystemStatusStore } from '../stores/useSystemStatusStore'
import MaintenanceNotice from '../components/MaintenanceNotice.vue'

const err503 = (data = { code: 'maintenance', message: 'Volvemos pronto', retryAfter: 60 }, url = 'events') => ({
  config: { url },
  response: { status: 503, data, headers: {} }
})

function mountNotice(locale = 'es') {
  const i18n = createI18n({ legacy: false, locale, messages: { es, en } })
  return mount(MaintenanceNotice, { global: { plugins: [i18n] }, attachTo: document.body })
}

beforeEach(() => {
  setActivePinia(createPinia())
  get.mockReset()
  imp.active = false
  sessionStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => {
  useSystemStatusStore().stop()
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('helpers', () => {
  it('recognises only a 503 with the maintenance code', () => {
    expect(isMaintenanceError(err503())).toBe(true)
    expect(isMaintenanceError(err503({ message: 'Service Unavailable' }))).toBe(false)
    expect(isMaintenanceError({ response: { status: 500, data: { code: 'maintenance' } } })).toBe(false)
    expect(isMaintenanceError(new Error('network'))).toBe(false)
  })

  it('treats odd payloads as no maintenance', () => {
    expect(parseStatus(null).maintenance).toBe(false)
    expect(parseStatus('<html>').maintenance).toBe(false)
    expect(parseStatus({ maintenance: 'yes' }).maintenance).toBe(false)
    expect(parseStatus({ maintenance: true, message: '  ', estimatedEnd: 'nope' })).toEqual({ maintenance: true, message: null, estimatedEnd: null })
  })

  it('backs off with a 30 s floor and a cap', () => {
    expect(retryDelaySeconds(5, 0)).toBe(30)
    expect(retryDelaySeconds(60, 0)).toBe(60)
    expect(retryDelaySeconds(60, 2)).toBe(135)
    expect(retryDelaySeconds(60, 10)).toBe(300)
    expect(retryDelaySeconds(undefined, 0)).toBe(30)
  })

  it('formats the end in the given language and ignores bad dates', () => {
    const iso = '2026-11-13T20:30:00.000Z'
    expect(formatEstimatedEnd(iso, 'en')).toMatch(/Nov/)
    expect(formatEstimatedEnd(iso, 'es')).toMatch(/nov/i)
    expect(formatEstimatedEnd('nope', 'es')).toBeNull()
    expect(formatEstimatedEnd(null, 'es')).toBeNull()
  })
})

describe('polling', () => {
  it('asks on start, then every 60 s, and stops on stop()', async () => {
    get.mockResolvedValue({ data: { maintenance: false } })
    const store = useSystemStatusStore()
    store.start()
    await flushPromises()
    expect(get).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(60_000)
    expect(get).toHaveBeenCalledTimes(2)
    store.stop()
    await vi.advanceTimersByTimeAsync(180_000)
    expect(get).toHaveBeenCalledTimes(2)
  })

  it('pauses while the tab is hidden and asks again when it returns', async () => {
    get.mockResolvedValue({ data: { maintenance: false } })
    const store = useSystemStatusStore()
    store.start()
    await flushPromises()
    const hidden = vi.spyOn(document, 'hidden', 'get')
    hidden.mockReturnValue(true)
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(180_000)
    expect(get).toHaveBeenCalledTimes(1)
    hidden.mockReturnValue(false)
    document.dispatchEvent(new Event('visibilitychange'))
    await flushPromises()
    expect(get).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(60_000)
    expect(get).toHaveBeenCalledTimes(3)
    hidden.mockRestore()
  })

  it('a network error never blocks and clears nothing it should not', async () => {
    get.mockRejectedValue(new Error('Network Error'))
    const store = useSystemStatusStore()
    await store.fetchStatus()
    expect(store.maintenance).toBe(false)
    expect(store.blocked).toBe(false)
  })
})

describe('banner', () => {
  it('shows the server message and the estimated end, and can be dismissed for the session', async () => {
    get.mockResolvedValue({ data: { maintenance: true, message: 'Mejorando la plataforma', estimatedEnd: '2026-11-13T20:30:00Z' } })
    const wrapper = mountNotice('en')
    await flushPromises()
    const banner = wrapper.get('[role="status"]')
    expect(banner.text()).toContain('Mejorando la plataforma')
    expect(banner.text()).toMatch(/Estimated return: .*Nov/)
    await banner.get('button').trigger('click')
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(sessionStorage.getItem('quinvite.maintenance.dismissed')).toBe('1')
    wrapper.unmount()
  })

  it('works without an estimated end and falls back to the i18n text', async () => {
    get.mockResolvedValue({ data: { maintenance: true, message: null, estimatedEnd: null } })
    const wrapper = mountNotice('en')
    await flushPromises()
    const text = wrapper.get('[role="status"]').text()
    expect(text).toContain(en.maintenance.defaultMessage)
    expect(text).not.toContain('Estimated return')
    wrapper.unmount()
  })

  it('is absent when there is no maintenance', async () => {
    get.mockResolvedValue({ data: { maintenance: false } })
    const wrapper = mountNotice()
    await flushPromises()
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('a support session sees the banner and is never blocked', async () => {
    imp.active = true
    get.mockResolvedValue({ data: { maintenance: true, message: 'x', estimatedEnd: null } })
    const store = useSystemStatusStore()
    const wrapper = mountNotice()
    await flushPromises()
    store.handleMaintenanceResponse(err503(), '/dashboard')
    await flushPromises()
    expect(store.blocked).toBe(false)
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(document.querySelector('[data-testid="maintenance-overlay"]')).toBeNull()
    wrapper.unmount()
  })
})

describe('blocking screen', () => {
  it('opens on a 503 maintenance, focuses the retry button and recovers by itself', async () => {
    get.mockResolvedValue({ data: { maintenance: true, message: 'Volvemos pronto', estimatedEnd: null } })
    const store = useSystemStatusStore()
    const wrapper = mountNotice()
    await flushPromises()
    get.mockClear()
    store.handleMaintenanceResponse(err503(), '/dashboard')
    await flushPromises()
    const overlay = document.querySelector('[data-testid="maintenance-overlay"]')
    expect(overlay.getAttribute('role')).toBe('alert')
    expect(overlay.textContent).toContain('Volvemos pronto')
    expect(document.activeElement?.textContent).toContain('Reintentar ahora')

    // still in maintenance after the first wait: asks, stays, schedules a longer wait
    await vi.advanceTimersByTimeAsync(60_000)
    expect(get).toHaveBeenCalledTimes(1)
    expect(store.blocked).toBe(true)
    expect(store.attempt).toBe(2)

    // the API comes back: the screen closes without a reload
    get.mockResolvedValue({ data: { maintenance: false } })
    await vi.advanceTimersByTimeAsync(90_000)
    await flushPromises()
    expect(store.blocked).toBe(false)
    expect(document.querySelector('[data-testid="maintenance-overlay"]')).toBeNull()
    wrapper.unmount()
  })

  it('"Reintentar ahora" asks immediately', async () => {
    get.mockResolvedValue({ data: { maintenance: true, message: null, estimatedEnd: null } })
    const store = useSystemStatusStore()
    const wrapper = mountNotice()
    await flushPromises()
    store.handleMaintenanceResponse(err503(), '/dashboard')
    await flushPromises()
    get.mockClear()
    get.mockResolvedValue({ data: { maintenance: false } })
    document.querySelector('[data-testid="maintenance-overlay"] button').click()
    await flushPromises()
    expect(get).toHaveBeenCalledTimes(1)
    expect(store.blocked).toBe(false)
    wrapper.unmount()
  })

  it('a failing status call keeps retrying instead of unblocking forever', async () => {
    get.mockResolvedValue({ data: { maintenance: true } })
    const store = useSystemStatusStore()
    store.handleMaintenanceResponse(err503(), '/dashboard')
    await vi.advanceTimersByTimeAsync(60_000)
    expect(get).toHaveBeenCalled()
    expect(store.blocked).toBe(true)
  })

  it('on the public invitation it is a simple notice, not a full screen', async () => {
    get.mockResolvedValue({ data: { maintenance: true, message: 'Volvemos pronto', estimatedEnd: null } })
    const store = useSystemStatusStore()
    const wrapper = mountNotice()
    await flushPromises()
    store.handleMaintenanceResponse(err503(undefined, 'invitation/xv/VAL001'), '/i/xv/VAL001')
    await flushPromises()
    expect(wrapper.find('[data-testid="maintenance-guest-notice"]').exists()).toBe(true)
    expect(document.querySelector('[data-testid="maintenance-overlay"]')).toBeNull()
    wrapper.unmount()
  })
})

describe('axios interceptor', () => {
  it('opens the screen only for a maintenance 503', async () => {
    vi.resetModules()
    vi.doMock('@/router', () => ({ default: { currentRoute: { value: { path: '/dashboard', name: 'dashboard' } }, push: vi.fn(), replace: vi.fn() } }))
    vi.doMock('@/ui', () => ({ useToast: () => ({ toast: vi.fn() }) }))
    vi.doMock('@/stores/useUserStore', () => ({ useUserStore: () => ({}) }))
    vi.doMock('@/stores/useNotificationStore', () => ({ useNotificationStore: () => ({}) }))
    vi.doMock('@/utils/reset', () => ({ smartResetAllStores: vi.fn() }))
    const { onError } = await import('@/services/axios')
    const { useSystemStatusStore: freshStore } = await import('../stores/useSystemStatusStore')
    const { createPinia: cp, setActivePinia: sap } = await import('pinia')
    sap(cp())
    const store = freshStore()

    await expect(onError(err503({ message: 'Service Unavailable' }))).rejects.toBeTruthy()
    expect(store.blocked).toBe(false)

    await expect(onError(err503())).rejects.toBeTruthy()
    expect(store.blocked).toBe(true)
    expect(store.message).toBe('Volvemos pronto')
    store.stop()
  })
})

describe('locales', () => {
  it('has the same maintenance keys in es and en', () => {
    expect(Object.keys(es.maintenance).sort()).toEqual(Object.keys(en.maintenance).sort())
  })
})
