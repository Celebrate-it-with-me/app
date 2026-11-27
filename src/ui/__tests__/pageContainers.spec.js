import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'

const { CWM_API } = vi.hoisted(() => {
  const fail = () => Promise.reject(new Error('offline'))
  return { CWM_API: { get: fail, post: fail, put: fail, patch: fail, delete: fail } }
})
vi.mock('@/services/axios', () => ({ CWM_API }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/dashboard/x', name: 'x', params: { id: '7' }, query: {} }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  onBeforeRouteLeave: vi.fn()
}))

import i18n from '@/locales/i18n'
import { UiPage } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

import AccountLayout from '@/components/internal/layout/AccountLayout.vue'
import BudgetView from '@/modules/budget/views/BudgetView.vue'
import CCommentsView from '@/modules/comments/views/CCommentsView.vue'
import DressCodeView from '@/modules/dress-code/views/DressCodeView.vue'
import CreateEventView from '@/modules/events/views/CreateEventView.vue'
import EventsView from '@/modules/events/views/EventsView.vue'
import LocationsView from '@/modules/locations/views/LocationsView.vue'
import CreateMenusView from '@/modules/menus/views/CreateMenusView.vue'
import MenusView from '@/modules/menus/views/MenusView.vue'
import ShowMenuView from '@/modules/menus/views/ShowMenuView.vue'
import SaveTheDateView from '@/modules/save-the-date/views/SaveTheDateView.vue'
import CSuggestedMusic from '@/modules/suggested-music/views/CSuggestedMusic.vue'
import CSweetMemories from '@/modules/sweet-memories/views/CSweetMemories.vue'
import TimelineView from '@/modules/timeline/views/TimelineView.vue'
import PadrinosView from '@/modules/padrinos/views/PadrinosView.vue'
import CollaboratorsView from '@/modules/collaborators/views/CollaboratorsView.vue'

/** Every panel screen sits inside UiPage, so its title starts at the same x everywhere. */
const SCREENS = [
  ['Account (Mi cuenta)', AccountLayout],
  ['Create event', CreateEventView],
  ['Create menu', CreateMenusView],
  ['Budget', BudgetView],
  ['Comments', CCommentsView],
  ['Dress code', DressCodeView],
  ['My events', EventsView],
  ['Menus', MenusView],
  ['Show menu', ShowMenuView],
  ['Save the date', SaveTheDateView],
  ['Music', CSuggestedMusic],
  ['Memories', CSweetMemories],
  ['Collaborators', CollaboratorsView],
  ['Locations', LocationsView],
  ['Program', TimelineView],
  ['Padrinos', PadrinosView]
]

describe('panel screens share one container', () => {
  let pinia
  beforeEach(() => {
    pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    // jsdom has no matchMedia; the comments screen asks for it. The offline API errors are expected noise here.
    window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    useEventsStore().activeEvent = { id: 7, userRole: 'owner', modules: [], eventName: 'Los XV', timezone: 'America/New_York' }
  })

  it.each(SCREENS)('%s is a UiPage', async (_name, component) => {
    const wrapper = shallowMount(component, { global: { plugins: [i18n, pinia], stubs: { RouterView: true, RouterLink: true } } })
    await flushPromises()
    const page = wrapper.findComponent(UiPage)
    expect(page.exists()).toBe(true)
  })
})
