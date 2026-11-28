import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const roster = vi.hoisted(() => ({ list: vi.fn(), setLocale: vi.fn() }))
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

const phone = () => vi.stubGlobal('matchMedia', query => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} }))
const buttonByLabel = label => body().querySelector(`button[aria-label="${label}"]`)
const sheet = () => body().querySelector('[data-testid="bottom-sheet"]')
const tick = async ms => { await vi.advanceTimersByTimeAsync(ms); await flushPromises() }

describe('Roster on phones: filter tabs', () => {
  it('lays the four tabs out as equal columns, each with a short label and its count', async () => {
    await setup()
    const list = body().querySelector('[role="tablist"]')
    expect(list.className).toContain('grid')
    expect(list.style.gridTemplateColumns).toMatch(/^repeat\(4, minmax\(0/)
    const tabs = [...list.querySelectorAll('[role="tab"]')]
    expect(tabs).toHaveLength(4)
    expect(tabs.map(t => t.querySelector('span.md\\:hidden').textContent)).toEqual(['Todos', 'Confirm.', 'Pend.', 'No van'])
    expect(tabs[1].querySelector('span.hidden').textContent).toBe('Confirmados')
    expect(tabs[1].textContent).toContain('2')
  })

  it('has the short labels in both languages', async () => {
    setLocale('en')
    await setup()
    const labels = [...body().querySelectorAll('[role="tab"] span.md\\:hidden')].map(s => s.textContent)
    expect(labels).toEqual(['All', 'Going', 'Pending', 'Not going'])
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

  it('writes "Enviar invitaciones (n)" on one line in the inline button and the fixed bar, which leaves room for the assistant button', async () => {
    vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} })
    await setup()
    for (const root of [body().querySelector('[data-testid="send-inline"]'), body().querySelector('[data-testid="send-bar"]')]) {
      expect(root.querySelector('button').textContent.trim()).toBe('Enviar invitaciones (3)')
    }
    const cta = body().querySelector('[data-testid="send-bar"] button')
    expect(cta.className).toContain('whitespace-nowrap')
    expect(cta.className).toContain('w-[calc(100%-56px)]')
    expect(body().querySelector('[data-testid="send-bar"]').className).toContain('px-4')
  })

  it('keeps the plain label when everything has been sent', async () => {
    roster.list.mockResolvedValue({ data: [family(1, 'Ana Perez')], meta: { currentPage: 1, lastPage: 1, total: 1 }, counts: { ...counts, delivery: { ...delivery, unsent: 0 } } })
    await setup()
    expect(body().querySelector('[data-testid="send-inline"] button').textContent.trim()).toBe('Enviar invitaciones')
  })
})

describe('Roster on phones: compact list', () => {
  beforeEach(phone)

  it('is one card with a row per guest: name, status and delivery chips, people, and no phone', async () => {
    roster.list.mockResolvedValue({
      data: [family(1, 'Ana Perez', { notes: 'Familiar cercano', companions: [{ id: 9, name: 'Camila Torres', status: 'attending' }] }), family(2, 'Beto Ruiz', { status: 'attending' })],
      meta: { currentPage: 1, lastPage: 1, total: 2 }, counts
    })
    await setup()
    expect(body().querySelector('[data-testid="guest-table"]')).toBeNull()
    const list = body().querySelector('[data-testid="guest-list"]')
    expect(list.className).toContain('rounded-xl')
    expect(list.querySelectorAll(':scope > li')).toHaveLength(2)
    const first = list.querySelector('li')
    expect(first.querySelector('[data-testid="guest-name"]').textContent).toBe('Ana Perez')
    expect(first.textContent).toContain('Pendiente')
    expect(first.querySelector('[data-testid="delivery"]')).not.toBeNull()
    expect(first.textContent).toContain('2 personas')
    expect(first.querySelector('i').textContent).toBe('Familiar cercano')
    expect(first.textContent).not.toContain('+13055550123')
    expect(first.querySelector('select')).toBeNull()
    const companion = first.querySelector('[data-testid="companion-row"]')
    expect(companion.textContent).toContain('Camila Torres')
    expect(companion.textContent).toContain('Asiste')
    expect(companion.querySelector('.h-1\\.5.w-1\\.5')).not.toBeNull()
  })

  it('shows the language chip next to the name only for a language of her own', async () => {
    roster.list.mockResolvedValue({ data: [family(1, 'Ana Perez', { locale: 'en' }), family(2, 'Beto Ruiz', { locale: 'es' }), family(3, 'Cami Mora')], meta: { currentPage: 1, lastPage: 1, total: 3 }, counts })
    await setup()
    const chips = [...body().querySelectorAll('[data-testid="locale-chip"]')]
    expect(chips.map(c => c.textContent.trim())).toEqual(['ENInvitación en inglés', 'ESInvitación en español'])
    expect(chips[0].getAttribute('title')).toBe('Invitación en inglés')
  })

  it('steps the main name down one size at 360px and below', async () => {
    await setup()
    expect(body().querySelector('[data-testid="guest-name"]').className).toContain('max-[360px]:text-sm')
  })
})

describe('Roster on phones: action sheet', () => {
  beforeEach(() => {
    phone()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    roster.setLocale.mockReset()
  })
  const openSheet = async () => {
    buttonByLabel('Acciones para Ana Perez').focus()
    buttonByLabel('Acciones para Ana Perez').click()
    await flushPromises()
  }

  it('opens from the "⋯" button with the guest as title and the actions in order, the language showing its value', async () => {
    await setup()
    expect(sheet()).toBeNull()
    await openSheet()
    expect(sheet().getAttribute('role')).toBe('dialog')
    expect(sheet().querySelector('h2').textContent).toBe('Ana Perez')
    const rows = [...sheet().querySelectorAll('[data-action]')]
    expect(rows.map(r => r.dataset.action)).toEqual(['edit', 'locale', 'send', 'copy', 'confirm', 'remove'])
    expect(rows[1].textContent).toContain('El del evento')
    expect(rows[1].textContent).not.toContain('(Español)')
    expect(rows[5].className).toContain('text-danger-700')
    expect(rows.every(r => r.className.includes('min-h-12'))).toBe(true)
  })

  it('closes with Escape and gives the focus back to the "⋯" button', async () => {
    await setup()
    await openSheet()
    sheet().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await tick(50)
    expect(sheet()).toBeNull()
    expect(document.activeElement).toBe(buttonByLabel('Acciones para Ana Perez'))
  })

  it('"Idioma de la invitación" swaps the sheet for three radio rows with the guest as subtitle and a help line', async () => {
    await setup()
    await openSheet()
    sheet().querySelector('[data-action="locale"]').click()
    await flushPromises()
    expect(sheet().querySelector('[data-testid="bottom-sheet-subtitle"]').textContent).toBe('Ana Perez')
    expect(sheet().querySelector('h2').textContent).toBe('Idioma de la invitación')
    const radios = [...sheet().querySelectorAll('[role="radio"]')]
    expect(radios.map(r => r.textContent.trim())).toEqual(['El del evento (Español)', 'Español', 'Inglés'])
    expect(radios.map(r => r.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false'])
    expect(sheet().textContent).toContain('Se aplica a la invitación de Ana Perez y sus acompañantes.')
  })

  it('choosing English saves with the same call, shows the toast, updates the chip and closes after ~180ms', async () => {
    roster.setLocale.mockResolvedValue({ locale: 'en', effectiveLocale: 'en' })
    await setup()
    await openSheet()
    sheet().querySelector('[data-action="locale"]').click()
    await flushPromises()
    sheet().querySelector('[data-value="en"]').click()
    await flushPromises()
    expect(roster.setLocale).toHaveBeenCalledWith(7, 1, 'en')
    expect(JSON.stringify(useToast().toasts)).toContain('Idioma actualizado')
    expect(body().querySelector('[data-testid="locale-chip"]').textContent).toContain('EN')
    expect(sheet()).not.toBeNull()
    await tick(200)
    expect(sheet()).toBeNull()
  })

  it('choosing what is already selected does not call the API, and the sheet still closes', async () => {
    await setup()
    await openSheet()
    sheet().querySelector('[data-action="locale"]').click()
    await flushPromises()
    sheet().querySelector('[data-value="event"]').click()
    await tick(200)
    expect(roster.setLocale).not.toHaveBeenCalled()
    expect(sheet()).toBeNull()
  })

  it('runs an action (edit) once the sheet has left', async () => {
    await setup()
    await openSheet()
    sheet().querySelector('[data-action="edit"]').click()
    await flushPromises()
    expect(body().textContent).not.toContain('Editar invitado')
    await tick(200)
    expect(body().textContent).toContain('Editar invitado')
  })
})

describe('Roster on phones: filters and actions', () => {
  beforeEach(phone)

  it('shortens the search hint below md and keeps the long accessible name', async () => {
    await setup()
    const input = body().querySelector('input[type="search"]')
    expect(input.placeholder).toBe('Buscar invitado')
    expect(input.getAttribute('aria-label')).toBe('Buscar por nombre, teléfono o correo')
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

  it('puts "Añadir invitado" (growing) and a "⋯" with Importar and Descargar on one row; the other buttons are hidden below md', async () => {
    await setup()
    const add = [...body().querySelectorAll('button')].find(b => b.textContent.trim() === 'Añadir invitado')
    const bar = add.parentElement
    expect(bar.className).toContain('flex-nowrap')
    expect(add.className).toContain('flex-1')
    const more = bar.querySelector('[data-testid="more-actions"]')
    expect(more.getAttribute('aria-label')).toBe('Más acciones')
    expect(more.className).toContain('md:hidden')
    const hidden = [...bar.children].filter(c => c.className.includes('hidden md:block'))
    expect(hidden.map(c => c.textContent.trim())).toEqual(['Importar', 'Descargar'])
  })

  it('opens the "⋯" menu with Importar and Descargar (a submenu)', async () => {
    await setup()
    const more = body().querySelector('[data-testid="more-actions"]')
    more.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await flushPromises()
    const items = [...body().querySelectorAll('[role="menuitem"]')].map(i => i.textContent.trim())
    expect(items).toEqual(['Importar', 'Descargar'])
  })
})

describe('Roster on wide screens: table', () => {
  it('is a table with header, one row group per guest, companions beneath and the same grid everywhere', async () => {
    roster.list.mockResolvedValue({ data: [family(1, 'Ana Perez', { companions: [{ id: 9, name: 'Camila Torres', status: 'pending' }] }), family(2, 'Beto Ruiz')], meta: { currentPage: 1, lastPage: 1, total: 2 }, counts })
    await setup()
    const table = body().querySelector('[role="table"]')
    expect(table.className).toContain('rounded-xl')
    expect(body().querySelector('[data-testid="guest-list"]')).toBeNull()
    expect([...table.querySelectorAll('[role="columnheader"]')].map(c => c.textContent.trim())).toEqual(['Invitado', 'Asistencia', 'Envío', 'Personas', 'Acciones'])
    expect(table.querySelectorAll('[role="rowgroup"]')).toHaveLength(2)
    const grids = [...table.querySelectorAll('[role="row"]')].map(r => r.className.match(/grid-cols-\[[^\]]+\]/)?.[0])
    expect(grids).toHaveLength(4)
    expect(new Set(grids).size).toBe(1)
    expect(grids[0]).toBe('grid-cols-[minmax(0,1fr)_130px_130px_80px_48px]')
    expect(table.querySelectorAll('[role="rowgroup"] [role="row"]')).toHaveLength(3)
  })

  it('has no language select on the rows and puts the three action buttons in the toolbar', async () => {
    await setup()
    expect(body().querySelector('select')).toBeNull()
    const add = [...body().querySelectorAll('button')].find(b => b.textContent.trim() === 'Añadir invitado')
    expect(add.className).toContain('md:flex-none')
    expect([...add.parentElement.children].map(c => c.textContent.trim()).filter(Boolean)).toEqual(['Añadir invitado', 'Importar', 'Descargar'])
  })

  it('gives a viewer the download button alone and no "⋯" actions beyond send and copy', async () => {
    await setup({ role: 'viewer' })
    expect(body().querySelector('[data-testid="more-actions"]')).not.toBeNull()
    expect([...body().querySelectorAll('button')].some(b => b.textContent.trim() === 'Añadir invitado')).toBe(false)
  })
})
