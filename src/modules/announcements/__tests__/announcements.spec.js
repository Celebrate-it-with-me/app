import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import es from '@/locales/es'
import en from '@/locales/en'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('axios', () => ({ default: { create: () => ({ get, post, interceptors: { request: { use: () => {} }, response: { use: () => {} } } }) } }))

const imp = vi.hoisted(() => ({ active: false }))
vi.mock('@/modules/impersonation/stores/useImpersonationStore', () => ({ useImpersonationStore: () => imp }))

import AnnouncementsService from '../services/AnnouncementsService'
import { MIN_REFRESH_MS, normalizeAnnouncements, safeCta } from '../utils/announcements'
import { useAnnouncementsStore } from '../stores/useAnnouncementsStore'
import AnnouncementBanners from '../components/AnnouncementBanners.vue'

const ann = (over = {}) => ({ id: 1, level: 'news', title: 'Titulo', body: 'Linea 1\nLinea 2', ctaLabel: null, ctaUrl: null, dismissible: true, ...over })
const apiError = (status, data = {}) => Object.assign(new Error('x'), { response: { status, data } })

beforeEach(() => {
  setActivePinia(createPinia())
  get.mockReset()
  post.mockReset()
  imp.active = false
  vi.useFakeTimers()
})
afterEach(() => vi.useRealTimers())

describe('safeCta', () => {
  it('accepts internal paths and https', () => {
    expect(safeCta('/dashboard/events')).toEqual({ kind: 'internal', href: '/dashboard/events' })
    expect(safeCta('https://quinvite.com/x')).toEqual({ kind: 'external', href: 'https://quinvite.com/x' })
  })
  it.each(['javascript:alert(1)', 'http://evil.example', 'data:text/html,hi', '//evil.example', '/\\evil', 'vbscript:x', 'evil.com', '', null, undefined, 42])('rejects %s', url => {
    expect(safeCta(url)).toBeNull()
  })
})

describe('normalizeAnnouncements', () => {
  it('drops malformed rows, caps at 3 and defaults the level', () => {
    const list = normalizeAnnouncements([ann({ id: 1 }), null, { id: 2 }, ann({ id: 3, level: 'zzz' }), ann({ id: 4 }), ann({ id: 5 })])
    expect(list.map(a => a.id)).toEqual([1, 3, 4])
    expect(list[1].level).toBe('info')
    expect(normalizeAnnouncements(undefined)).toEqual([])
  })
})

describe('service', () => {
  it('asks for the localized list and dismisses by id', async () => {
    get.mockResolvedValue({ data: { data: [ann()] } })
    post.mockResolvedValue({ data: { data: null } })
    expect(await AnnouncementsService.list('en')).toHaveLength(1)
    expect(get).toHaveBeenCalledWith('announcements', { params: { lang: 'en' } })
    await AnnouncementsService.dismiss(7)
    expect(post).toHaveBeenCalledWith('announcements/7/dismiss')
  })
})

describe('store', () => {
  it('spaces queries by at least 5 minutes unless forced', async () => {
    get.mockResolvedValue({ data: { data: [ann()] } })
    const store = useAnnouncementsStore()
    await store.load({ lang: 'es' })
    await store.load({ lang: 'es' })
    expect(get).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(MIN_REFRESH_MS + 1)
    await store.load({ lang: 'es' })
    expect(get).toHaveBeenCalledTimes(2)
    await store.load({ lang: 'en', force: true })
    expect(get).toHaveBeenCalledTimes(3)
  })

  it('keeps the list and stays quiet when the network fails', async () => {
    const store = useAnnouncementsStore()
    store.items = [ann()]
    get.mockRejectedValue(new Error('Network Error'))
    await expect(store.load({ lang: 'es', force: true })).resolves.toBeUndefined()
    expect(store.items).toHaveLength(1)
  })

  it('dismisses optimistically and reverts on failure', async () => {
    const store = useAnnouncementsStore()
    store.items = [ann({ id: 1 }), ann({ id: 2 })]
    let reject
    post.mockReturnValue(new Promise((_, r) => (reject = r)))
    const pending = store.dismiss(1)
    expect(store.items.map(a => a.id)).toEqual([2])
    reject(apiError(500))
    expect(await pending).toBe(false)
    expect(store.items.map(a => a.id)).toEqual([1, 2])
  })

  it('keeps it gone on 404 and marks it not dismissible on 422', async () => {
    const store = useAnnouncementsStore()
    store.items = [ann({ id: 1 }), ann({ id: 2 })]
    post.mockRejectedValueOnce(apiError(404, { code: 'announcement_not_found' }))
    expect(await store.dismiss(1)).toBe(true)
    expect(store.items.map(a => a.id)).toEqual([2])
    post.mockRejectedValueOnce(apiError(422, { errors: { announcement: ['not_dismissible'] } }))
    expect(await store.dismiss(2)).toBe(false)
    expect(store.items[0]).toMatchObject({ id: 2, dismissible: false })
  })

  it('does not dismiss what is not dismissible', async () => {
    const store = useAnnouncementsStore()
    store.items = [ann({ dismissible: false })]
    await store.dismiss(1)
    expect(post).not.toHaveBeenCalled()
    expect(store.items).toHaveLength(1)
  })
})

describe('banners', () => {
  async function mountBanners(list, locale = 'es') {
    get.mockResolvedValue({ data: { data: list } })
    const i18n = createI18n({ legacy: false, locale, messages: { es, en } })
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)*', component: { template: '<i/>' } }] })
    await router.push('/')
    const wrapper = mount(AnnouncementBanners, { global: { plugins: [i18n, router] }, attachTo: document.body })
    await flushPromises()
    return { wrapper, router }
  }

  it('renders level, title and body as plain text with line breaks', async () => {
    const { wrapper } = await mountBanners([
      ann({ id: 1, level: 'warning', title: '<b>Hola</b>', body: '<img src=x onerror=alert(1)>\nsegunda' }),
      ann({ id: 2, level: 'info' }),
      ann({ id: 3, level: 'news' })
    ])
    const items = wrapper.findAll('[data-testid=announcement]')
    expect(items.map(i => i.attributes('data-level'))).toEqual(['warning', 'info', 'news'])
    expect(items[0].find('img').exists()).toBe(false)
    expect(items[0].find('b').exists()).toBe(false)
    expect(items[0].text()).toContain('<b>Hola</b>')
    expect(items[0].find('[data-testid=announcement-body]').classes()).toContain('whitespace-pre-line')
    expect(items[0].find('svg').exists()).toBe(true)
    expect(items[0].find('.sr-only').text()).toContain('Aviso importante')
    wrapper.unmount()
  })

  it('shows the dismiss button only when dismissible, with an accessible name', async () => {
    const { wrapper } = await mountBanners([ann({ id: 1, dismissible: false, title: 'Fijo' }), ann({ id: 2, title: 'Cerrable' })])
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0].attributes('aria-label')).toBe('Cerrar aviso: Cerrable')
    wrapper.unmount()
  })

  it('hides dismiss during a support session', async () => {
    imp.active = true
    const { wrapper } = await mountBanners([ann()])
    expect(wrapper.findAll('button')).toHaveLength(0)
    expect(wrapper.find('[data-testid=announcement]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('closes on click and tells the person when it fails', async () => {
    const { wrapper } = await mountBanners([ann({ id: 1 })])
    post.mockResolvedValue({})
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(post).toHaveBeenCalledWith('announcements/1/dismiss')
    expect(wrapper.find('[data-testid=announcement]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('internal button navigates with the router', async () => {
    const { wrapper, router } = await mountBanners([ann({ ctaLabel: 'Ir', ctaUrl: '/dashboard/events' })])
    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/dashboard/events')
    expect(link.attributes('target')).toBeUndefined()
    await link.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/dashboard/events')
    wrapper.unmount()
  })

  it('external button opens a new tab with noopener noreferrer', async () => {
    const { wrapper } = await mountBanners([ann({ ctaLabel: 'Más', ctaUrl: 'https://quinvite.com/x' })])
    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('https://quinvite.com/x')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    wrapper.unmount()
  })

  it.each(['javascript:alert(1)', 'http://evil.example', 'data:text/html,x', '//evil.example'])('shows no button for %s', async url => {
    const { wrapper } = await mountBanners([ann({ ctaLabel: 'Ir', ctaUrl: url })])
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.find('[data-testid=announcement]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('queries on entering and on becoming visible, no more than every 5 minutes', async () => {
    const { wrapper } = await mountBanners([ann()])
    expect(get).toHaveBeenCalledTimes(1)
    expect(get).toHaveBeenCalledWith('announcements', { params: { lang: 'es' } })
    document.dispatchEvent(new Event('visibilitychange'))
    await flushPromises()
    expect(get).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(MIN_REFRESH_MS + 1)
    document.dispatchEvent(new Event('visibilitychange'))
    await flushPromises()
    expect(get).toHaveBeenCalledTimes(2)
    wrapper.unmount()
    document.dispatchEvent(new Event('visibilitychange'))
    expect(get).toHaveBeenCalledTimes(2)
  })

  it('renders nothing and does not throw when the API fails', async () => {
    get.mockRejectedValue(new Error('Network Error'))
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { es, en } })
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<i/>' } }] })
    const wrapper = mount(AnnouncementBanners, { global: { plugins: [i18n, router] } })
    await flushPromises()
    expect(wrapper.find('[data-testid=announcement]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('has es/en parity for its texts', () => {
    expect(Object.keys(es.announcements).sort()).toEqual(Object.keys(en.announcements).sort())
    expect(Object.keys(es.announcements.level).sort()).toEqual(Object.keys(en.announcements.level).sort())
  })
})
