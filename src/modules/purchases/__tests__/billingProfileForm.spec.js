import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'

const api = vi.hoisted(() => ({ billingProfile: vi.fn(), saveBillingProfile: vi.fn() }))
vi.mock('../services/PurchasesService', () => ({ default: api }))

import BillingProfileForm from '../components/BillingProfileForm.vue'

const PROFILE = { exists: true, accountEmail: 'marisol@cwm.test', name: 'Marisol Quinceañeras', billingEmail: 'cobros@cwm.test', address: null, city: 'Miami', state: 'FL', postalCode: '33131', country: 'US', taxId: null }
const settle = async () => {
  await flushPromises()
  await new Promise(r => setTimeout(r, 30))
  await flushPromises()
}
const toasts = () => useToast().toasts.map(t => `${t.tone}:${t.title}`)

describe('BillingProfileForm', () => {
  let wrapper
  const mountIt = async () => {
    wrapper = mount(BillingProfileForm, { attachTo: document.body, global: { plugins: [i18n] } })
    await flushPromises()
  }
  beforeEach(() => {
    setLocale('es')
    Object.values(api).forEach(fn => fn.mockReset())
    useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
  })
  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('shows the saved profile, keeps "Guardar" off until something changes and saves the edit', async () => {
    api.billingProfile.mockResolvedValue(PROFILE)
    api.saveBillingProfile.mockResolvedValue({ ...PROFILE, name: 'Marisol XV' })
    await mountIt()
    const inputs = wrapper.findAll('input')
    expect(inputs.some(i => i.element.value === 'Marisol Quinceañeras')).toBe(true)
    const submit = wrapper.get('button[type=submit]')
    expect(submit.attributes('disabled')).toBeDefined()
    const nameInput = inputs.find(i => i.element.value === 'Marisol Quinceañeras')
    await nameInput.setValue('Marisol XV')
    await flushPromises()
    expect(wrapper.get('button[type=submit]').attributes('disabled')).toBeUndefined()
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(api.saveBillingProfile).toHaveBeenCalledWith(expect.objectContaining({ name: 'Marisol XV', billingEmail: 'cobros@cwm.test', address: null }))
    expect(toasts()).toContain(`success:${i18n.global.t('billing.saved')}`)
  })

  it('suggests the account email the first time and blocks an empty name', async () => {
    api.billingProfile.mockResolvedValue({ exists: false, accountEmail: 'marisol@cwm.test' })
    await mountIt()
    expect(wrapper.findAll('input').some(i => i.element.value === 'marisol@cwm.test')).toBe(true)
    await wrapper.findAll('input')[1].setValue('')
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(api.saveBillingProfile).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain(i18n.global.t('billing.nameRequired'))
  })

  it('says the profile could not load and retries', async () => {
    api.billingProfile.mockRejectedValueOnce(new Error('500'))
    await mountIt()
    expect(wrapper.get('[role=alert]').text()).toContain(i18n.global.t('billing.loadError'))
    api.billingProfile.mockResolvedValue(PROFILE)
    await wrapper.get('[role=alert] button').trigger('click')
    await flushPromises()
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('puts a server validation error on its field, or a notice when the failure is generic', async () => {
    api.billingProfile.mockResolvedValue(PROFILE)
    await mountIt()
    const edit = async () => {
      await wrapper.findAll('input').find(i => i.element.value === 'cobros@cwm.test' || i.element.value === 'otro@cwm.test').setValue('otro@cwm.test')
      await wrapper.get('form').trigger('submit')
      await settle()
    }
    api.saveBillingProfile.mockRejectedValueOnce({ response: { data: { errors: { taxId: ['bad'] } } } })
    await edit()
    expect(wrapper.text()).toContain(i18n.global.t('billing.taxIdInvalid'))
    api.saveBillingProfile.mockRejectedValueOnce(new Error('500'))
    await edit()
    expect(toasts()).toContain(`danger:${i18n.global.t('billing.saveError')}`)
  })
})
