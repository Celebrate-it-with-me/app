import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))
vi.mock('../services/WhatsappService', () => ({ default: { send } }))
import WhatsappSendModal from '../components/WhatsappSendModal.vue'

let wrapper
const body = () => document.body.textContent
const button = text => [...document.body.querySelectorAll('button')].find(b => b.textContent.includes(text))
const radio = value => document.body.querySelector(`[role="radio"][value="${value}"]`)
const mountModal = (props = {}) => {
  wrapper = mount(WhatsappSendModal, { props: { open: true, eventId: 7, eventName: 'Los XV', ...props }, global: { plugins: [i18n] }, attachTo: document.body })
  return flushPromises()
}
const dry = (queued = 3, skipped = []) => async (_id, b) => {
  if (b.dryRun) return { queued, skipped }
  return { batchId: 'b', queued, skipped }
}

beforeEach(() => {
  setLocale('es')
  send.mockReset()
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('WhatsappSendModal: choosing who', () => {
  it('opens on "selected" when families come preselected, and asks for exactly those', async () => {
    send.mockImplementation(dry(2))
    await mountModal({ selectedIds: [4, 5] })
    expect(send).toHaveBeenCalledWith(7, { template: 'invitation', audience: 'selected', guestIds: [4, 5], dryRun: true })
    expect(body()).toContain('Le llegará a 2 invitados')
  })

  it('does not ask the server when "selected" is empty, and shows zero recipients', async () => {
    send.mockImplementation(dry(9))
    await mountModal()
    send.mockClear()
    radio('selected')?.click()
    await flushPromises()
    expect(send).not.toHaveBeenCalled()
  })

  it('refuses more than 500 selected: warns, never calls the API, and cannot continue', async () => {
    await mountModal({ selectedIds: Array.from({ length: 501 }, (_, i) => i + 1) })
    expect(send).not.toHaveBeenCalled()
    expect(document.body.querySelector('[role="alert"]').textContent).toContain('500 invitados')
    expect(button('Continuar').disabled).toBe(true)
  })

  it('a reminder moves "everybody" to "pending" and previews again', async () => {
    send.mockImplementation(dry(1))
    await mountModal()
    document.body.querySelector('[role="radio"][value="reminder_pending"]').click()
    await flushPromises()
    expect(send).toHaveBeenLastCalledWith(7, { template: 'reminder_pending', audience: 'pending', guestIds: [], dryRun: true })
  })

  it('cannot continue while the preview is under way or when it finds nobody', async () => {
    send.mockImplementation(dry(0))
    await mountModal()
    expect(body()).toContain('Le llegará a 0 invitados')
    expect(button('Continuar').disabled).toBe(true)
  })

  it('cancel closes the dialog', async () => {
    send.mockImplementation(dry(1))
    await mountModal()
    button('Cancelar').click()
    expect(wrapper.emitted('update:open')[0]).toEqual([false])
  })

  it('does nothing without an event, and in manual mode asks nothing from the API', async () => {
    await mountModal({ eventId: null })
    expect(send).not.toHaveBeenCalled()
    wrapper.unmount()
    await mountModal({ manual: true })
    expect(send).not.toHaveBeenCalled()
    expect(body()).toContain('Aún no hay invitados en esta vista')
  })
})

describe('WhatsappSendModal: errors', () => {
  it('shows the error of the preview and offers the upgrade when the module is locked', async () => {
    send.mockRejectedValue({ response: { status: 403, data: { code: 'module_locked' } } })
    await mountModal()
    expect(wrapper.emitted('unlock')).toHaveLength(1)
    expect(document.body.querySelector('[role="alert"]')).toBeTruthy()
  })

  it('shows a different preview error without asking to upgrade', async () => {
    send.mockRejectedValue({ response: { status: 500, data: {} } })
    await mountModal()
    expect(wrapper.emitted('unlock')).toBeUndefined()
    expect(document.body.querySelector('[role="alert"]')).toBeTruthy()
  })

  it('goes back to the form and asks to upgrade when the real send says locked', async () => {
    send.mockImplementation(async (_id, b) => {
      if (b.dryRun) return { queued: 2, skipped: [] }
      throw { response: { status: 403, data: { code: 'module_locked' } } }
    })
    await mountModal()
    button('Continuar').click()
    await flushPromises()
    button('Enviar ahora').click()
    await flushPromises()
    expect(wrapper.emitted('unlock')).toHaveLength(1)
    expect(button('Continuar')).toBeTruthy()
  })

  it('"back" on the confirmation returns to the form without sending', async () => {
    send.mockImplementation(dry(2))
    await mountModal()
    button('Continuar').click()
    await flushPromises()
    button('Volver').click()
    await flushPromises()
    expect(button('Continuar')).toBeTruthy()
    expect(send.mock.calls.filter(c => !c[1].dryRun)).toHaveLength(0)
  })
})

describe('WhatsappSendModal: result', () => {
  const recent = [{ guestId: 3, guestName: 'Luis', reason: 'recently_sent' }, { guestId: 4, guestName: 'Eva', reason: 'recently_sent' }]

  async function reachResult(skipped) {
    send.mockImplementation(dry(2, skipped))
    await mountModal()
    button('Continuar').click()
    await flushPromises()
    button('Enviar ahora').click()
    await flushPromises()
  }

  it('lets the organizer resend to those who got it in the last day, forcing it', async () => {
    await reachResult(recent)
    expect(body()).toContain('Luis, Eva')
    send.mockClear()
    send.mockResolvedValue({ batchId: 'b2', queued: 2, skipped: [] })
    button('Enviar de nuevo').click()
    await flushPromises()
    expect(send).toHaveBeenCalledWith(7, { template: 'invitation', audience: 'selected', guestIds: [3, 4], force: true })
    expect(wrapper.emitted('sent')).toHaveLength(2)
  })

  it('shows the error under the result when the resend fails, and keeps the result', async () => {
    await reachResult(recent)
    send.mockRejectedValue({ response: { status: 429, data: { code: 'whatsapp_daily_limit' } } })
    button('Enviar de nuevo').click()
    await flushPromises()
    expect(body()).toContain('límite diario')
  })

  it('shows no list of omitted people when everyone was queued, and closes from the footer', async () => {
    await reachResult([])
    expect(body()).not.toContain('Enviar de nuevo')
    button('Cerrar').click()
    expect(wrapper.emitted('update:open')[0]).toEqual([false])
  })

  it('opens fresh each time: form, invitation, nothing from the last send', async () => {
    await reachResult([])
    await wrapper.setProps({ open: false })
    send.mockImplementation(dry(5))
    await wrapper.setProps({ open: true })
    await flushPromises()
    expect(button('Continuar')).toBeTruthy()
    expect(body()).toContain('Le llegará a 5 invitados')
  })
})

describe('WhatsappSendModal: manual links (free plan or module off)', () => {
  const families = [
    { id: 1, name: 'Ana', phone: '+13055550123', link: 'https://q.test/i/1' },
    { id: 2, name: 'Beto', phone: null, link: 'https://q.test/i/2' },
    { id: 3, name: 'Cami', phone: '+13055550999', link: null }
  ]

  it('gives a link only to families with both phone and invitation link, and marks the rest', async () => {
    await mountModal({ manual: true, families, eventName: 'Los XV' })
    const links = [...document.body.querySelectorAll('a[href^="https://wa.me/"]')]
    expect(links).toHaveLength(1)
    expect(links[0].getAttribute('href')).toContain('13055550123')
    expect(decodeURIComponent(links[0].getAttribute('href'))).toContain('https://q.test/i/1')
    expect(body()).toContain('Sin teléfono')
    expect(body()).not.toContain('parte del evento completo')
    expect(document.body.querySelector('[role="dialog"]')).toBeTruthy()
  })
})
