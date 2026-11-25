import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import es from '@/locales/es'
import en from '@/locales/en'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const { replace, route } = vi.hoisted(() => ({ replace: vi.fn(), route: { params: { module: 'guests-limit' }, query: {} } }))
vi.mock('vue-router', async importOriginal => ({ ...(await importOriginal()), useRoute: () => route, useRouter: () => ({ replace }) }))

import UnlockView from '../UnlockView.vue'

const PurchasePanel = {
  name: 'PurchasePanel',
  props: ['eventId'],
  emits: ['already-unlocked'],
  template: '<div data-testid="panel" @click="$emit(\'already-unlocked\')" />'
}
const stubs = { PurchasePanel, UiButton: { props: ['to'], template: '<a :data-to="to"><slot /></a>' } }

function mountView(event) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  const store = useEventsStore()
  store.activeEvent = event
  store.fetchEvent = vi.fn().mockResolvedValue(event)
  return { wrapper: mount(UnlockView, { global: { plugins: [i18n, pinia], stubs } }), store }
}

beforeEach(() => {
  setLocale('es')
  replace.mockReset()
  route.params = { module: 'guests-limit' }
  route.query = {}
})

describe('UnlockView by role', () => {
  it('shows the payment panel to the owner', async () => {
    const { wrapper } = mountView({ id: 7, userRole: 'owner' })
    await flushPromises()
    expect(wrapper.find('[data-testid="panel"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="owner-only"]').exists()).toBe(false)
  })

  it.each(['editor', 'viewer'])('tells a %s to ask the owner and never mounts the panel (so no quote or checkout)', async role => {
    const { wrapper } = mountView({ id: 7, userRole: role })
    await flushPromises()
    expect(wrapper.get('[data-testid="owner-only"]').text()).toContain(es.unlock.ownerOnly)
    expect(wrapper.find('[data-testid="panel"]').exists()).toBe(false)
  })

  it('says it in English too', async () => {
    setLocale('en')
    const { wrapper } = mountView({ id: 7, userRole: 'editor' })
    await flushPromises()
    expect(wrapper.get('[data-testid="owner-only"]').text()).toContain(en.unlock.ownerOnly)
  })
})

describe('UnlockView when the event is already unlocked', () => {
  it('replaces the payment with a clear state and links back and to the invoices', async () => {
    const { wrapper, store } = mountView({ id: 7, userRole: 'owner' })
    await wrapper.getComponent(PurchasePanel).vm.$emit('already-unlocked')
    await flushPromises()
    const done = wrapper.get('[data-testid="already-unlocked"]')
    expect(done.text()).toContain(es.unlock.alreadyUnlocked.title)
    expect(wrapper.find('[data-testid="panel"]').exists()).toBe(false)
    expect(wrapper.findAll('a').map(a => a.attributes('data-to'))).toEqual(['/dashboard', '/settings/purchases'])
    expect(store.fetchEvent).toHaveBeenCalledWith(7)
  })

  it('still shows it when refreshing the event fails, and goes back to the template picker when it came from one', async () => {
    route.query = { from: 'template', template: '12' }
    const { wrapper, store } = mountView({ id: 7, userRole: 'owner' })
    store.fetchEvent = vi.fn().mockRejectedValue(new Error('offline'))
    await wrapper.getComponent(PurchasePanel).vm.$emit('already-unlocked')
    await flushPromises()
    expect(wrapper.find('[data-testid="already-unlocked"]').exists()).toBe(true)
    expect(wrapper.findAll('a')[0].attributes('data-to')).not.toBe('/dashboard')
  })

  it('does not bounce a module screen away once the store says it is active', async () => {
    route.params = { module: 'collaborators' }
    const { wrapper, store } = mountView({ id: 7, userRole: 'owner', modules: [{ key: 'collaborators', state: 'locked' }] })
    await flushPromises()
    await wrapper.getComponent(PurchasePanel).vm.$emit('already-unlocked')
    store.activeEvent = { id: 7, userRole: 'owner', modules: [{ key: 'collaborators', state: 'active' }] }
    await flushPromises()
    expect(replace).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="already-unlocked"]').exists()).toBe(true)
  })
})

describe('UnlockView value tied to her event (ORG-004)', () => {
  beforeEach(() => {
    route.params = { module: 'full' }
  })

  it('names her guests and her event, and does not repeat the 300-guest cap', async () => {
    const { wrapper } = mountView({ id: 7, userRole: 'owner', name: 'Los XV de Valentina', guestsCount: 39 })
    await flushPromises()
    const text = wrapper.text()
    expect(text).toContain('Para tus 39 invitados de Los XV de Valentina')
    expect(text.match(/300/g)?.length ?? 0).toBe(1) // only the "included" list says it
  })

  it('falls back to the event name alone, and to a generic line without it', async () => {
    let view = mountView({ id: 7, userRole: 'owner', name: 'Los XV de Valentina', guestsCount: 1 })
    await flushPromises()
    expect(view.wrapper.text()).toContain('Para Los XV de Valentina: ')
    view = mountView({ id: 7, userRole: 'owner' })
    await flushPromises()
    expect(view.wrapper.text()).toContain(es.unlock.full.benefit)
  })
})
