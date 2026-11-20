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
