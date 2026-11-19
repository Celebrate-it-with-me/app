import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n from '@/locales/i18n'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))
vi.mock('../services/WhatsappService', () => ({ default: { send } }))
import WhatsappSendModal from '../components/WhatsappSendModal.vue'
import GuestCard from '../components/GuestCard.vue'
import { deliveryOf } from '../utils/delivery'
import { UiDropdown } from '@/ui'

const stubs = { RouterLink: { props: ['to'], template: '<a><slot /></a>' } }
const family = { id: 1, name: 'Ana Perez', phone: '+13055550123', email: null, status: 'pending', link: 'https://quinvite.test/i/xv/ABC', companions: [], notes: null, locale: null }
let wrapper

const mountModal = props => {
  wrapper = mount(WhatsappSendModal, {
    props: { open: true, eventId: 7, eventName: 'Los XV', counts: { all: 10, pending: 4 }, families: [family], ...props },
    global: { plugins: [i18n], stubs },
    attachTo: document.body
  })
  return wrapper
}
const body = () => document.body.textContent
const button = text => [...document.body.querySelectorAll('button')].find(b => b.textContent.includes(text))

beforeEach(() => {
  i18n.global.locale.value = 'es'
  send.mockReset()
})
afterEach(() => wrapper?.unmount())

describe('WhatsappSendModal', () => {
  it('previews the recipients, asks to confirm, then shows what was left out and why', async () => {
    send.mockImplementation(async (id, body) => (body.dryRun ? { queued: 8, skipped: [{ guestId: 3, guestName: 'Luis', reason: 'no_phone' }] } : { batchId: 'b', queued: 8, skipped: [{ guestId: 3, guestName: 'Luis', reason: 'no_phone' }, { guestId: 4, guestName: 'Eva', reason: 'opted_out' }] }))
    const emitted = mountModal()
    await flushPromises()
    expect(send).toHaveBeenCalledWith(7, { template: 'invitation', audience: 'all', guestIds: [], dryRun: true })
    expect(body()).toContain('Le llegará a 8 invitados')
    expect(body()).toContain('1 sin teléfono')
    button('Continuar').click()
    await flushPromises()
    expect(body()).toContain('Vas a enviar «Invitación» a 8 invitados')
    expect(send).toHaveBeenCalledTimes(1)
    button('Enviar ahora').click()
    await flushPromises()
    expect(send).toHaveBeenCalledWith(7, { template: 'invitation', audience: 'all', guestIds: [] })
    expect(body()).toContain('8 mensajes en camino')
    expect(body()).toContain('No tienen teléfono')
    expect(body()).toContain('Luis')
    expect(body()).toContain('Pidieron no recibir más mensajes')
    expect(emitted.emitted('sent')).toHaveLength(1)
  })

  it('shows the contract errors in plain Spanish', async () => {
    send.mockImplementation(async (id, body) => {
      if (body.dryRun) return { queued: 3, skipped: [] }
      throw { response: { status: 409, data: { code: 'whatsapp_unavailable' } } }
    })
    mountModal()
    await flushPromises()
    button('Continuar').click()
    await flushPromises()
    button('Enviar ahora').click()
    await flushPromises()
    expect(body()).toContain('WhatsApp todavía no está conectado')
    expect(button('Continuar')).toBeTruthy()
  })

  it('explains the daily limit when the send answers 429', async () => {
    send.mockImplementation(async (id, body) => {
      if (body.dryRun) return { queued: 3, skipped: [] }
      throw { response: { status: 429, data: { code: 'whatsapp_daily_limit' } } }
    })
    mountModal()
    await flushPromises()
    button('Continuar').click()
    await flushPromises()
    button('Enviar ahora').click()
    await flushPromises()
    expect(body()).toContain('Llegaste al límite diario de mensajes para este evento; podrás seguir mañana.')
    expect(button('Continuar')).toBeTruthy()
  })

  it('shows the quota in the preview and the daily_limit omission in the result', async () => {
    const left = [{ guestId: 8, guestName: 'Eva', reason: 'daily_limit' }, { guestId: 9, guestName: 'Omar', reason: 'daily_limit' }]
    send.mockImplementation(async (id, body) => (body.dryRun ? { queued: 2, skipped: left } : { batchId: 'b', queued: 2, skipped: left }))
    mountModal()
    await flushPromises()
    expect(body()).toContain('Le llegará a 2 invitados')
    expect(body()).toContain('2 quedarían para mañana por el límite diario')
    button('Continuar').click()
    await flushPromises()
    button('Enviar ahora').click()
    await flushPromises()
    expect(body()).toContain('Estos quedaron sin enviar; podrás escribirles mañana')
    expect(body()).toContain('Eva, Omar')
  })

  it('offers only manual wa.me links, and the upgrade, on the free plan', async () => {
    send.mockResolvedValue({ queued: 0, skipped: [] })
    const emitted = mountModal({ locked: true })
    await flushPromises()
    expect(body()).toContain('parte del evento completo')
    expect(button('Enviar ahora')).toBeUndefined()
    const link = document.body.querySelector('a[href^="https://wa.me/"]')
    expect(link.getAttribute('href')).toContain('wa.me/13055550123?text=')
    expect(decodeURIComponent(link.getAttribute('href'))).toContain('https://quinvite.test/i/xv/ABC')
    button('Pasa a premium').click()
    expect(emitted.emitted('unlock')).toHaveLength(1)
  })

  it('reports the preselected guests when there are some', async () => {
    send.mockResolvedValue({ queued: 2, skipped: [] })
    mountModal({ selectedIds: [1, 2] })
    await flushPromises()
    expect(body()).toContain('Los que elegí (2)')
    expect(send.mock.calls[0][1]).toMatchObject({ audience: 'selected', guestIds: [1, 2], dryRun: true })
    expect(body()).toContain('Le llegará a 2 invitados')
  })
})

describe('GuestCard delivery state', () => {
  const card = props => mount(GuestCard, { props: { family, canEdit: true, ...props }, global: { plugins: [i18n], stubs } })
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
    expect(items[0].label).toBe('Enviar invitación')
    items[0].onSelect()
    expect(wrapper.emitted('send')[0][0]).toEqual(family)
  })
})
