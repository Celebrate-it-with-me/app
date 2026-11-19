import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp, nextTick } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import {
  additionalAllowed, additionalIncrease, commitmentProblem, formatPaidOn, unattributedTotal, warningTitles, withResolutions
} from '../utils/padrinos'
import { useCommitmentSave } from '../composables/useCommitmentSave'
import { mockSetCommitments, scenario } from '../services/commitmentsMock'

const api = vi.hoisted(() => ({ list: vi.fn(), setCommitments: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() }))
vi.mock('../services/PadrinosService', () => ({ default: api }))
const budget = vi.hoisted(() => ({ items: vi.fn() }))
vi.mock('@/modules/budget/services/BudgetService', () => ({ default: budget }))

import PadrinosView from '../views/PadrinosView.vue'

const banquet = {
  budgetItemId: 1, itemName: 'Banquete', cost: 5000, paid: 3000, remaining: 2000,
  unattributedPayments: [{ id: 11, amount: 1500, paidOn: '2026-09-12', note: 'Anticipo' }, { id: 12, amount: 1500, paidOn: '2026-10-20', note: null }]
}
const dj = { budgetItemId: 2, itemName: 'DJ', cost: 800, paid: 800, remaining: 0, unattributedPayments: [{ id: 13, amount: 800, paidOn: '2026-08-01', note: 'Total' }] }
const axiosError = (status, data) => ({ response: { status, data } })
const conflict409 = conflicts => axiosError(409, { code: 'commitment_item_paid', message: 'x', conflicts })

describe('commitment helpers', () => {
  it('recognises the two refusals and nothing else', () => {
    expect(commitmentProblem(conflict409([banquet]))).toEqual({ type: 'conflict', conflicts: [banquet] })
    expect(commitmentProblem(axiosError(422, { code: 'commitment_exceeds_remaining', budgetItemId: 1, remaining: '250' }))).toEqual({ type: 'exceeds', budgetItemId: 1, remaining: 250 })
    expect(commitmentProblem(axiosError(422, { code: 'commitment_exceeds_remaining', budgetItemId: 1 }))).toMatchObject({ remaining: 0 })
    expect(commitmentProblem(axiosError(409, { code: 'commitment_item_paid', conflicts: [] }))).toBeNull()
    expect(commitmentProblem(axiosError(409, { code: 'other' }))).toBeNull()
    expect(commitmentProblem(axiosError(500, {}))).toBeNull()
    expect(commitmentProblem(axiosError(422, {}))).toBeNull()
    expect(commitmentProblem(new Error('network'))).toBeNull()
    expect(commitmentProblem(undefined)).toBeNull()
    expect(commitmentProblem({ response: { status: 409 } })).toBeNull()
  })

  it('compares the additional amount with the increase over the previous commitment', () => {
    const wanted = [{ budgetItemId: 1, amount: 2500 }]
    expect(additionalIncrease(banquet, wanted, [])).toBe(2500)
    expect(additionalIncrease(banquet, wanted, [{ budgetItemId: 1, amount: 1000 }])).toBe(1500)
    expect(additionalIncrease(banquet, wanted, [{ budgetItemId: 1, amount: 3000 }])).toBe(0)
    expect(additionalIncrease(banquet, [], [])).toBe(0)
    expect(additionalAllowed(banquet, wanted, [])).toBe(false)
    expect(additionalAllowed(banquet, wanted, [{ budgetItemId: 1, amount: 1000 }])).toBe(true)
    expect(additionalAllowed(dj, [{ budgetItemId: 2, amount: 10 }], [])).toBe(false)
  })

  it('adds the resolution only to the chosen commitments', () => {
    const list = [{ budgetItemId: 1, amount: 5 }, { budgetItemId: 2, amount: 6 }]
    expect(withResolutions(list, { 1: 'additional' })).toEqual([{ budgetItemId: 1, amount: 5, resolution: 'additional' }, { budgetItemId: 2, amount: 6 }])
  })

  it('names the items of a cost warning, ignoring other codes and unknown items', () => {
    const items = [{ id: 1, title: 'Banquete' }, { id: 2, title: 'DJ' }]
    expect(warningTitles([{ code: 'commitments_exceed_cost', budgetItemId: 2 }, { code: 'x', budgetItemId: 1 }, { code: 'commitments_exceed_cost', budgetItemId: 9 }], items)).toEqual(['DJ'])
    expect(warningTitles(undefined, items)).toEqual([])
  })

  it('adds up the family payments and formats the date without moving the day', () => {
    expect(unattributedTotal(banquet)).toBe(3000)
    expect(unattributedTotal({})).toBe(0)
    expect(unattributedTotal({ unattributedPayments: [{ amount: 'x' }] })).toBe(0)
    expect(formatPaidOn('2026-09-12', 'es')).toMatch(/12/)
    expect(formatPaidOn('2026-09-12T00:00:00Z', 'en')).toMatch(/Sep.*12.*2026/)
    expect(formatPaidOn(null)).toBe('')
    expect(formatPaidOn('nope')).toBe('')
  })
})

describe('commitments mock', () => {
  const config = { conflicts: [banquet, dj], warn: [2] }

  it('answers 409 until every conflicting commitment has a resolution', async () => {
    await expect(mockSetCommitments([{ budgetItemId: 1, amount: 100 }, { budgetItemId: 3, amount: 1 }], config)).rejects.toMatchObject({ response: { status: 409, data: { conflicts: [banquet] } } })
    await expect(mockSetCommitments([{ budgetItemId: 1, amount: 100, resolution: 'attribute_payments' }, { budgetItemId: 2, amount: 5 }], config)).rejects.toMatchObject({ response: { status: 409, data: { conflicts: [dj] } } })
  })

  it('answers 422 when "additional" is above what is left, 200 otherwise, with the warnings', async () => {
    await expect(mockSetCommitments([{ budgetItemId: 1, amount: 2500, resolution: 'additional' }], config)).rejects.toMatchObject({ response: { status: 422, data: { code: 'commitment_exceeds_remaining', budgetItemId: 1, remaining: 2000 } } })
    const ok = await mockSetCommitments([{ budgetItemId: 1, amount: 2000, resolution: 'additional' }, { budgetItemId: 2, amount: 1, resolution: 'attribute_payments' }], config)
    expect(ok.warnings).toEqual([{ code: 'commitments_exceed_cost', budgetItemId: 2 }])
    expect((await mockSetCommitments([{ budgetItemId: 9, amount: 1 }], { conflicts: [], warn: [] })).warnings).toEqual([])
  })

  it('reads the scenario from the stored value, defaulting when it is not an object', () => {
    expect(scenario('1').conflicts[0].itemName).toBe('Banquete')
    expect(scenario('{bad').conflicts).toHaveLength(1)
    expect(scenario('{"warn":[4]}')).toMatchObject({ warn: [4] })
    expect(scenario('{"warn":[4]}').conflicts).toHaveLength(1)
    localStorage.setItem('cwm.mockPadrinoCommitments', '{"warn":[7]}')
    expect(scenario().warn).toEqual([7])
    localStorage.clear()
  })
})

describe('useCommitmentSave', () => {
  const wanted = [{ budgetItemId: 1, amount: 100 }, { budgetItemId: 5, amount: 20 }]

  it('saves straight away when there is no conflict and keeps the warnings', async () => {
    const save = vi.fn().mockResolvedValue({ warnings: [{ code: 'commitments_exceed_cost', budgetItemId: 1 }] })
    const flow = useCommitmentSave({ save })
    expect(await flow.submit(wanted)).toBe('saved')
    expect(save).toHaveBeenCalledWith(wanted)
    expect(flow.warnings.value).toHaveLength(1)
    expect(flow.asking.value).toBe(false)
    save.mockResolvedValue(undefined)
    await flow.submit(wanted)
    expect(flow.warnings.value).toEqual([])
  })

  it('asks on 409, retries with the resolution on the conflicting item only, and cancel forgets everything', async () => {
    const save = vi.fn().mockRejectedValueOnce(conflict409([banquet])).mockResolvedValueOnce({ warnings: [] })
    const flow = useCommitmentSave({ save })
    expect(await flow.submit(wanted)).toBe('conflict')
    expect(flow.asking.value).toBe(true)
    expect(flow.conflicts.value).toEqual([banquet])
    expect(await flow.resolve({ 1: 'attribute_payments' })).toBe('saved')
    expect(save).toHaveBeenLastCalledWith([{ budgetItemId: 1, amount: 100, resolution: 'attribute_payments' }, { budgetItemId: 5, amount: 20 }])
    expect(flow.asking.value).toBe(false)

    save.mockReset().mockRejectedValue(conflict409([banquet]))
    await flow.submit(wanted)
    flow.cancel()
    expect(flow.asking.value).toBe(false)
    expect(flow.pending.value).toEqual([])
    expect(save).toHaveBeenCalledTimes(1)
  })

  it('keeps asking on a 422 of the retry, and clears the question on any other failure', async () => {
    const save = vi.fn().mockRejectedValueOnce(conflict409([banquet])).mockRejectedValueOnce(axiosError(422, { code: 'commitment_exceeds_remaining', budgetItemId: 1, remaining: 10 }))
    const flow = useCommitmentSave({ save })
    await flow.submit(wanted)
    expect(await flow.resolve({ 1: 'additional' })).toBe('exceeds')
    expect(flow.asking.value).toBe(true)
    expect(flow.exceeded.value).toEqual({ type: 'exceeds', budgetItemId: 1, remaining: 10 })
    save.mockRejectedValueOnce(conflict409([dj]))
    expect(await flow.resolve({ 1: 'attribute_payments' })).toBe('conflict')
    expect(flow.exceeded.value).toBeNull()
    expect(flow.conflicts.value).toEqual([dj])
    save.mockRejectedValueOnce(new Error('boom'))
    expect(await flow.resolve({ 2: 'additional' })).toBe('failed')
    expect(flow.asking.value).toBe(false)
  })
})

describe('PadrinosView commitments flow', () => {
  let wrapper
  const body = () => document.body
  const ITEMS = [{ id: 1, title: 'Banquete', owed: 5000 }, { id: 2, title: 'DJ', owed: 800 }, { id: 3, title: 'Vals', owed: 300 }]
  const padrino = (commitments = []) => ({ id: 9, name: 'Tío Raúl', status: 'accepted', phone: null, relationship: null, commitments, committed: 0, paid: 0, progress: 'none', publicThanks: false })

  async function setup(commitments = []) {
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useEventsStore().activeEvent = { id: 7, userRole: 'owner', eventName: 'XV' }
    api.list.mockResolvedValue({ data: [padrino(commitments)], totals: { committed: 0, paid: 0, remaining: 0, count: 1 }, currency: 'USD' })
    budget.items.mockResolvedValue(ITEMS)
    wrapper = mount(PadrinosView, { global: { plugins: [i18n, pinia] }, attachTo: document.body })
    await flushPromises()
  }
  const button = label => [...body().querySelectorAll('button')].find(b => b.textContent.trim() === label)
  const click = async el => { el.click(); await flushPromises() }
  const toasts = () => useToast().toasts.map(t => `${t.tone}:${t.title}`)

  async function openAndFill(rows) {
    await click(button('Elegir qué apadrina') ?? button('Cambiar lo que apadrina'))
    for (const [index, amount] of rows) {
      const box = body().querySelectorAll('#commitments-form input[type=checkbox]')[index]
      box.checked = true
      box.dispatchEvent(new Event('change'))
      await nextTick()
      const input = body().querySelectorAll('#commitments-form input[type=number]')
      const field = input[[...body().querySelectorAll('#commitments-form input[type=checkbox]')].filter((b, i) => b.checked && i <= index).length - 1]
      field.value = String(amount)
      field.dispatchEvent(new Event('input'))
      await nextTick()
    }
  }
  const submit = () => click(body().querySelector('button[form=commitments-form]'))
  const radio = (section, value) => body().querySelectorAll('[data-conflict]')[section].querySelector(`[role=radio][value=${value}]`)

  beforeEach(() => {
    setLocale('es')
    Object.values(api).forEach(fn => fn.mockReset())
    useToast().toasts.splice(0)
  })
  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('saves without asking when the API has no objection, and warns about a sum above the cost', async () => {
    await setup()
    api.setCommitments.mockResolvedValue({ data: {}, warnings: [{ code: 'commitments_exceed_cost', budgetItemId: 2 }] })
    await openAndFill([[1, 300]])
    await submit()
    expect(api.setCommitments).toHaveBeenCalledWith(7, 9, [{ budgetItemId: 2, amount: 300 }])
    expect(body().querySelector('[data-conflict]')).toBeNull()
    expect(toasts()).toEqual(expect.arrayContaining(['success:Padrinos actualizados.', expect.stringMatching(/^warning:Con lo que apadrinan los padrinos, “DJ” supera su costo/)]))
  })

  it('shows the paid payments of the item and the three exits; "attribute" retries with that resolution', async () => {
    await setup()
    api.setCommitments.mockRejectedValueOnce(conflict409([banquet])).mockResolvedValueOnce({ data: {}, warnings: [] })
    await openAndFill([[0, 3000]])
    await submit()
    const dialog = body().querySelector('[data-conflict]')
    expect(dialog.textContent).toContain('Banquete')
    expect(dialog.textContent).toContain('Este gasto ya tiene $3,000 pagados por la familia. ¿Lo cubrieron los padrinos?')
    expect(dialog.textContent).toContain('Anticipo')
    expect(dialog.textContent).toContain('Sin nota')
    expect(dialog.textContent).toContain('$1,500')
    expect(dialog.textContent).toContain('conservan su fecha y su monto')
    expect(button('Guardar', 1)).toBeDefined()
    const confirm = [...body().querySelectorAll('button')].filter(b => b.textContent.trim() === 'Guardar').pop()
    expect(confirm.disabled).toBe(true)
    await click(radio(0, 'attribute_payments'))
    expect(confirm.disabled).toBe(false)
    await click(confirm)
    expect(api.setCommitments).toHaveBeenLastCalledWith(7, 9, [{ budgetItemId: 1, amount: 3000, resolution: 'attribute_payments' }])
    expect(body().querySelector('[data-conflict]')).toBeNull()
    expect(toasts()).toContain('success:Padrinos actualizados.')
  })

  it('handles several items: one choice each, additional capped by what is left, disabled with nothing left', async () => {
    await setup()
    api.setCommitments.mockRejectedValueOnce(conflict409([banquet, dj])).mockResolvedValueOnce({ data: {}, warnings: [] })
    await openAndFill([[0, 1500], [1, 800]])
    await submit()
    expect(body().querySelectorAll('[data-conflict]')).toHaveLength(2)
    expect(radio(0, 'additional').disabled).toBe(false)
    expect(radio(1, 'additional').disabled).toBe(true)
    expect(body().querySelectorAll('[data-conflict]')[1].textContent).toContain('ya está pagado por completo')
    await click(radio(0, 'additional'))
    const confirm = [...body().querySelectorAll('button')].filter(b => b.textContent.trim() === 'Guardar').pop()
    expect(confirm.disabled).toBe(true)
    await click(radio(1, 'attribute_payments'))
    await click(confirm)
    expect(api.setCommitments).toHaveBeenLastCalledWith(7, 9, [
      { budgetItemId: 1, amount: 1500, resolution: 'additional' },
      { budgetItemId: 2, amount: 800, resolution: 'attribute_payments' }
    ])
  })

  it('disables "additional" with an explanation when the amount is above what is left, but only for the increase', async () => {
    await setup([{ budgetItemId: 1, amount: 1000 }])
    api.setCommitments.mockRejectedValueOnce(conflict409([banquet]))
    await click(button('Cambiar lo que apadrina'))
    const input = body().querySelector('#commitments-form input[type=number]')
    input.value = '2500'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    await submit()
    expect(radio(0, 'additional').disabled).toBe(false)
    wrapper.unmount()
    document.body.innerHTML = ''
    await setup()
    api.setCommitments.mockRejectedValueOnce(conflict409([banquet]))
    await openAndFill([[0, 4000]])
    await submit()
    expect(radio(0, 'additional').disabled).toBe(true)
    expect(body().querySelector('[data-conflict]').textContent).toContain('aportaría $4,000 más y solo faltan $2,000')
  })

  it('cancel changes nothing: no second request, the form stays with its data', async () => {
    await setup()
    api.setCommitments.mockRejectedValueOnce(conflict409([banquet]))
    await openAndFill([[0, 3000]])
    await submit()
    await click([...body().querySelectorAll('button')].filter(b => b.textContent.trim() === 'Cancelar').pop())
    expect(body().querySelector('[data-conflict]')).toBeNull()
    expect(api.setCommitments).toHaveBeenCalledTimes(1)
    expect(body().querySelector('#commitments-form input[type=number]').value).toBe('3000')
  })

  it('closing the dialog with Escape counts as cancel', async () => {
    await setup()
    api.setCommitments.mockRejectedValueOnce(conflict409([banquet]))
    await openAndFill([[0, 3000]])
    await submit()
    body().querySelector('[data-conflict]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(body().querySelector('[data-conflict]')).toBeNull()
  })

  it('shows a 422 on the item of the dialog and lets the organizer choose again', async () => {
    await setup()
    api.setCommitments
      .mockRejectedValueOnce(conflict409([banquet]))
      .mockRejectedValueOnce(axiosError(422, { code: 'commitment_exceeds_remaining', budgetItemId: 1, remaining: 1200 }))
      .mockResolvedValueOnce({ data: {}, warnings: [] })
    await openAndFill([[0, 1500]])
    await submit()
    await click(radio(0, 'additional'))
    const confirm = [...body().querySelectorAll('button')].filter(b => b.textContent.trim() === 'Guardar').pop()
    await click(confirm)
    const alert = body().querySelector('[data-conflict] [role=alert]')
    expect(alert.textContent).toContain('Solo faltan $1,200 por pagar')
    expect(confirm.disabled).toBe(true)
    await click(radio(0, 'attribute_payments'))
    await click(confirm)
    expect(body().querySelector('[data-conflict]')).toBeNull()
  })

  it('names the item in a toast when a 422 arrives with no dialog open', async () => {
    await setup()
    api.setCommitments.mockRejectedValueOnce(axiosError(422, { code: 'commitment_exceeds_remaining', budgetItemId: 2, remaining: 0 }))
    await openAndFill([[1, 800]])
    await submit()
    expect(toasts().join('|')).toContain('En “DJ” solo faltan $0 por pagar')
    api.setCommitments.mockRejectedValueOnce(axiosError(422, { code: 'commitment_exceeds_remaining', budgetItemId: 99, remaining: 5 }))
    await submit()
    expect(toasts().join('|')).toContain('En “” solo faltan $5')
  })

  it('keeps the old error message for any other failure', async () => {
    await setup()
    api.setCommitments.mockRejectedValueOnce(new Error('boom'))
    await openAndFill([[0, 10]])
    await submit()
    expect(toasts()).toContain('danger:No pudimos guardar los cambios. Inténtalo de nuevo.')
  })

  it('suggests registering a couple as a single padrino', async () => {
    await setup()
    await click([...body().querySelectorAll('button')].find(b => b.textContent.includes('Añadir padrino')))
    expect(body().textContent).toContain('regístralos como un solo padrino')
  })
})
