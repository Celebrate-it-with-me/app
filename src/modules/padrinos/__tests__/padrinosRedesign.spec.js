import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { avatarTone, conflictsOf, initialsOf, paidSelfOf, sponsorLine, sponsorLines, sponsorOverpay } from '../utils/padrinos'

const api = vi.hoisted(() => ({ list: vi.fn(), setCommitments: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() }))
vi.mock('../services/PadrinosService', () => ({ default: api }))
const budget = vi.hoisted(() => ({ items: vi.fn() }))
vi.mock('@/modules/budget/services/BudgetService', () => ({ default: budget }))

import PadrinosView from '../views/PadrinosView.vue'
import PadrinoCard from '../components/PadrinoCard.vue'
import CommitmentsModal from '../components/CommitmentsModal.vue'

const carmen = { id: 1, name: 'Doña Carmen', status: 'accepted', phone: '+1 305 555 0100', relationship: 'Madrina', publicThanks: true, committed: 850, paid: 700, progress: 'partial',
  commitments: [{ budgetItemId: 10, itemTitle: 'Vestido de XV', amount: 700 }, { budgetItemId: 11, itemTitle: 'Recuerdos', amount: 150 }] }
const ITEMS = [
  { id: 10, title: 'Vestido de XV', owed: 1650, paid: 2350, remaining: 0, payments: [{ id: 1, amount: 1650, padrinoId: null }, { id: 2, amount: 700, padrinoId: 1 }], padrinos: [{ padrinoId: 1, name: 'Doña Carmen', committed: 700, paid: 700 }] },
  { id: 11, title: 'Recuerdos', owed: 400, paid: 400, remaining: 0, payments: [{ id: 3, amount: 400, padrinoId: null }], padrinos: [{ padrinoId: 1, name: 'Doña Carmen', committed: 150, paid: 0 }] }
]

describe('sponsor figures', () => {
  it('splits the family payments from the padrino ones and flags a pending amount that no longer fits', () => {
    expect(paidSelfOf(ITEMS[0])).toBe(1650)
    const [dress, favors] = sponsorLines(carmen, ITEMS)
    expect(dress).toMatchObject({ paidSelf: 1650, paidPadrino: 700, pendingPadrino: 0, status: 'paid', conflict: null })
    expect(favors).toMatchObject({ paidSelf: 400, paidPadrino: 0, pendingPadrino: 150, status: 'pending', conflict: { paid: 400, total: 400, pending: 150 } })
    expect(conflictsOf([carmen], ITEMS)).toHaveLength(1)
  })

  it('has no conflict while the item still has room, or when the item is unknown', () => {
    const open = { id: 11, title: 'Recuerdos', owed: 400, paid: 100, payments: [{ amount: 100, padrinoId: null }] }
    expect(sponsorLine(carmen, carmen.commitments[1], [open]).conflict).toBeNull()
    expect(sponsorLine(carmen, carmen.commitments[1], []).conflict).toBeNull()
  })

  it('warns when a family payment plus what padrinos still owe passes the cost (warning b)', () => {
    const item = { owed: 1000, paid: 400, padrinos: [{ name: 'Raúl', committed: 500, paid: 0 }, { name: 'Marta', committed: 300, paid: 300 }] }
    expect(sponsorOverpay(item, 100)).toBeNull()
    expect(sponsorOverpay(item, 550)).toEqual({ names: 'Raúl', pending: 500, excess: 450 })
    expect(sponsorOverpay(item, 700)).toBeNull()
    expect(sponsorOverpay(item, 700, { padrinoId: 4 })).toBeNull()
    expect(sponsorOverpay(item, 100, { editing: { amount: 400 } })).toBeNull()
    expect(sponsorOverpay({ ...item, padrinos: [] }, 700)).toBeNull()
    expect(sponsorOverpay(null, 1)).toBeNull()
  })
})

describe('avatars', () => {
  it('ignores Tío, Tía, Doña and Don, and uses F plus the initial for Familia', () => {
    expect(initialsOf('Tío Raúl')).toBe('R')
    expect(initialsOf('tía Marta')).toBe('M')
    expect(initialsOf('Doña Carmen')).toBe('C')
    expect(initialsOf('Don Pedro Pérez')).toBe('PP')
    expect(initialsOf('Familia Gómez')).toBe('FG')
    expect(initialsOf('Raúl y Marta')).toBe('RM')
    expect(initialsOf('')).toBe('?')
  })

  it('rotates the colors', () => {
    expect(avatarTone(0)).toContain('gold')
    expect(avatarTone(1)).toContain('rose')
    expect(avatarTone(2)).toContain('info')
    expect(avatarTone(3)).toBe(avatarTone(0))
  })
})

describe('PadrinoCard', () => {
  setLocale('es')
  const mountCard = (padrino = carmen, extra = {}) => mount(PadrinoCard, { props: { padrino, items: ITEMS, canEdit: true, ...extra }, global: { plugins: [i18n] } })

  it('shows each sponsored expense with its state and the conflict notice, which asks to review', async () => {
    const w = mountCard()
    const lines = w.findAll('[data-line]')
    expect(lines[0].text()).toContain('Vestido de XV')
    expect(lines[0].text()).toContain('$700')
    expect(lines[0].text()).toContain('Aportado')
    expect(lines[0].find('[data-conflict]').exists()).toBe(false)
    expect(lines[1].text()).toContain('Pendiente')
    const notice = lines[1].find('[data-conflict]')
    expect(notice.text()).toContain('“Recuerdos” ya está pagado en tu Presupuesto ($400 de $400)')
    expect(notice.attributes('id')).toBe('padrino-conflict-1-11')
    await notice.find('button').trigger('click')
    expect(w.emitted('review')[0][0]).toMatchObject({ budgetItemId: 11 })
  })

  it('shows the WhatsApp button only with a phone, as an icon button with its own label', async () => {
    expect(mountCard().find('[data-whatsapp]').attributes('aria-label')).toBe('Escribir por WhatsApp a Doña Carmen')
    await mountCard().find('[data-whatsapp]').trigger('click')
    expect(mountCard({ ...carmen, phone: null }).find('[data-whatsapp]').exists()).toBe(false)
  })

  it('keeps the footer on one row on mobile, hides the avatar under 420 and the visibility note under 768', () => {
    const w = mountCard()
    expect(w.find('.mt-auto').classes()).toEqual(expect.arrayContaining(['flex-nowrap', 'md:flex-wrap']))
    expect(w.find('[data-avatar]').classes()).toEqual(expect.arrayContaining(['hidden', 'min-[420px]:flex']))
    expect(w.find('[data-visibility]').classes()).toEqual(expect.arrayContaining(['hidden', 'md:flex']))
    expect(w.find('[data-visibility]').text()).toBe('Visible en la invitación')
    expect(mountCard({ ...carmen, publicThanks: false }).find('[data-visibility]').text()).toBe('Oculto en la invitación')
  })

  it('offers to choose what they sponsor when there is nothing yet', () => {
    const w = mountCard({ ...carmen, commitments: [], committed: 0, paid: 0, progress: 'none' })
    expect(w.text()).toContain('Elegir qué apadrina')
    expect(w.find('[data-line]').exists()).toBe(false)
  })
})

describe('CommitmentsModal over-payment warning (a)', () => {
  beforeEach(() => setLocale('es'))
  afterEach(() => { document.body.innerHTML = '' })

  it('warns when the family already paid and offers to reduce the contribution', async () => {
    const w = mount(CommitmentsModal, {
      props: { open: false, padrino: { ...carmen, commitments: [] }, items: [{ id: 11, title: 'Recuerdos', owed: 400, payments: [{ amount: 300, padrinoId: null }] }], currency: 'USD' },
      global: { plugins: [i18n] }, attachTo: document.body
    })
    await w.setProps({ open: true })
    await flushPromises()
    expect(document.body.querySelector('[data-over]')).toBeNull()
    const row = document.body.querySelector('input[type=checkbox]')
    row.click()
    await flushPromises()
    // Checking an expense suggests its whole cost: 300 already paid plus 400 is 300 too much.
    expect(document.body.querySelector('[data-over]').textContent).toContain('dejaría $300 pagados de más')
    const input = document.body.querySelector('input[type=number]')
    input.value = '250'
    input.dispatchEvent(new Event('input'))
    await flushPromises()
    const over = document.body.querySelector('[data-over]')
    expect(over.textContent).toContain('Ya pagaste $300 de este gasto. El aporte de Doña Carmen dejaría $150 pagados de más.')
    document.body.querySelector('[data-reduce]').click()
    await flushPromises()
    expect(document.body.querySelector('input[type=number]').value).toBe('100')
    expect(document.body.querySelector('[data-over]')).toBeNull()
    w.unmount()
  })
})

describe('PadrinosView summary', () => {
  let wrapper
  afterEach(() => { wrapper?.unmount(); document.body.innerHTML = ''; vi.restoreAllMocks() })

  async function setup() {
    setLocale('es')
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useEventsStore().activeEvent = { id: 7, userRole: 'owner', eventName: 'XV' }
    api.list.mockResolvedValue({ data: [carmen], totals: { committed: 850, paid: 700, remaining: 150, count: 1 }, currency: 'USD' })
    budget.items.mockResolvedValue(ITEMS)
    const push = vi.fn()
    wrapper = mount(PadrinosView, { global: { plugins: [i18n, pinia], mocks: { $router: { push } } }, attachTo: document.body })
    await flushPromises()
    return push
  }

  it('shows the legend, a conflicts line that scrolls to the first conflict, and a two-column grid only from lg', async () => {
    await setup()
    const legend = document.body.querySelector('[data-legend]')
    expect(legend.textContent).toContain('Aportado')
    expect(legend.textContent).toContain('Por aportar')
    const line = document.body.querySelector('[data-conflicts-line]')
    expect(line.textContent).toContain('1 aporte choca con un gasto ya pagado')
    const target = document.getElementById('padrino-conflict-1-11')
    target.scrollIntoView = vi.fn()
    line.click()
    expect(target.scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: 'center' }))
    const list = document.body.querySelector('ul.mt-6')
    expect(list.className).toContain('lg:grid-cols-[repeat(auto-fill,minmax(420px,1fr))]')
    expect(list.className.split(' ').filter(c => /grid-cols/.test(c)).every(c => c.startsWith('lg:'))).toBe(true)
  })
})
