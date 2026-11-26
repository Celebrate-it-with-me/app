import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/dashboard/guests', name: 'guests' }),
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

  it('marks its root as the app shell so the scrollbar gutter rule applies', async () => {
    const wrapper = mountLayout()
    await flushPromises()
    expect(wrapper.classes()).toContain('app-shell')
  })
})
