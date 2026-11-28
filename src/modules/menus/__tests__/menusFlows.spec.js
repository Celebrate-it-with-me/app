import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp, reactive, ref } from 'vue'
import { routerKey } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useUserStore } from '@/stores/useUserStore'
import { useToast } from '@/ui'

const api = vi.hoisted(() => ({ loadMenus: vi.fn(), loadGuestMenu: vi.fn(), loadSummary: vi.fn(), deleteMenu: vi.fn(), exportGuestsMenu: vi.fn() }))
vi.mock('../services/MenusService', () => ({ default: api }))
const ctrl = vi.hoisted(() => ({ current: null }))
vi.mock('@/modules/menus/composables/useMenuFormController', () => ({ useMenuFormController: () => ctrl.current }))

import MenusView from '../views/MenusView.vue'
import CreateMenusView from '../views/CreateMenusView.vue'

const MENUS = [
  { id: 1, title: 'Clasico', description: 'Cena', is_default: true, allow_multiple_choices: true, allow_custom_request: false },
  { id: 3, title: 'Infantil', description: '', is_default: false, allow_multiple_choices: false, allow_custom_request: true }
]
const SUMMARY = { total: 25, responded: 20, pending: 5, menus: [{ menuId: 1, name: 'Clasico', count: 4 }], courses: { starter: [], main: [], dessert: [] } }
const guest = i => ({ id: i, name: `Invitado ${i}`, email: null, starterName: 'N/A', mainName: 'N/A', dessertName: 'N/A', menuId: 1, menuName: 'Clasico', hasChosen: true })
const page = (data, meta = {}) => ({ status: 200, data: { data, meta: { current_page: 1, last_page: 3, total: 25, ...meta } } })
const toasts = () => useToast().toasts.map(t => `${t.tone}:${t.title}`)

describe('MenusView flows', () => {
  let wrapper
  const push = vi.fn()

  async function setup() {
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useUserStore().activeEvent = 7
    wrapper = mount(MenusView, { attachTo: document.body, global: { plugins: [i18n, pinia], provide: { [routerKey]: { push, replace: vi.fn() } } } })
    await flushPromises()
  }
  const menuItems = async index => {
    wrapper.findAll('[data-testid=menu-more]')[index].element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await flushPromises()
    return [...document.body.querySelectorAll('[role=menuitem]')]
  }

  beforeEach(() => {
    setLocale('es')
    Object.values(api).forEach(fn => fn.mockReset())
    push.mockReset()
    useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
    api.loadMenus.mockResolvedValue({ status: 200, data: MENUS })
    api.loadSummary.mockResolvedValue({ status: 200, data: SUMMARY })
    api.loadGuestMenu.mockResolvedValue(page([guest(1), guest(2)]))
  })
  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('tells which menus allow several choices or a custom request', async () => {
    await setup()
    const cards = wrapper.findAll('[data-testid=menu-card]')
    expect(cards[0].text()).toContain(i18n.global.t('app.menus.multiple'))
    expect(cards[0].text()).not.toContain(i18n.global.t('app.menus.custom'))
    expect(cards[1].text()).toContain(i18n.global.t('app.menus.custom'))
  })

  it('"Editar" in the menu opens the editor of that menu', async () => {
    await setup()
    const items = await menuItems(0)
    items[0].click()
    await flushPromises()
    expect(push).toHaveBeenCalledWith('/dashboard/menus/edit/1')
  })

  it('shows the empty state when there are no menus', async () => {
    api.loadMenus.mockResolvedValue({ status: 200, data: [] })
    await setup()
    expect(wrapper.text()).toContain(i18n.global.t('app.menus.emptyTitle'))
    expect(wrapper.find('[data-testid=menu-cards]').exists()).toBe(false)
  })

  it('cancelling the delete confirmation keeps the menu, and a failed delete says so', async () => {
    api.deleteMenu.mockRejectedValue(new Error('500'))
    await setup()
    let items = await menuItems(0)
    items[1].click()
    await flushPromises()
    const dialogButtons = () => [...document.body.querySelectorAll('[role=dialog] button')]
    dialogButtons().find(b => b.textContent.trim() === i18n.global.t('app.menus.cancel')).click()
    await flushPromises()
    expect(api.deleteMenu).not.toHaveBeenCalled()
    items = await menuItems(0)
    items[1].click()
    await flushPromises()
    dialogButtons().find(b => b.textContent.trim() === 'Eliminar').click()
    await flushPromises()
    expect(toasts()).toContain(`danger:${i18n.global.t('app.menus.deleteError')}`)
  })

  it('moves through the pages and the page size of the guest list, and says when a reload fails', async () => {
    await setup()
    api.loadGuestMenu.mockClear()
    api.loadGuestMenu.mockResolvedValue(page([guest(3)], { current_page: 2 }))
    const next = [...document.querySelectorAll('nav button, [aria-label] button, button')].find(b => /2$/.test(b.textContent.trim()) || b.getAttribute('aria-label')?.includes('2'))
    next.click()
    await flushPromises()
    expect(api.loadGuestMenu).toHaveBeenCalledWith(expect.objectContaining({ eventId: 7, page: 2 }))
    api.loadGuestMenu.mockClear()
    api.loadGuestMenu.mockRejectedValue(new Error('500'))
    wrapper.findComponent({ name: 'GuestsMenu' }).vm.$.setupState.onPerPage('25')
    await flushPromises()
    expect(api.loadGuestMenu).toHaveBeenCalledWith(expect.objectContaining({ page: 1, perPage: 25 }))
    expect(toasts()).toContain(`danger:${i18n.global.t('app.menus.loadError')}`)
  })

  it('tapping the filter that is already on does not reload', async () => {
    await setup()
    api.loadGuestMenu.mockClear()
    await wrapper.findAll('[data-testid=guest-filter]')[0].trigger('click')
    await flushPromises()
    expect(api.loadGuestMenu).not.toHaveBeenCalled()
  })
})

describe('CreateMenusView', () => {
  const state = (mode = 'create') => ({
    sending: ref(false),
    loading: ref(false),
    deleting: ref(false),
    mode: ref(mode),
    showDeleteMenuModal: ref(false),
    menuState: reactive({ title: '', description: '', allow_custom_request: false, allow_multiple_choices: false, main_menu: false }),
    errors: reactive({}),
    onSubmit: vi.fn(),
    handleDeleteMenu: vi.fn()
  })
  let wrapper
  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })
  const mountIt = () => {
    setLocale('es')
    wrapper = mount(CreateMenusView, { attachTo: document.body, global: { plugins: [i18n], stubs: { RouterLink: { template: '<a><slot /></a>' } } } })
  }

  it('submits the form from the "create" button and shows no danger zone', async () => {
    ctrl.current = state()
    mountIt()
    expect(wrapper.text()).toContain(i18n.global.t('app.menus.createTitle'))
    expect(wrapper.text()).not.toContain(i18n.global.t('app.menus.deleteMenu'))
    await wrapper.get('#menu-form').trigger('submit')
    expect(ctrl.current.onSubmit).toHaveBeenCalled()
  })

  it('edit mode shows its own title, shows field errors and opens the delete confirmation', async () => {
    ctrl.current = state('edit')
    ctrl.current.errors.title = 'El título es obligatorio'
    mountIt()
    expect(wrapper.text()).toContain(i18n.global.t('app.menus.editTitle'))
    expect(wrapper.text()).toContain('El título es obligatorio')
    await wrapper.findAll('button').find(b => b.text() === i18n.global.t('app.menus.deleteMenu')).trigger('click')
    expect(ctrl.current.showDeleteMenuModal.value).toBe(true)
    await flushPromises()
    const del = [...document.body.querySelectorAll('[role=dialog] button')].find(b => b.textContent.trim() === i18n.global.t('app.menus.delete'))
    del.click()
    expect(ctrl.current.handleDeleteMenu).toHaveBeenCalled()
  })
})
