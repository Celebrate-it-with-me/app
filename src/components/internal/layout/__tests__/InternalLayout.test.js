import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'

const currentRoute = vi.hoisted(() => ({ path: '/dashboard/guests', name: 'guests' }))
vi.mock('vue-router', () => ({
  useRoute: () => currentRoute,
  useRouter: () => ({ push: vi.fn() })
}))
vi.mock('@/services/axios', () => ({ CWM_API: { get: vi.fn(), post: vi.fn() } }))

import i18n from '@/locales/i18n'
import InternalLayout from '../InternalLayout.vue'
import { useHydrationStore } from '@/stores/useHydrationStore'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'

// Counts how many times the screen inside the layout is created: each creation is one round of its own fetches.
let screenMounts = 0
const Screen = defineComponent({
  setup() {
    screenMounts++
    return () => h('div', { 'data-test': 'screen' })
  }
})
const Stub = defineComponent({ render: () => h('div') })

function mountLayout() {
  return mount(InternalLayout, {
    global: {
      plugins: [i18n],
      stubs: {
        RouterView: Screen,
        'router-view': Screen,
        'router-link': Stub,
        QuinviteLogo: Stub,
        EventSwitcher: Stub,
        UserMenu: Stub,
        AppSidebar: Stub,
        AppBottomNav: Stub,
        AssistantGuide: Stub,
        AnnouncementBanners: Stub,
        ImpersonationBanner: Stub,
        CPageLoaderV2: { template: '<div data-test="loader" />' }
      }
    }
  })
}

describe('InternalLayout', () => {
  beforeEach(() => {
    currentRoute.path = '/dashboard/guests'
    setActivePinia(createPinia())
    screenMounts = 0
    useHydrationStore().isHydrated = true
    useEventsStore().activeEvent = { id: 8 }
    useEventsStore().events = [{ id: 8 }]
  })

  it('shows the loader first and creates the screen only once, after loading ends', async () => {
    let finish
    useCollaboratorsStore().loadInvitations = vi.fn(() => new Promise(resolve => (finish = resolve)))

    const wrapper = mountLayout()
    await flushPromises()
    expect(wrapper.find('[data-test="loader"]').exists()).toBe(true)
    expect(screenMounts).toBe(0)

    finish()
    await flushPromises()
    expect(wrapper.find('[data-test="loader"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="screen"]').exists()).toBe(true)
    expect(screenMounts).toBe(1)
  })

  it('offers the help button a place in the header only on the Inicio', async () => {
    const other = mountLayout()
    await flushPromises()
    expect(other.find('[data-testid="help-dock"]').exists()).toBe(false)
    currentRoute.path = '/dashboard'
    const inicio = mountLayout()
    await flushPromises()
    expect(inicio.find('#shell-help-dock').exists()).toBe(true)
  })

  it('marks its root as the app shell so the scrollbar gutter rule applies', async () => {
    const wrapper = mountLayout()
    await flushPromises()
    expect(wrapper.classes()).toContain('app-shell')
  })

  it('keeps the assistant button column free from 1024 px wherever the button floats', async () => {
    const wrapper = mountLayout()
    await flushPromises()
    expect(wrapper.get('[data-testid="shell-content"]').classes().join(' ')).toContain('lg:pr-[calc(var(--assistant-fab-reserve)-1.5rem)]')
  })

  it('reserves nothing on the Inicio, where the help icon is docked in the header', async () => {
    currentRoute.path = '/dashboard'
    const wrapper = mountLayout()
    await flushPromises()
    expect(wrapper.get('[data-testid="shell-content"]').classes().join(' ')).not.toContain('assistant-fab')
  })

  it('reserves nothing in Mi cuenta either: the assistant is not shown there', async () => {
    currentRoute.path = '/settings/profile'
    const wrapper = mountLayout()
    await flushPromises()
    expect(wrapper.get('[data-testid="shell-content"]').classes().join(' ')).not.toContain('assistant-fab')
  })
})
