import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n from '@/locales/i18n'

import GuestRow from '../components/GuestRow.vue'
import { deliveryOf } from '../utils/delivery'
import { UiDropdown } from '@/ui'

const stubs = { RouterLink: { props: ['to'], template: '<a><slot /></a>' } }
const family = { id: 1, name: 'Ana Perez', phone: '+13055550123', email: null, status: 'pending', link: 'https://quinvite.test/i/xv/ABC', companions: [], notes: null, locale: null }

beforeEach(() => {
  i18n.global.locale.value = 'es'
})

describe('GuestRow delivery state', () => {
  const card = props => mount(GuestRow, { props: { family, canEdit: true, ...props }, global: { plugins: [i18n], stubs } })
  const view = (delivery, phone = family.phone, whatsappOptedOut = false) => deliveryOf({ ...family, phone, whatsappOptedOut, delivery: { state: 'none', ...delivery } })

  it('says nothing when the roster did not report delivery', () => {
    expect(card({ delivery: null }).find('[data-testid="delivery"]').exists()).toBe(false)
  })

  it('writes the state as text, not only colour', () => {
    expect(card({ delivery: view({ state: 'none' }) }).text()).toContain('Sin enviar')
    expect(card({ delivery: view({ state: 'manual' }) }).text()).toContain('Abierto')
    expect(card({ delivery: view({ state: 'delivered' }) }).text()).toContain('Entregado')
    expect(card({ delivery: view({ state: 'none' }, null) }).text()).toContain('Sin teléfono')
    expect(card({ delivery: view({ state: 'sent' }, family.phone, true) }).text()).toContain('No quiere mensajes')
  })

  it('offers to add the missing phone', async () => {
    const wrapper = card({ delivery: view({ state: 'none' }, null) })
    await wrapper.findAll('button').find(b => b.text() === 'Añadir teléfono').trigger('click')
    expect(wrapper.emitted('edit')[0][0]).toEqual(family)
    expect(card({ canEdit: false, delivery: view({ state: 'none' }, null) }).text()).not.toContain('Añadir teléfono')
  })

  it('offers a retry for failed messages', async () => {
    const wrapper = card({ delivery: view({ state: 'failed', lastMessageId: 9, errorMessage: 'Número no registrado en WhatsApp' }) })
    expect(wrapper.text()).toContain('Número no registrado en WhatsApp')
    await wrapper.findAll('button').find(b => b.text() === 'Reintentar').trigger('click')
    expect(wrapper.emitted('retry')[0][0]).toEqual({ id: 9, status: 'failed', errorCode: null, errorMessage: 'Número no registrado en WhatsApp' })
  })

  it('explains an unknown delivery and still lets the organizer retry', async () => {
    const wrapper = card({ delivery: view({ state: 'failed', lastMessageId: 9, errorCode: 'unknown_delivery', errorMessage: 'Timeout' }) })
    expect(wrapper.text()).toContain('No sabemos si este mensaje llegó; revisa con tu invitado antes de reintentar.')
    expect(wrapper.text()).not.toContain('Timeout')
    await wrapper.findAll('button').find(b => b.text() === 'Reintentar').trigger('click')
    expect(wrapper.emitted('retry')[0][0].errorCode).toBe('unknown_delivery')
  })

  it('shows the generic help for a failure without a reason, and no retry for viewers', () => {
    const wrapper = card({ canEdit: false, delivery: view({ state: 'failed', lastMessageId: 9 }) })
    expect(wrapper.text()).toContain('El mensaje no llegó.')
    expect(wrapper.findAll('button').some(b => b.text() === 'Reintentar')).toBe(false)
  })

  it('has no selection checkbox any more, and its menu sends the invitation to the family', () => {
    const wrapper = card({})
    expect(wrapper.find('[role="checkbox"]').exists()).toBe(false)
    const items = wrapper.findComponent(UiDropdown).props('items')
    const send = items.find(i => i.label === 'Enviar invitación')
    send.onSelect()
    expect(wrapper.emitted('send')[0][0]).toEqual(family)
  })
})
