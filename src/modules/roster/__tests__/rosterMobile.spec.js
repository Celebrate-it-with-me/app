import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const roster = vi.hoisted(() => ({ list: vi.fn() }))
vi.mock('../services/RosterService', () => ({ default: roster }))
const wizardService = vi.hoisted(() => ({ audience: vi.fn(), allRecipients: vi.fn(), allRoster: vi.fn() }))
vi.mock('../services/SendWizardService', () => ({ default: wizardService }))
vi.mock('../services/WhatsappService', () => ({ default: { send: vi.fn(), retry: vi.fn() } }))
import RosterView from '../views/RosterView.vue'

const family = (id, name, extra = {}) => ({ id, name, phone: '+13055550123', email: null, status: 'pending', link: `https://q.test/i/xv/${id}`, companions: [], notes: null, locale: null, delivery: { state: 'none' }, ...extra })
const delivery = { unsent: 3, queued: 0, sent: 1, delivered: 2, read: 1, failed: 1, noPhone: 0, shared: 0 }
const counts = { all: 8, attending: 2, notAttending: 1, pending: 5, delivery }
let wrapper
const body = () => document.body

async function setup({ role = 'owner' } = {}) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  useEventsStore().activeEvent = { id: 7, userRole: role, modules: [{ key: 'whatsapp', state: 'active' }], eventName: 'Los XV' }
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)', component: { template: '<div />' } }] })
  await router.push('/')
  wrapper = mount(RosterView, { global: { plugins: [i18n, pinia, router] }, attachTo: document.body })
  await flushPromises()
}

beforeEach(() => {
  setLocale('es')
  roster.list.mockReset()
  wizardService.audience.mockResolvedValue({ event: { published: true }, rsvp: { isOpen: true }, mode: { automatic: false } })
  wizardService.allRecipients.mockResolvedValue([])
  wizardService.allRoster.mockResolvedValue([])
  roster.list.mockResolvedValue({ data: [family(1, 'Ana Perez'), family(2, 'Beto Ruiz')], meta: { currentPage: 1, lastPage: 1, total: 2 }, counts })
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('Roster on phones: filter tabs', () => {
  it('lays the four tabs out as equal columns, each with a short label and its count', async () => {
    await setup()
    const list = body().querySelector('[role="tablist"]')
    expect(list.className).toContain('grid')
    expect(list.style.gridTemplateColumns).toMatch(/^repeat\(4, minmax\(0/)
    const tabs = [...list.querySelectorAll('[role="tab"]')]
    expect(tabs).toHaveLength(4)
    expect(tabs.map(t => t.querySelector('span.md\\:hidden').textContent)).toEqual(['Todos', 'Asisten', 'Pendientes', 'No asisten'])
    expect(tabs[1].querySelector('span.hidden').textContent).toBe('Confirmados')
    expect(tabs[1].textContent).toContain('2')
  })

  it('has the short labels in both languages', async () => {
    setLocale('en')
    await setup()
    const labels = [...body().querySelectorAll('[role="tab"] span.md\\:hidden')].map(s => s.textContent)
    expect(labels).toEqual(['All', 'Going', 'Pending', 'Declined'])
  })
})

describe('Roster on phones: fixed send bar', () => {
  it('shows the fixed bar only while the inline button is out of the viewport', async () => {
    let notify
    vi.stubGlobal('IntersectionObserver', class { constructor(cb) { notify = cb } observe() {} disconnect() {} })
    await setup()
    expect(body().querySelector('[data-testid="send-bar"]')).not.toBeNull()
    notify([{ isIntersecting: true }])
    await flushPromises()
    expect(body().querySelector('[data-testid="send-bar"]')).toBeNull()
    notify([{ isIntersecting: false }])
    await flushPromises()
    expect(body().querySelector('[data-testid="send-bar"]')).not.toBeNull()
  })
})

describe('Roster on phones: send button label', () => {
  it('carries a short "Enviar (n)" label for narrow phones next to the long one, in the inline button and the fixed bar', async () => {
    vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} })
    await setup()
    for (const root of [body().querySelector('[data-testid="send-inline"]'), body().querySelector('[data-testid="send-bar"]')]) {
      const [long, short] = root.querySelectorAll('button span')
      expect(long.textContent).toBe('Enviar invitaciones · 3 sin enviar')
      expect(long.className).toContain('max-[360px]:hidden')
      expect(short.textContent).toBe('Enviar (3)')
      expect(short.className).toContain('min-[361px]:hidden')
    }
  })

  it('keeps the plain label when everything has been sent', async () => {
    roster.list.mockResolvedValue({ data: [family(1, 'Ana Perez')], meta: { currentPage: 1, lastPage: 1, total: 1 }, counts: { ...counts, delivery: { ...delivery, unsent: 0 } } })
    await setup()
    const button = body().querySelector('[data-testid="send-inline"] button')
    expect(button.textContent.trim()).toBe('Enviar invitaciones')
    expect(button.querySelector('span')).toBeNull()
  })
})

describe('Roster on phones: guest card language select', () => {
  it('sits in a full-width foot below the avatar row, not inside the narrow name column', async () => {
    await setup()
    const card = body().querySelector('ul li')
    const foot = card.querySelector('[data-testid="guest-card-foot"]')
    const nameColumn = card.querySelector('h2').closest('.min-w-0')
    expect(foot).not.toBeNull()
    expect(nameColumn.contains(foot)).toBe(false)
    expect(foot.className).toContain('sm:ml-13')
    expect(foot.querySelector('label').textContent).toBe('Idioma de la invitación')
    expect(foot.querySelector('[data-effective]').className).toContain('w-full')
    expect(foot.textContent).toContain('1 persona')
  })
})

describe('Roster on phones: guest card names', () => {
  it('lets a companion name wrap onto two lines and keeps its status badge from shrinking', async () => {
    roster.list.mockResolvedValue({
      data: [family(1, 'Esteban Roldán', { companions: [{ id: 9, name: 'Camila Torres Fernández', status: 'pending' }] })],
      meta: { currentPage: 1, lastPage: 1, total: 1 }, counts
    })
    await setup()
    const name = body().querySelector('[data-testid="companion-name"]')
    expect(name.textContent).toBe('Camila Torres Fernández')
    expect(name.className).not.toContain('truncate')
    expect(name.className).toContain('break-words')
    expect(name.parentElement.className).toContain('items-start')
    expect(name.nextElementSibling.className).toContain('shrink-0')
  })

  it('steps the main name down one size at 360px and below', async () => {
    await setup()
    expect(body().querySelector('ul li h2').className).toContain('max-[360px]:text-base')
  })
})

describe('Roster on phones: filters and actions', () => {
  const phone = () => vi.stubGlobal('matchMedia', query => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} }))

  it('shortens the search hint below md and keeps the long accessible name', async () => {
    phone()
    await setup()
    const input = body().querySelector('input[type="search"]')
    expect(input.placeholder).toBe('Buscar invitado')
    expect(input.getAttribute('aria-label')).toBe('Buscar por nombre, teléfono o correo')
  })

  it('keeps the long search hint from md up', async () => {
    await setup()
    expect(body().querySelector('input[type="search"]').placeholder).toBe('Buscar por nombre, teléfono o correo')
  })

  it('keeps the Envío chips on one row that scrolls without a bar below md', async () => {
    await setup()
    const row = body().querySelector('[data-testid="delivery-chips"]')
    expect(row.className).toContain('no-scrollbar')
    expect(row.className).toContain('overflow-x-auto')
    expect(row.className).not.toMatch(/(^|\s)flex-wrap/)
    expect(row.className).toContain('md:flex-wrap')
    for (const chip of row.querySelectorAll('button')) expect(chip.className).toContain('whitespace-nowrap')
  })

  it('puts "Añadir invitado" on its own row and Importar / Descargar in two equal columns', async () => {
    await setup()
    const bar = [...body().querySelectorAll('button')].find(b => b.textContent.trim() === 'Añadir invitado').parentElement
    expect(bar.className).toContain('grid-cols-2')
    const [add, imp, down] = [...bar.children]
    expect(add.className).toContain('col-span-2')
    expect(add.className).toContain('w-full')
    expect(imp.textContent.trim()).toBe('Importar')
    expect(imp.className).toContain('w-full')
    expect(down.className).toContain('w-full')
  })

  it('gives a viewer the download button alone, spanning the whole row', async () => {
    await setup({ role: 'viewer' })
    const bar = [...body().querySelectorAll('button')].find(b => b.getAttribute('aria-label') === 'Descargar lista')?.parentElement ?? body().querySelector('.grid-cols-2')
    expect(bar.className).toContain('max-md:[&>:only-child]:col-span-2')
    expect(bar.children).toHaveLength(1)
  })
})
