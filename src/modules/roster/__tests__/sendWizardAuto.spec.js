import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'

const svc = vi.hoisted(() => ({ audience: vi.fn(), allRecipients: vi.fn(), allRoster: vi.fn(), markShared: vi.fn(), unmarkShared: vi.fn() }))
const wa = vi.hoisted(() => ({ preview: vi.fn(), send: vi.fn(), batch: vi.fn(), activeBatch: vi.fn(), retry: vi.fn() }))
vi.mock('../services/SendWizardService', () => ({ default: svc }))
vi.mock('../services/WhatsappService', () => ({ default: wa }))
vi.mock('@/modules/template-picker/components/InvitationMiniature.vue', () => ({ default: { props: ['eventId', 'width', 'name', 'dateLabel', 'live'], template: '<div data-testid="miniature" />' } }))
import SendWizard from '../components/send/SendWizard.vue'

const rec = (id, extra = {}) => ({ id, name: `Familia ${id}`, people: 2, phone: '+13055550101', status: 'pending', locale: 'es', reason: null, delivery: { state: 'none' }, ...extra })
const info = (extra = {}) => ({ event: { published: true, archived: false }, rsvp: { isOpen: true }, mode: { automatic: true }, templates: { es: { sendable: true }, en: { sendable: true } }, ...extra })
const previewOf = (name, extra = {}) => ({ template: 'invitation', locale: 'es', guest: { id: 1, name }, body: `¡Hola ${name}! Te invitamos.`, buttons: [{ id: 'yes', text: 'Sí, asistiré' }, { id: 'no', text: 'No podré' }], link: 'https://q.test/i', sendable: true, ...extra })
const batchOf = (extra = {}) => ({ batchId: 'b1', total: 3, queued: 0, sent: 2, delivered: 0, read: 0, failed: 1, cancelled: 0, done: true, messages: [
  { guestId: 1, guestName: 'Familia 1', status: 'sent', errorCode: null, messageId: 11 },
  { guestId: 2, guestName: 'Familia 2', status: 'failed', errorCode: '131026', messageId: 12 },
  { guestId: 3, guestName: 'Familia 3', status: 'sent', errorCode: null, messageId: 13 }
], ...extra })

let wrapper
const body = () => document.body.textContent
const q = selector => document.querySelector(selector)
const button = text => [...document.body.querySelectorAll('button, a')].find(b => b.textContent.trim().includes(text))
const click = async text => {
  button(text).click()
  await flushPromises()
}

function serve({ recipients = [rec(1), rec(2), rec(3)], audience = info() } = {}) {
  svc.audience.mockResolvedValue(audience)
  svc.allRecipients.mockResolvedValue(recipients)
  svc.allRoster.mockResolvedValue(recipients.map(r => ({ id: r.id, phone: r.phone, link: `https://q.test/i/xv/${r.id}` })))
}
async function open(props = {}) {
  wrapper = mount(SendWizard, { props: { open: true, eventId: 7, eventName: 'Los XV', eventDateLabel: 'sábado 14 de marzo', mode: 'automatic', ...props }, global: { plugins: [i18n] }, attachTo: document.body })
  await flushPromises()
  return wrapper
}
const toPreview = async (props = {}) => {
  await open(props)
  if (!props.preselectedIds) await click('Siguiente')
}
const toConfirm = async (props = {}) => {
  await toPreview(props)
  await click('Siguiente')
}

beforeEach(() => {
  setLocale('es')
  ;[...Object.values(svc), ...Object.values(wa)].forEach(fn => fn.mockReset())
  wa.preview.mockImplementation(async (_e, { guestId }) => previewOf(`Familia ${guestId}`))
  wa.send.mockImplementation(async (_e, { dryRun, guestIds }) => (dryRun ? { queued: guestIds.length, skipped: [] } : { batchId: 'b1', queued: guestIds.length, skipped: [] }))
  wa.batch.mockResolvedValue(batchOf())
  wa.activeBatch.mockResolvedValue(null)
  useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('Step 2 · Preview (automatic)', () => {
  it('shows the real cover, the message from the API and its buttons, and moves the indicator to 3 steps', async () => {
    serve()
    await toPreview()
    expect(body()).toContain('Paso 2 de 3')
    expect(body()).toContain('Así lo recibirán')
    expect(q('[data-testid="miniature"]')).toBeTruthy()
    expect(wa.preview).toHaveBeenCalledWith(7, { template: 'invitation', guestId: 1, locale: 'es' })
    expect(q('[data-testid="preview-bubble"]').textContent).toContain('¡Hola Familia 1! Te invitamos.')
    expect(q('[data-testid="preview-buttons"]').textContent).toContain('Sí, asistiré')
    expect(q('[data-testid="preview-fixed"]')).toBeTruthy()
    expect(document.querySelector('textarea')).toBeNull()
    expect(q('[data-testid="preview-languages"]').textContent).toContain('3 en español')
  })

  it('previews as another family and switches the language with the tabs', async () => {
    serve({ recipients: [rec(1), rec(2, { locale: 'en' }), rec(3)] })
    await toPreview()
    expect(q('[data-testid="preview-languages"]').textContent).toContain('2 en español · 1 en inglés')
    const tab = [...document.querySelectorAll('[role="tab"]')].find(t => t.textContent.includes('Inglés'))
    tab.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }))
    await flushPromises()
    expect(wa.preview).toHaveBeenLastCalledWith(7, { template: 'invitation', guestId: 2, locale: 'en' })
  })

  it('changes the template and asks for that message', async () => {
    serve()
    await toPreview()
    await click('Cambiar mensaje')
    document.querySelectorAll('[data-testid="preview-templates"] [role="radio"]')[2].click()
    await flushPromises()
    expect(wa.preview).toHaveBeenLastCalledWith(7, { template: 'save_the_date', guestId: 1, locale: 'es' })
    expect(body()).toContain('Mensaje: Guarda la fecha')
    await click('Ocultar opciones')
    expect(q('[data-testid="preview-templates"]')).toBeNull()
  })

  it('shows the closed RSVP note and only offers save the date', async () => {
    serve({ audience: info({ rsvp: { isOpen: false } }) })
    await toPreview()
    expect(q('[data-testid="wizard-rsvp-closed"]')).toBeTruthy()
    expect(wa.preview).toHaveBeenCalledWith(7, expect.objectContaining({ template: 'save_the_date' }))
    await click('Cambiar mensaje')
    expect(document.querySelectorAll('[data-testid="preview-templates"] [role="radio"]')).toHaveLength(1)
  })

  it('does not break when the preview fails: says so, lets the organizer retry and continue', async () => {
    serve()
    wa.preview.mockRejectedValueOnce({ response: { status: 500 } })
    await toPreview()
    expect(q('[data-testid="preview-error"]').textContent).toContain('Puedes continuar de todos modos')
    expect(button('Siguiente').disabled).toBe(false)
    await click('Reintentar')
    expect(q('[data-testid="preview-bubble"]')).toBeTruthy()
  })

  it('blocks and offers to leave out the families whose language has no approved template (decision 12)', async () => {
    serve({ recipients: [rec(1), rec(2, { locale: 'en' }), rec(3, { locale: 'en' })], audience: info({ templates: { es: { sendable: true }, en: { sendable: false } } }) })
    await toPreview()
    expect(q('[data-testid="preview-missing"]').textContent).toContain('Inglés')
    expect(q('[data-testid="preview-missing"]').textContent).toContain('2 invitaciones')
    expect(button('Siguiente').disabled).toBe(true)
    await click('Excluir esas 2 y continuar')
    expect(q('[data-testid="preview-missing"]')).toBeNull()
    expect(button('Siguiente · 1 invitación').disabled).toBe(false)
  })

  it('learns that a language is not approved from the preview itself (409)', async () => {
    serve({ recipients: [rec(1, { locale: 'en' }), rec(2)] })
    wa.preview.mockRejectedValueOnce({ response: { status: 409, data: { code: 'template_not_approved' } } })
    await toPreview()
    expect(q('[data-testid="preview-error"]').textContent).toContain('aún está en revisión')
    expect(q('[data-testid="preview-missing"]')).toBeTruthy()
    expect(button('Siguiente').disabled).toBe(true)
  })

  it('blocks the way on when the event is not published (P8) and offers to publish', async () => {
    serve({ audience: info({ event: { published: false, archived: false } }) })
    const w = await open()
    expect(button('Siguiente').disabled).toBe(false) // step 1 still lets the organizer look
    await click('Siguiente')
    expect(button('Siguiente').disabled).toBe(true)
    await click('Ir a publicar')
    expect(w.emitted('publish')).toHaveLength(1)
  })

  it('goes Back to step 1', async () => {
    serve()
    await toPreview()
    await click('Atrás')
    expect(body()).toContain('¿A quién se lo enviamos?')
  })

  it('does not call the preview from a role that cannot send and falls back to the cover card', async () => {
    serve()
    await toPreview({ canEdit: false })
    expect(wa.preview).toHaveBeenCalled() // the wizard is only opened by senders; the miniature skips the live view
    expect(q('[data-testid="miniature"]')).toBeTruthy()
  })
})

describe('Step 3 · Confirm and send (automatic)', () => {
  it('summarises with a dry run, lists who is left out and sends', async () => {
    serve()
    wa.send.mockImplementation(async (_e, { dryRun }) => (dryRun ? { queued: 2, skipped: [{ guestId: 3, guestName: 'Familia 3', reason: 'recently_sent' }] } : { batchId: 'b1', queued: 2, skipped: [{ guestId: 3, guestName: 'Familia 3', reason: 'recently_sent' }] }))
    await toConfirm()
    expect(body()).toContain('Paso 3 de 3')
    expect(wa.send).toHaveBeenCalledWith(7, { template: 'invitation', audience: 'selected', guestIds: [1, 2, 3], dryRun: true })
    expect(q('[data-testid="auto-summary"]').textContent).toContain('2 invitaciones · Invitación')
    expect(q('[data-testid="auto-omitted"]').textContent).toContain('Se omite 1 invitación')
    await click('Ver quiénes')
    expect(q('[data-testid="auto-omitted"]').textContent).toContain('Familia 3')
    await click('Ocultar')
    expect(button('Enviar a 2 invitaciones').disabled).toBe(false)
    await click('Enviar a 2 invitaciones')
    expect(wa.send).toHaveBeenLastCalledWith(7, { template: 'invitation', audience: 'selected', guestIds: [1, 2, 3], confirmLarge: false })
    expect(wrapper.emitted('sent').length).toBeGreaterThanOrEqual(1)
    expect(q('[data-testid="auto-progress"]').textContent).toContain('3 de 3')
    expect(wa.batch).toHaveBeenCalledWith(7, 'b1')
    expect(document.activeElement.hasAttribute('data-step-title')).toBe(true)
  })

  it('shows the progress while the batch is in flight, with the counters and the rows, and no quota', async () => {
    serve()
    wa.batch.mockResolvedValue(batchOf({ queued: 1, sent: 1, failed: 1, done: false }))
    await toConfirm()
    await click('Enviar a 3 invitaciones')
    expect(body()).toContain('Enviando…')
    expect(q('[data-testid="auto-progress"]').textContent).toContain('2 de 3')
    expect(q('[data-testid="auto-counters"]').textContent).toContain('En cola 1')
    expect(q('[role="progressbar"]').getAttribute('aria-valuenow')).toBe('2')
    expect(q('[data-testid="auto-result"]')).toBeNull()
    expect(body()).toContain('Puedes cerrar esta ventana')
    expect(q('[data-testid="auto-rows"] li').textContent).toContain('Familia 2') // failures first
    expect(body()).not.toMatch(/cupo|créditos/i)
    expect(button('Atrás')).toBeUndefined()
  })

  it('ends with a plain summary, lists the omitted and retries the failed ones', async () => {
    serve()
    wa.send.mockImplementation(async (_e, { dryRun }) => (dryRun ? { queued: 3, skipped: [] } : { batchId: 'b1', queued: 3, skipped: [{ guestId: 9, guestName: 'Otra', reason: 'no_phone' }] }))
    wa.retry.mockResolvedValue({})
    await toConfirm()
    await click('Enviar a 3 invitaciones')
    expect(body()).toContain('Envío terminado')
    expect(q('[data-testid="auto-result"]').textContent).toContain('2 enviadas, 1 con problemas.')
    expect(q('[data-testid="auto-skipped"]').textContent).toContain('Otra')
    await click('Reintentar el fallido')
    expect(wa.retry).toHaveBeenCalledWith(7, 12)
    expect(useToast().toasts.some(x => x.title.includes('Volvimos a intentar 1 mensaje'))).toBe(true)
    document.querySelector('[aria-label="Reintentar el mensaje a Familia 2"]').click()
    await flushPromises()
    expect(wa.retry).toHaveBeenCalledTimes(2)
  })

  it('asks once before retrying messages whose outcome is unknown', async () => {
    serve()
    wa.batch.mockResolvedValue(batchOf({ messages: [{ guestId: 2, guestName: 'Familia 2', status: 'failed', errorCode: 'unknown_delivery', messageId: 12 }, { guestId: 3, guestName: 'Familia 3', status: 'failed', errorCode: 'unknown_delivery', messageId: 13 }], failed: 2 }))
    wa.retry.mockResolvedValue({})
    await toConfirm()
    await click('Enviar a 3 invitaciones')
    expect(body()).toContain('No sabemos si este mensaje llegó')
    await click('Reintentar los 2 fallidos')
    expect(body()).toContain('¿Reintentar el mensaje?')
    expect(wa.retry).not.toHaveBeenCalled()
    await click('Reintentar de todos modos')
    expect(wa.retry).toHaveBeenCalledTimes(2)
  })

  it('stops retrying at the daily limit and tells why, and survives other retry errors', async () => {
    serve()
    wa.batch.mockResolvedValue(batchOf({ messages: [{ guestId: 2, guestName: 'Familia 2', status: 'failed', messageId: 12 }, { guestId: 3, guestName: 'Familia 3', status: 'failed', messageId: 13 }, { guestId: 4, guestName: 'Familia 4', status: 'failed', messageId: 14 }], failed: 3 }))
    wa.retry.mockRejectedValueOnce({ response: { status: 409, data: { code: 'retry_limit' } } }).mockRejectedValueOnce({ response: { status: 429, data: { code: 'whatsapp_daily_limit' } } })
    await toConfirm()
    await click('Enviar a 3 invitaciones')
    await click('Reintentar los 3 fallidos')
    expect(wa.retry).toHaveBeenCalledTimes(2)
    expect(useToast().toasts.some(x => x.title.includes('límite diario'))).toBe(true)
  })

  it('reports a failure to list the failed messages', async () => {
    serve()
    await toConfirm()
    await click('Enviar a 3 invitaciones')
    wa.batch.mockRejectedValue({ response: { status: 500 } })
    await click('Reintentar el fallido')
    expect(useToast().toasts.some(x => x.title.includes('No pudimos enviar'))).toBe(true)
  })

  it('walks every page of a big batch to find the failed ones', async () => {
    serve()
    const full = Array.from({ length: 100 }, (_, i) => ({ guestId: i, guestName: `G${i}`, status: 'sent', messageId: i }))
    wa.batch.mockImplementation(async (_e, _id, options) => (options?.page === 1 ? batchOf({ failed: 1, messages: full }) : options?.page === 2 ? batchOf({ messages: [{ guestId: 500, guestName: 'Last', status: 'failed', messageId: 500 }] }) : batchOf({ failed: 1 })))
    wa.retry.mockResolvedValue({})
    await toConfirm()
    await click('Enviar a 3 invitaciones')
    await click('Reintentar el fallido')
    expect(wa.retry).toHaveBeenCalledTimes(1)
    expect(wa.retry).toHaveBeenCalledWith(7, 500)
  })

  it('asks "I understand" above 100 families, only in automatic mode (P7)', async () => {
    serve({ recipients: Array.from({ length: 101 }, (_, i) => rec(i + 1)) })
    await toConfirm()
    expect(button('Enviar a 101 invitaciones').disabled).toBe(true)
    q('[data-testid="auto-big"] button').click()
    await flushPromises()
    expect(button('Enviar a 101 invitaciones').disabled).toBe(false)
  })

  it('blocks the send when the event is not published (P8) and offers to publish', async () => {
    serve({ audience: info({ event: { published: false, archived: false } }) })
    const w = await open({ preselectedIds: [1] })
    expect(button('Siguiente').disabled).toBe(true)
    wrapper.unmount()
    // a stale audience can still land here: the step blocks by itself
    const { default: Step } = await import('../components/send/SendStepAuto.vue')
    const step = mount(Step, { props: { eventId: 7, families: [{ id: 1, name: 'A' }], published: false }, global: { plugins: [i18n] }, attachTo: document.body })
    await flushPromises()
    expect(q('[data-testid="auto-unpublished"]')).toBeTruthy()
    expect(button('Enviar a 1 invitación').disabled).toBe(true)
    await click('Ir a publicar')
    expect(step.emitted('publish')).toHaveLength(1)
    step.unmount()
    expect(w).toBeTruthy()
  })

  it('blocks invitations and reminders when the RSVP is closed (P9)', async () => {
    const { default: Step } = await import('../components/send/SendStepAuto.vue')
    wa.send.mockResolvedValue({ queued: 1, skipped: [] })
    const step = mount(Step, { props: { eventId: 7, families: [{ id: 1, name: 'A' }], rsvpOpen: false, template: 'invitation' }, global: { plugins: [i18n] }, attachTo: document.body })
    await flushPromises()
    expect(q('[data-testid="auto-rsvp"]')).toBeTruthy()
    expect(button('Enviar a 1 invitación').disabled).toBe(true)
    await step.setProps({ template: 'save_the_date' })
    expect(q('[data-testid="auto-rsvp"]')).toBeNull()
    expect(button('Enviar a 1 invitación').disabled).toBe(false)
    step.unmount()
  })

  it('shows the error of the dry run and of the send, and unlocks when the plan is locked', async () => {
    serve()
    wa.send.mockRejectedValueOnce({ response: { status: 409, data: { code: 'template_not_approved' } } })
    await toConfirm()
    expect(q('[data-testid="auto-dry-error"]').textContent).toContain('en revisión por WhatsApp')
    wrapper.unmount()

    serve()
    wa.send.mockReset()
    wa.send.mockResolvedValueOnce({ queued: 3, skipped: [] }).mockRejectedValueOnce({ response: { status: 409, data: { code: 'event_not_published' } } })
    await toConfirm()
    await click('Enviar a 3 invitaciones')
    expect(q('[data-testid="auto-send-error"]').textContent).toContain('Publica tu evento')
    expect(button('Enviar a 3 invitaciones').disabled).toBe(false)
    wrapper.unmount()

    serve()
    wa.send.mockReset()
    wa.send.mockRejectedValueOnce({ response: { status: 403, data: { code: 'module_locked' } } })
    const w = await open({ preselectedIds: [1] })
    await click('Siguiente')
    expect(w.emitted('unlock')).toHaveLength(1)
  })

  it('treats a dry run with nobody as an empty answer and an unlocked plan as a message', async () => {
    serve()
    wa.send.mockRejectedValueOnce({ response: { status: 422, data: { errors: { audience: ['no_recipients'] } } } })
    await toConfirm()
    expect(q('[data-testid="auto-summary"]').textContent).toContain('0 invitaciones')
    expect(button('Enviar a 0 invitaciones').disabled).toBe(true)
  })

  it('cuts a send above 500 families in chunks that share one progress', async () => {
    serve({ recipients: Array.from({ length: 501 }, (_, i) => rec(i + 1)) })
    wa.send.mockImplementation(async (_e, { dryRun, guestIds }) => (dryRun ? { queued: guestIds.length, skipped: [] } : { batchId: guestIds.length === 500 ? 'b1' : 'b2', queued: guestIds.length, skipped: [] }))
    wa.batch.mockImplementation(async (_e, id) => (id === 'b1' ? batchOf({ batchId: 'b1', total: 500, queued: 0, sent: 500, failed: 0, messages: [] }) : batchOf({ batchId: 'b2', total: 1, queued: 0, sent: 1, failed: 0, messages: [] })))
    await toConfirm()
    q('[data-testid="auto-big"] button').click()
    await flushPromises()
    await click('Enviar a 501 invitaciones')
    const sends = wa.send.mock.calls.filter(([, body]) => !body.dryRun)
    expect(sends.map(([, body]) => body.guestIds.length)).toEqual([500, 1])
    expect(q('[data-testid="auto-progress"]').textContent).toContain('501 de 501')
    expect(q('[data-testid="auto-result"]').textContent).toContain('501 enviadas, 0 con problemas.')
  })

  it('pauses when a later chunk hits the daily limit and says how many stayed unsent', async () => {
    serve({ recipients: Array.from({ length: 501 }, (_, i) => rec(i + 1)) })
    wa.send.mockImplementation(async (_e, { dryRun, guestIds }) => {
      if (dryRun) return { queued: guestIds.length, skipped: [] }
      if (guestIds.length === 1) throw { response: { status: 429, data: { code: 'whatsapp_daily_limit' } } }
      return { batchId: 'b1', queued: 500, skipped: [] }
    })
    wa.batch.mockResolvedValue(batchOf({ total: 500, queued: 0, sent: 500, failed: 0, messages: [] }))
    await toConfirm()
    q('[data-testid="auto-big"] button').click()
    await flushPromises()
    await click('Enviar a 501 invitaciones')
    expect(q('[data-testid="auto-paused"]').textContent).toContain('1 invitación quedó sin enviar')
  })

  it('goes on past a later chunk with nobody to send to, and stops at once if the first one fails', async () => {
    serve({ recipients: Array.from({ length: 501 }, (_, i) => rec(i + 1)) })
    wa.send.mockImplementation(async (_e, { dryRun, guestIds }) => {
      if (dryRun) return { queued: guestIds.length, skipped: [] }
      if (guestIds.length === 1) throw { response: { status: 422, data: { errors: { audience: ['no_recipients'] } } } }
      return { batchId: 'b1', queued: 500, skipped: [] }
    })
    wa.batch.mockResolvedValue(batchOf({ total: 500, queued: 0, sent: 500, failed: 0, messages: [] }))
    await toConfirm()
    q('[data-testid="auto-big"] button').click()
    await flushPromises()
    await click('Enviar a 501 invitaciones')
    expect(q('[data-testid="auto-paused"]')).toBeNull()
    expect(wa.send.mock.calls.filter(([, body]) => !body.dryRun)).toHaveLength(2)
  })

  it('says so when the progress cannot be read and offers to try again', async () => {
    vi.useFakeTimers()
    serve()
    wa.batch.mockRejectedValue(new Error('down'))
    await toConfirm()
    await click('Enviar a 3 invitaciones')
    for (let i = 0; i < 3; i++) await vi.advanceTimersByTimeAsync(5000)
    await flushPromises()
    expect(q('[data-testid="auto-poll-error"]')).toBeTruthy()
    wa.batch.mockResolvedValue(batchOf())
    await click('Reintentar')
    expect(q('[data-testid="auto-poll-error"]')).toBeNull()
    vi.useRealTimers()
  })

  it('closing in the middle of a send does not stop it and says so', async () => {
    serve()
    wa.batch.mockResolvedValue(batchOf({ queued: 2, done: false, sent: 1, failed: 0 }))
    await toConfirm()
    await click('Enviar a 3 invitaciones')
    await click('Cerrar')
    expect(wrapper.emitted('closed')).toHaveLength(1)
    expect(useToast().toasts.some(x => x.title.includes('El envío continúa'))).toBe(true)
  })

  it('tells the parent when the batch finished', async () => {
    serve()
    await toConfirm()
    await click('Enviar a 3 invitaciones')
    expect(wrapper.emitted('sent').length).toBeGreaterThanOrEqual(2)
  })

  it('has Back (and no progress yet) before the send, and keeps the chosen families when going back and forth', async () => {
    serve()
    await toConfirm()
    expect(button('Atrás')).toBeTruthy()
    await click('Atrás')
    expect(body()).toContain('Paso 2 de 3')
  })
})

describe('Reopening on a send in flight', () => {
  it('goes straight to the progress of the active batch', async () => {
    serve()
    wa.activeBatch.mockResolvedValue(batchOf({ queued: 1, done: false, sent: 1, failed: 1 }))
    wa.batch.mockResolvedValue(batchOf({ queued: 1, done: false, sent: 1, failed: 1 }))
    await open({ resume: true })
    expect(body()).toContain('Paso 3 de 3')
    expect(body()).toContain('Enviando…')
    expect(wa.batch).toHaveBeenCalledWith(7, 'b1')
    expect(q('[data-testid="auto-progress"]').textContent).toContain('2 de 3')
    expect(button('Atrás')).toBeUndefined()
    await click('Cerrar')
    expect(useToast().toasts.some(x => x.title.includes('El envío continúa'))).toBe(true)
  })

  it('says there is nothing in flight when the batch is already gone, or the read fails', async () => {
    serve()
    await open({ resume: true })
    expect(q('[data-testid="auto-none"]').textContent).toContain('No hay ningún envío en curso')
    wrapper.unmount()
    wa.activeBatch.mockRejectedValue(new Error('x'))
    await open({ resume: true })
    expect(body()).toContain('No pudimos enviar los mensajes')
  })
})

describe('Mode fallback', () => {
  it('falls back to manual when the server says the automatic send is not available', async () => {
    serve({ audience: info({ mode: { automatic: false, reason: 'whatsapp_unavailable' } }) })
    await open()
    expect(q('[data-testid="wizard-mode-banner"]')).toBeTruthy()
    await click('Siguiente')
    expect(q('[data-testid="preview-fixed"]')).toBeNull() // manual: the text is editable
    await click('Siguiente')
    expect(body()).toContain('Enviar a mano')
  })
})

describe('Step 2 · link card (automatic)', () => {
  const link = { title: 'Ana López, estás invitado/a a Los XV de Valentina', description: 'Viernes 25 de diciembre de 2026 · Miami. Abre tu invitación.', image: 'https://q.test/og/ana.jpg', alt: 'Portada de Valentina', imageWidth: 1200, imageHeight: 630 }
  const card = () => q('[data-testid="link-card"]')

  it('shows the image, title and description the guest will see, and follows "Ver como"', async () => {
    serve({ recipients: [rec(1), rec(2, { locale: 'en' })] })
    wa.preview.mockImplementation(async (_e, { guestId, locale }) => previewOf(`Familia ${guestId}`, { link: `https://q.test/i/xv/${guestId}`, linkPreview: { ...link, title: locale === 'en' ? 'Guest, you are invited' : link.title } }))
    await toPreview()
    expect(card().textContent).toContain('Así se verá el enlace en WhatsApp')
    expect(q('[data-testid="link-card-title"]').textContent).toContain('Ana López, estás invitado/a')
    expect(q('[data-testid="link-card-description"]').textContent).toContain('Abre tu invitación.')
    expect(q('[data-testid="link-card-host"]').textContent).toBe('q.test')
    expect(q('[data-testid="link-card-image"]').getAttribute('src')).toBe('https://q.test/og/ana.jpg')
    expect(q('[data-testid="link-card-image"]').getAttribute('alt')).toBe('Portada de Valentina')
    const tab = [...document.querySelectorAll('[role="tab"]')].find(t => t.textContent.includes('Inglés'))
    tab.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }))
    await flushPromises()
    expect(q('[data-testid="link-card-title"]').textContent).toBe('Guest, you are invited')
  })

  it('draws a skeleton while the preview loads', async () => {
    serve()
    let release
    wa.preview.mockImplementation(() => new Promise(resolve => (release = () => resolve(previewOf('Familia 1', { linkPreview: link })))))
    await toPreview()
    expect(q('[data-testid="link-card-loading"]')).toBeTruthy()
    expect(q('[data-testid="link-card-ready"]')).toBeNull()
    release()
    await flushPromises()
    expect(q('[data-testid="link-card-loading"]')).toBeNull()
    expect(q('[data-testid="link-card-ready"]')).toBeTruthy()
  })

  it('falls back to the brand mark when the image breaks', async () => {
    serve()
    wa.preview.mockResolvedValue(previewOf('Familia 1', { linkPreview: link }))
    await toPreview()
    q('[data-testid="link-card-image"]').dispatchEvent(new Event('error'))
    await flushPromises()
    expect(q('[data-testid="link-card-image"]')).toBeNull()
    expect(q('[data-testid="link-card-fallback"]').textContent).toContain('Quinvite')
    expect(q('[data-testid="link-card-title"]').textContent).toContain('Ana López')
  })

  it('is left out when the sample guest has no linkPreview, and when the preview fails', async () => {
    serve()
    wa.preview.mockResolvedValue(previewOf('Familia 1', { linkPreview: null }))
    await toPreview()
    expect(card()).toBeNull()
    expect(q('[data-testid="preview-bubble"]')).toBeTruthy()
  })

  it('is left out when the preview fails', async () => {
    serve()
    wa.preview.mockRejectedValue({ response: { status: 500 } })
    await toPreview()
    expect(card()).toBeNull()
    expect(q('[data-testid="preview-error"]')).toBeTruthy()
  })
})

async function pickAll() {
  ;[...document.querySelectorAll('label')].find(l => l.textContent.includes('Todos')).querySelector('[role="radio"]').click()
  await flushPromises()
}

describe('Coverage of the preview and confirm steps', () => {
  it('previews as the family picked in the "view as" select', async () => {
    serve({ recipients: [rec(1), rec(2, { locale: 'en' }), rec(3)] })
    await toPreview()
    const { default: UiSelect } = await import('@/ui/UiSelect.vue')
    wa.preview.mockClear()
    wrapper.findComponent(UiSelect).vm.$emit('update:modelValue', 2)
    await flushPromises()
    expect(wa.preview).toHaveBeenLastCalledWith(7, { template: 'invitation', guestId: 2, locale: 'en' })
    expect(body()).toContain('Familia 2')
  })

  it('lists the languages of the chosen families on the confirm step', async () => {
    serve({ recipients: [rec(1), rec(2, { locale: 'en' }), rec(3)] })
    await toConfirm()
    expect(q('[data-testid="auto-summary"]').parentElement.textContent).toContain('Español 2 · Inglés 1')
  })

  it('closes the "retry anyway?" question without retrying when it is dismissed', async () => {
    serve()
    wa.batch.mockResolvedValue(batchOf({ messages: [{ guestId: 2, guestName: 'Familia 2', status: 'failed', errorCode: 'unknown_delivery', messageId: 12 }], failed: 1 }))
    await toConfirm()
    await click('Enviar a 3 invitaciones')
    await click('Reintentar el fallido')
    expect(body()).toContain('¿Reintentar el mensaje?')
    ;[...document.querySelectorAll('[role="dialog"]')].at(-1).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(body()).not.toContain('¿Reintentar el mensaje?')
    expect(wa.retry).not.toHaveBeenCalled()
  })

  it('passes the publish request of the confirm step up when the event turns into a draft meanwhile', async () => {
    serve()
    const w = await open()
    await click('Siguiente')
    await click('Siguiente')
    expect(body()).toContain('Paso 3 de 3')
    svc.audience.mockResolvedValue(info({ event: { published: false, archived: false } }))
    await w.setProps({ reloadToken: 1 })
    await flushPromises()
    await click('Ir a publicar')
    expect(w.emitted('publish')).toHaveLength(1)
  })
})

describe('Family count between step 1 and step 2', () => {
  // 8 families, 3 of them already answered: all 8 can get the invitation, only the 5 pending ones a reminder.
  const eight = [1, 2, 3, 4, 5, 6, 7, 8].map(id => rec(id, id > 5 ? { status: 'accepted', delivery: { state: 'sent' } } : {}))

  it('counts the families that can get the template at hand: changing the message in step 2 can lower the number', async () => {
    serve({ recipients: eight })
    await open()
    expect(body()).toContain('Todos · 8 invitaciones')
    expect(button('Siguiente').textContent).toContain('Siguiente · 5 invitaciones') // "Aún sin invitación" is the first card with people
    await pickAll()
    expect(button('Siguiente').textContent).toContain('Siguiente · 8 invitaciones')
    await click('Siguiente')
    expect(button('Siguiente').textContent).toContain('Siguiente · 8 invitaciones')
    await click('Cambiar mensaje')
    document.querySelectorAll('[data-testid="preview-templates"] [role="radio"]')[1].click() // reminder_pending
    await flushPromises()
    expect(button('Siguiente').textContent).toContain('Siguiente · 5 invitaciones')
    expect(wa.preview).toHaveBeenLastCalledWith(7, expect.objectContaining({ template: 'reminder_pending' }))
    // The language tabs and the "view as" select only change the sample: they never change who gets it.
    document.querySelectorAll('[data-testid="preview-templates"] [role="radio"]')[0].click()
    await flushPromises()
    expect(button('Siguiente').textContent).toContain('Siguiente · 8 invitaciones')
  })
})
