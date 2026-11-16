import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n from '@/locales/i18n'
import { clearTemplateReturn, rememberTemplateReturn } from '../utils/templatePicker'

const mocks = vi.hoisted(() => ({ status: vi.fn(), push: vi.fn(), fetchEvent: vi.fn().mockResolvedValue() }))
vi.mock('@/modules/payments/services/PaymentsService', () => ({ default: { status: mocks.status, cancel: vi.fn() } }))
vi.mock('vue-router', () => ({ useRoute: () => ({ params: { id: '5' }, query: { purchase: '9' } }), useRouter: () => ({ push: mocks.push }) }))
vi.mock('@/modules/events/stores/useEventsStore', () => ({ useEventsStore: () => ({ fetchEvent: mocks.fetchEvent }) }))

import UnlockReturnView from '@/modules/payments/views/UnlockReturnView.vue'

const stubs = { UiButton: { props: ['to', 'href'], emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' } }
const text = w => w.text().replace(/\s+/g, ' ')

describe('payment return after choosing a premium template', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'es'
    clearTemplateReturn()
    mocks.push.mockReset()
    mocks.status.mockResolvedValue({ unlocked: true, status: 'paid', purchaseId: 9, invoiceId: null })
  })

  it('sends her back to the selector on the template she wanted', async () => {
    rememberTemplateReturn(5, 12)
    const wrapper = mount(UnlockReturnView, { global: { plugins: [i18n], stubs } })
    await flushPromises()
    expect(text(wrapper)).toContain('Elegir mi plantilla')
    await wrapper.findAll('button').find(b => b.text() === 'Elegir mi plantilla').trigger('click')
    expect(mocks.push).toHaveBeenCalledWith('/dashboard/invitation?template=12')
    expect(sessionStorage.getItem('qv.templateReturn')).toBeNull()
  })

  it('keeps the usual way home when she did not come from a template', async () => {
    const wrapper = mount(UnlockReturnView, { global: { plugins: [i18n], stubs } })
    await flushPromises()
    expect(text(wrapper)).not.toContain('Elegir mi plantilla')
  })
})
