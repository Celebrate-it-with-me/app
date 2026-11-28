import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { routerKey } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useUserStore } from '@/stores/useUserStore'

const api = vi.hoisted(() => ({
  loadMenus: vi.fn(),
  loadGuestMenu: vi.fn(),
  loadSummary: vi.fn(),
  deleteMenu: vi.fn(),
  exportGuestsMenu: vi.fn()
}))
vi.mock('../services/MenusService', () => ({ default: api }))

import MenusView from '../views/MenusView.vue'
import { useMenusStore } from '../stores/useMenusStore'

const MENUS = [
  { id: 1, title: 'Clasico', description: 'Cena de tres tiempos', is_default: true, allow_multiple_choices: false, allow_custom_request: true },
  { id: 3, title: 'Infantil', description: '', is_default: false, allow_multiple_choices: false, allow_custom_request: false }
]
const SUMMARY = {
  total: 6,
  responded: 4,
  pending: 2,
  menus: [
    { menuId: 1, name: 'Clasico', count: 4 },
    { menuId: 3, name: 'Infantil', count: 0 }
  ],
  courses: {
    starter: [{ dishId: 10, name: 'Ensalada', count: 3 }],
    main: [
      { dishId: 12, name: 'Pollo', count: 3 },
      { dishId: 13, name: 'Pasta', count: 1 }
    ],
    dessert: []
  }
}
const GUESTS = [
  { id: 1, name: 'Ana Perez', email: 'ana@x.com', starterName: 'Ensalada', mainName: 'Pollo', dessertName: 'N/A', menuId: 1, menuName: 'Clasico', hasChosen: true },
  { id: 2, name: 'Luis Gomez', email: null, starterName: 'N/A', mainName: 'N/A', dessertName: 'N/A', menuId: null, menuName: null, hasChosen: false }
]
const page = (data, extra = {}) => ({ status: 200, data: { data, meta: { current_page: 1, last_page: 1, total: data.length, ...extra } } })

describe('MenusView', () => {
  let wrapper
  const push = vi.fn()

  async function setup() {
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useUserStore().activeEvent = 7
    wrapper = mount(MenusView, {
      attachTo: document.body,
      global: { plugins: [i18n, pinia], provide: { [routerKey]: { push, replace: vi.fn() } } }
    })
    await flushPromises()
    return pinia
  }

  beforeEach(() => {
    setLocale('es')
    Object.values(api).forEach(fn => fn.mockReset())
    push.mockReset()
    api.loadMenus.mockResolvedValue({ status: 200, data: MENUS })
    api.loadSummary.mockResolvedValue({ status: 200, data: SUMMARY })
    api.loadGuestMenu.mockResolvedValue(page(GUESTS, { total: 6 }))
  })
  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('shows one card per menu with its chips and how many guests chose it', async () => {
    await setup()
    const cards = wrapper.findAll('[data-testid=menu-card]')
    expect(cards).toHaveLength(2)
    expect(cards[0].text()).toContain('Clasico')
    expect(cards[0].text()).toContain('Principal')
    expect(cards[0].text()).toContain('Peticiones especiales')
    expect(cards[0].find('[data-testid=menu-chosen]').text()).toBe('4 lo eligieron')
    expect(cards[1].text()).toContain('Opcional')
    expect(cards[1].text()).toContain('Sin descripción')
    expect(cards[1].find('[data-testid=menu-chosen]').text()).toBe('Nadie todavía')
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('opens the menu detail and has no visible Eliminar button', async () => {
    await setup()
    await wrapper.findAll('[data-testid=menu-details]')[0].trigger('click')
    expect(push).toHaveBeenCalledWith('/dashboard/menus/show/1')
    const visible = wrapper.findAll('[data-testid=menu-card] button').map(b => b.text())
    expect(visible.some(t => t === 'Eliminar')).toBe(false)
  })

  it('"⋯" offers Editar and Eliminar, and Eliminar asks for confirmation before deleting', async () => {
    api.deleteMenu.mockResolvedValue({ status: 200 })
    await setup()
    wrapper.findAll('[data-testid=menu-more]')[1].element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await flushPromises()
    const items = [...document.body.querySelectorAll('[role=menuitem]')]
    expect(items.map(i => i.textContent.trim())).toEqual(['Editar', 'Eliminar'])
    items[1].click()
    await flushPromises()
    expect(document.body.textContent).toContain('¿Eliminar este menú?')
    expect(api.deleteMenu).not.toHaveBeenCalled()
    const confirm = [...document.body.querySelectorAll('[role=dialog] button')].find(b => b.textContent.trim() === 'Eliminar')
    confirm.click()
    await flushPromises()
    expect(api.deleteMenu).toHaveBeenCalledWith(3, 7)
  })

  it('summarises ALL the guests with the contract counts, dishes by count and "Nadie todavía" for an empty course', async () => {
    await setup()
    const summary = wrapper.find('[data-testid=menu-summary]')
    expect(summary.find('[data-testid=summary-ratio]').text()).toBe('4 de 6')
    expect(summary.text()).toContain('invitados ya eligieron su menú')
    expect(summary.find('[role=progressbar]').attributes('aria-valuenow')).toBe('67')
    const courses = summary.findAll('[data-testid=summary-course]')
    expect(courses).toHaveLength(3)
    expect(courses[1].findAll('li').map(li => li.text())).toEqual(['Pollo×3', 'Pasta×1'])
    expect(courses[2].text()).toContain('Nadie todavía')
  })

  it('hides the summary (and the counts) when the summary cannot load, the page keeps working', async () => {
    api.loadSummary.mockRejectedValue({ response: { status: 500 } })
    await setup()
    expect(wrapper.find('[data-testid=menu-summary]').exists()).toBe(false)
    expect(wrapper.find('[data-testid=menu-chosen]').exists()).toBe(false)
    expect(wrapper.findAll('[data-testid=guest-row]')).toHaveLength(2)
  })

  it('filter chips show total / pending / responded and the filter resets to page 1 asking for its status', async () => {
    await setup()
    const chips = wrapper.findAll('[data-testid=guest-filter]')
    expect(chips.map(c => c.text().replace(/\s+/g, ' '))).toEqual(['Todos 6', 'Sin elegir 2', 'Ya eligieron 4'])
    const store = useMenusStore()
    store.pageSelected = 3
    api.loadGuestMenu.mockClear()
    api.loadGuestMenu.mockResolvedValue(page([GUESTS[1]], { total: 2 }))
    await chips[1].trigger('click')
    await flushPromises()
    expect(api.loadGuestMenu).toHaveBeenCalledWith({ eventId: 7, page: 1, perPage: 10, status: 'pending' })
    expect(chips[1].attributes('aria-pressed')).toBe('true')
    api.loadGuestMenu.mockClear()
    await chips[0].trigger('click')
    await flushPromises()
    expect(api.loadGuestMenu).toHaveBeenCalledWith({ eventId: 7, page: 1, perPage: 10, status: undefined })
  })

  it('renders each guest with the chosen menu chip or "Sin elegir", and the courses only for who chose', async () => {
    await setup()
    const rows = wrapper.findAll('[data-testid=guest-row]')
    expect(rows).toHaveLength(2)
    expect(rows[0].find('[data-testid=guest-menu]').text()).toBe('Clasico')
    expect(rows[0].findAll('[data-testid=guest-choices] > span').map(c => c.text())).toEqual(['Entradas: Ensalada', 'Platos fuertes: Pollo'])
    expect(rows[0].find('[data-testid=guest-name]').attributes('title')).toBe('ana@x.com')
    expect(rows[1].find('[data-testid=guest-menu-none]').text()).toBe('Sin elegir')
    expect(rows[1].find('[data-testid=guest-choices]').exists()).toBe(false)
  })

  it('says so when a filter has nobody, and keeps the filters to go back', async () => {
    await setup()
    api.loadGuestMenu.mockResolvedValue(page([], { total: 0 }))
    await wrapper.findAll('[data-testid=guest-filter]')[1].trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-testid=guests-filter-empty]').text()).toBe('Todos tus invitados ya eligieron su menú.')
    expect(wrapper.findAll('[data-testid=guest-filter]')).toHaveLength(3)
  })

  it('exports with the catering label', async () => {
    await setup()
    expect(wrapper.text()).toContain('Exportar para el catering')
    expect(wrapper.text()).not.toContain('Exportar a Excel')
  })
})
