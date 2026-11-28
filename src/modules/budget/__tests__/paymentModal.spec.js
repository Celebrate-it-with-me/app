import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import PaymentModal from '../components/PaymentModal.vue'

// The DJ of Valentina: costs 1,200 and has 400 paid, so 800 is still pending.
const ITEM = { id: 4, title: 'DJ y vals', owed: 1200, paid: 400, remaining: 800, status: 'partial' }
const PAID_PAST = { ...ITEM, paid: 2400, remaining: 0, status: 'paid' }
const $ = id => document.querySelector(`[data-testid=${id}]`)

let w
async function open(props = {}, amount = '800') {
  w = mount(PaymentModal, { props: { open: false, item: ITEM, currency: 'USD', padrinos: [], ...props }, attachTo: document.body, global: { plugins: [i18n] } })
  await w.setProps({ open: true })
  await flushPromises()
  const input = document.querySelector('#budget-payment-form input[type=number]')
  input.value = amount
  input.dispatchEvent(new Event('input'))
  await flushPromises()
}
const submitForm = async () => {
  document.querySelector('#budget-payment-form').dispatchEvent(new Event('submit', { cancelable: true }))
  await flushPromises()
}

describe('PaymentModal: a payment above what is pending', () => {
  beforeEach(() => setLocale('es'))
  afterEach(() => {
    w?.unmount()
    document.body.innerHTML = ''
  })

  it('a payment of exactly the pending amount shows no warning and one Guardar pago button', async () => {
    await open()
    expect($('over-warning')).toBeNull()
    expect($('raise-cost')).toBeNull()
    expect(document.body.textContent).toContain('Guardar pago')
    await submitForm()
    expect(w.emitted('save')[0][1]).toBeNull()
  })

  it('warns "Esto supera lo pendiente por $X" and offers to raise the cost or to record it anyway', async () => {
    await open({}, '1000')
    expect($('over-warning').textContent).toContain('Esto supera lo pendiente por $200')
    expect($('over-warning').textContent).toContain('El gasto cuesta $1,200')
    expect($('over-warning').textContent).toContain('subirlo a $1,400')
    expect($('raise-cost').textContent).toContain('Aumentar el costo del gasto')
    expect($('pay-anyway').textContent).toContain('Registrar igualmente')
  })

  it('"Registrar igualmente" saves the payment as typed, with no cost change and no hard limit', async () => {
    await open({}, '1000')
    await submitForm()
    expect(w.emitted('save')).toHaveLength(1)
    expect(w.emitted('save')[0][0].amount).toBe('1000')
    expect(w.emitted('save')[0][1]).toBeNull()
  })

  it('"Aumentar el costo" saves the payment and says the cost to raise to (what is paid after it)', async () => {
    await open({}, '1000')
    $('raise-cost').click()
    await flushPromises()
    expect(w.emitted('save')[0][1]).toBe(1400)
  })

  it('an expense already paid past its cost warns on any new payment', async () => {
    await open({ item: PAID_PAST }, '100')
    expect($('over-warning').textContent).toContain('Esto supera lo pendiente por $100')
    $('raise-cost').click()
    await flushPromises()
    expect(w.emitted('save')[0][1]).toBe(2500)
  })

  it('editing a payment does not count itself twice', async () => {
    const payment = { id: 9, amount: 400, paidOn: '2027-01-01', note: '', padrinoId: null }
    await open({ payment }, '1200')
    expect($('over-warning')).toBeNull()
    await open({ payment }, '1300')
    expect($('over-warning').textContent).toContain('supera lo pendiente por $100')
  })

  it('does not warn nor save an invalid amount', async () => {
    await open({}, '0')
    expect($('over-warning')).toBeNull()
    await submitForm()
    expect(w.emitted('save')).toBeUndefined()
  })
})
