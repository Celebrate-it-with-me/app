import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'

const svc = vi.hoisted(() => ({ audience: vi.fn(), allRecipients: vi.fn(), allRoster: vi.fn(), markShared: vi.fn(), unmarkShared: vi.fn() }))
const wa = vi.hoisted(() => ({ preview: vi.fn() }))
vi.mock('../services/SendWizardService', () => ({ default: svc }))
vi.mock('../services/WhatsappService', () => ({ default: wa }))
vi.mock('@/modules/template-picker/components/InvitationMiniature.vue', () => ({ default: { props: ['eventId', 'width', 'name', 'dateLabel', 'live'], template: '<div data-testid="miniature" />' } }))
import SendWizard from '../components/send/SendWizard.vue'
import { sendCounts } from '../services/sendFamilies'

const rec = (id, extra = {}) => ({ id, name: `Familia ${id}`, people: 2, phone: '+13055550101', status: 'pending', reason: null, delivery: { state: 'none' }, ...extra })
const row = (id, extra = {}) => ({ id, phone: '+13055550101', link: `https://q.test/i/xv/${id}`, ...extra })
const info = (extra = {}) => ({ event: { published: true, archived: false }, rsvp: { isOpen: true }, mode: { automatic: false, reason: 'module_off' }, ...extra })

let wrapper
const body = () => document.body.textContent
const button = text => [...document.body.querySelectorAll('button, a')].find(b => b.textContent.trim().includes(text))
const click = async text => {
  button(text).click()
  await flushPromises()
}

const pickCard = async text => {
  ;[...document.querySelectorAll('label')].find(l => l.textContent.includes(text)).querySelector('[role="radio"]').click()
  await flushPromises()
}

function serve({ recipients = [rec(1), rec(2), rec(3, { phone: '', reason: 'no_phone' }), rec(4, { reason: 'invalid_phone' }), rec(5, { reason: 'opted_out' })], audience = info() } = {}) {
  svc.audience.mockResolvedValue(audience)
  svc.allRecipients.mockResolvedValue(recipients)
  svc.allRoster.mockResolvedValue(recipients.map(r => row(r.id, { phone: r.phone })))
}

async function open(props = {}) {
  wrapper = mount(SendWizard, { props: { open: true, eventId: 7, eventName: 'Los XV', ...props }, global: { plugins: [i18n] }, attachTo: document.body })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  setLocale('es')
  Object.values(svc).forEach(fn => fn.mockReset())
  wa.preview.mockReset()
  wa.preview.mockResolvedValue({ link: 'https://q.test/i/xv/1', linkPreview: { title: 'Familia 1, estás invitado/a a Los XV', description: 'Sábado 14 de marzo · Miami. Abre tu invitación.', image: 'https://q.test/og/1.jpg', alt: 'Portada', imageWidth: 1200, imageHeight: 630 } })
  svc.markShared.mockImplementation(async (_e, id) => ({ id, delivery: { sharedAt: '2026-11-19T18:02:00Z' } }))
  svc.unmarkShared.mockResolvedValue({})
  useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('SendWizard opened to remind the pending ones', () => {
  const checked = () => [...document.querySelectorAll('label')].find(l => l.querySelector('[role="radio"][aria-checked="true"]'))?.textContent ?? ''
  it('starts on the pending card even when it is empty, and sends nothing by itself', async () => {
    serve()
    await open({ initialCategory: 'pending' })
    expect(checked()).toContain('Pendientes de responder')
    expect(wa.preview).not.toHaveBeenCalled()
    expect(svc.markShared).not.toHaveBeenCalled()
  })
  it('falls back to the usual first card when answers are closed', async () => {
    serve({ audience: info({ rsvp: { isOpen: false } }) })
    await open({ initialCategory: 'pending' })
    expect(checked()).not.toContain('Pendientes de responder')
  })
  it("starts on the first-send card for the Inicio's 'Enviar invitaciones', and ignores any other value", async () => {
    serve({ recipients: [rec(1, { delivery: { state: 'sent' } }), rec(2, { delivery: { state: 'sent' } })] })
    await open({ initialCategory: 'unsent' })
    expect(checked()).toContain('Aún sin invitación')
    wrapper.unmount()
    await open({ initialCategory: 'all' })
    expect(checked()).toContain('Pendientes de responder')
  })
  it('its cards show the same numbers the Inicio reads with sendCounts', async () => {
    serve({ recipients: [rec(1, { delivery: { state: 'sent' } }), rec(2, { delivery: { state: 'sent' } }), rec(3), rec(4, { status: 'attending' })] })
    const counts = await sendCounts(7, 'manual')
    expect(counts).toMatchObject({ pending: 2, unsent: 2 })
    await open({ initialCategory: 'pending' })
    const label = key => [...document.querySelectorAll('label')].find(l => l.textContent.includes(key)).textContent
    expect(label('Pendientes de responder')).toContain(`${counts.pending} invitaciones`)
    expect(label('Aún sin invitación')).toContain(`${counts.unsent} invitaciones`)
  })
})

describe('SendWizard step 1', () => {
  it('shows the cards with live counts, the summary and what cannot be shared', async () => {
    serve()
    await open()
    expect(body()).toContain('¿A quién se lo enviamos?')
    expect(body()).toContain('Paso 1 de 3')
    expect(body()).toContain('Aún sin invitación · 4 invitaciones')
    expect(body()).toContain('Pendientes de responder · 0 invitaciones')
    expect(body()).toContain('Todos · 4 invitaciones')
    expect(body()).not.toContain('Meta')
    expect(document.querySelector('[data-testid="who-summary"]').textContent).toContain('4 invitaciones')
    expect(document.querySelector('[data-testid="who-nophone"]').textContent).toContain('1 sin número')
    expect(document.querySelector('[data-testid="who-blocked"]').textContent).toContain('No se pueden compartir (1)')
    expect(button('Siguiente · 4 invitaciones').disabled).toBe(false)
    // A card with nobody in it is not a choice (ORG-012).
    const radios = [...document.querySelectorAll('[role="radio"]')]
    const pending = radios.find(r => r.closest('label, div')?.textContent.includes('Pendientes de responder'))
    expect(pending.disabled || pending.getAttribute('aria-disabled') === 'true' || pending.hasAttribute('data-disabled')).toBe(true)
    // R1-002: really disabled, explained, and not dimmed with opacity (which fails axe color-contrast).
    expect(pending.disabled).toBe(true)
    const card = pending.closest('label')
    expect(card.textContent).toContain('No hay invitaciones pendientes')
    expect(card.className).not.toContain('opacity')
  })

  it('goes to the assisted list with the chosen families and Back returns to step 1', async () => {
    serve()
    await open()
    await click('Siguiente')
    expect(body()).toContain('Paso 2 de 3')
    expect(body()).toContain('Así lo recibirán')
    await click('Siguiente')
    expect(body()).toContain('Paso 3 de 3')
    expect(body()).toContain('Enviar a mano · 4 invitaciones')
    expect(document.querySelectorAll('[data-testid="manual-row"]')).toHaveLength(4)
    await click('Atrás')
    await click('Atrás')
    expect(body()).toContain('¿A quién se lo enviamos?')
  })

  it('starts on the first card that has people, and falls back to everyone when only a reminder fits and RSVP is closed', async () => {
    serve({ recipients: [rec(1, { delivery: { state: 'sent' } })] })
    await open()
    expect(body()).toContain('Pendientes de responder · 1 invitación')
    wrapper.unmount()
    serve({ recipients: [rec(1, { delivery: { state: 'sent' } })], audience: info({ rsvp: { isOpen: false } }) })
    await open()
    expect(body()).toContain('El plazo para responder ya cerró')
    expect(body()).toContain('No disponible: el plazo para responder ya cerró.')
    expect(document.querySelector('[data-testid="who-summary"]').textContent).toContain('Guarda la fecha')
  })

  it('shows an empty state with the add action when nobody is on the list', async () => {
    serve({ recipients: [] })
    const w = await open()
    expect(body()).toContain('Nadie por ahora')
    await click('Añadir invitado')
    expect(w.emitted('add-guest')).toHaveLength(1)
  })

  it('does not ask for the big-batch confirmation in manual mode (P7b)', async () => {
    serve({ recipients: Array.from({ length: 101 }, (_, i) => rec(i + 1)) })
    await open()
    expect(button('Siguiente').disabled).toBe(false)
    await click('Siguiente')
    await click('Siguiente')
    expect(body()).toContain('Enviar a mano · 101 invitaciones')
  })

  it('keeps blocking an opt-out in automatic mode and lists it', async () => {
    serve({ audience: info({ mode: { automatic: true } }) })
    await open({ mode: 'automatic' })
    expect(body()).toContain('Aún sin invitación · 2 invitaciones')
    expect(document.querySelector('[data-testid="who-blocked"]').textContent).toContain('Pidió no recibir mensajes')
    expect(document.querySelector('[data-testid="who-blocked"]').textContent).toContain('Falta el teléfono')
    expect(document.querySelector('[data-testid="who-optedout"]')).toBeNull()
  })

  it('lets an opted-out family be shared by hand and says so discreetly', async () => {
    serve()
    await open()
    expect(document.querySelector('[data-testid="who-optedout"]').textContent).toContain('1 pidió no recibir mensajes')
    expect(document.querySelector('[data-testid="who-blocked"]').textContent).not.toContain('Pidió no recibir')
    await pickCard('Elegir invitados')
    const badge = document.querySelector('[data-testid="pick-optedout"]')
    expect(badge.textContent).toContain('Pidió no recibir mensajes')
    await click('Elegir las visibles')
    await click('Siguiente')
    await click('Siguiente')
    const note = document.querySelector('[data-testid="manual-optedout"]')
    expect(note.textContent).toContain('Pidió no recibir mensajes')
    expect(document.querySelectorAll('[data-testid="manual-optedout"]')).toHaveLength(1)
  })

  it('uses the link of each recipient when the API sends it and the roster link as a fallback', async () => {
    const recipients = [rec(1, { link: 'https://q.test/api/1' }), rec(2)]
    serve({ recipients })
    await open({ preselectedIds: [1, 2] })
    await click('Siguiente')
    const links = [...document.querySelectorAll('[data-testid="manual-row"] a')].map(a => decodeURIComponent(a.getAttribute('href')))
    expect(links[0]).toContain('https://q.test/api/1')
    expect(links[1]).toContain('https://q.test/i/xv/2')
  })

  it('lets the organizer choose families one by one, search and filter', async () => {
    serve({ recipients: [rec(1), rec(2, { delivery: { state: 'sent' } }), rec(4, { reason: 'invalid_phone' }), rec(5, { reason: 'opted_out' })] })
    const w = await open()
    await pickCard('Elegir invitados')
    expect(document.querySelector('[data-testid="pick-counter"]').textContent).toContain('0 elegidas')
    expect(document.querySelector('[data-testid="pick-counter"]').textContent).toContain('1 no se puede compartir')
    expect(button('Siguiente').disabled).toBe(true)
    const boxes = document.querySelectorAll('[data-testid="pick-list"] [role="checkbox"]')
    boxes[0].click()
    await flushPromises()
    expect(document.querySelector('[data-testid="pick-counter"]').textContent).toContain('1 elegida')
    boxes[0].click()
    await flushPromises()
    expect(document.querySelector('[data-testid="pick-counter"]').textContent).toContain('0 elegidas')
    await click('Elegir las visibles')
    expect(document.querySelector('[data-testid="pick-counter"]').textContent).toContain('3 elegidas')
    await click('Quitar todas')
    expect(document.querySelector('[data-testid="pick-counter"]').textContent).toContain('0 elegidas')

    const search = document.querySelector('[data-testid="pick-list"] input[type="search"]')
    search.value = 'familia 2'
    search.dispatchEvent(new Event('input'))
    await flushPromises()
    expect(document.querySelectorAll('[data-testid="pick-list"] li')).toHaveLength(1)
    search.value = 'zzz'
    search.dispatchEvent(new Event('input'))
    await flushPromises()
    expect(body()).toContain('Ninguna invitación coincide.')
    search.value = ''
    search.dispatchEvent(new Event('input'))
    for (const label of ['Sin enviar', 'Pendientes', 'Con problema', 'Todas']) await click(label)
    expect(document.querySelectorAll('[data-testid="pick-list"] li')).toHaveLength(4)
    await click('Corregir')
    expect(w.emitted('edit-guest')[0][0]).toMatchObject({ id: 4 })
  })

  it('shows more rows on demand', async () => {
    serve({ recipients: Array.from({ length: 60 }, (_, i) => rec(i + 1)) })
    await open()
    await pickCard('Elegir invitados')
    expect(document.querySelectorAll('[data-testid="pick-list"] li')).toHaveLength(50)
    await click('Mostrar más')
    expect(document.querySelectorAll('[data-testid="pick-list"] li')).toHaveLength(60)
  })

  it('asks to fix a bad number or add a missing phone, without leaving the wizard', async () => {
    serve()
    const w = await open()
    const blocked = document.querySelector('[data-testid="who-blocked"]')
    ;[...blocked.querySelectorAll('button')].find(b => b.textContent.includes('Corregir')).click()
    await click('Añadir teléfono')
    expect(w.emitted('edit-guest').map(e => e[0].id)).toEqual([4, 3])
  })

  it('hides the fix actions from a viewer', async () => {
    serve()
    await open({ canEdit: false })
    expect(button('Corregir')).toBeUndefined()
    expect(button('Añadir teléfono')).toBeUndefined()
  })
})

describe('SendWizard banners and errors', () => {
  it('explains the plan lock and links to the plan', async () => {
    serve()
    const w = await open({ locked: true })
    expect(body()).toContain('El envío automático es del plan completo')
    await click('Ver plan')
    expect(w.emitted('unlock')).toHaveLength(1)
  })

  it('says the automatic send is not available yet when the module is off', async () => {
    serve()
    await open()
    expect(body()).toContain('Por ahora lo envías tú')
    expect(document.querySelector('[data-testid="wizard-mode-banner"] svg[viewBox="0 0 24 24"]')).toBeTruthy() // WhatsApp glyph, not a padlock
  })

  it('warns that an unpublished event has links that will not open and offers to publish', async () => {
    serve({ audience: info({ event: { published: false, archived: false } }) })
    const w = await open()
    expect(body()).toContain('aún no está publicado')
    await click('Ir a publicar')
    expect(w.emitted('publish')).toHaveLength(1)
  })

  it('blocks an archived event', async () => {
    serve({ audience: info({ event: { published: true, archived: true } }) })
    await open()
    expect(body()).toContain('Este evento está archivado')
    expect(button('Siguiente').disabled).toBe(true)
  })

  it('shows the error and tries again', async () => {
    svc.audience.mockRejectedValueOnce({ response: { status: 500 } })
    svc.allRecipients.mockResolvedValue([])
    svc.allRoster.mockResolvedValue([])
    await open()
    expect(body()).toContain('No pudimos preparar el envío')
    expect(button('Siguiente').disabled).toBe(true)
    serve()
    await click('Reintentar')
    expect(body()).toContain('¿A quién se lo enviamos?')
  })

  it('does not offer a retry when the role cannot send', async () => {
    svc.audience.mockRejectedValue({ response: { status: 403 } })
    svc.allRecipients.mockResolvedValue([])
    svc.allRoster.mockResolvedValue([])
    await open()
    expect(body()).toContain('No tienes permiso')
    expect(button('Reintentar')).toBeUndefined()
  })

  it('ignores an answer that arrives after a newer load', async () => {
    let slow
    svc.audience.mockImplementationOnce(() => new Promise(resolve => (slow = resolve)))
    svc.allRecipients.mockResolvedValue([rec(1)])
    svc.allRoster.mockResolvedValue([row(1)])
    const w = await open()
    serve({ recipients: [rec(1), rec(2)] })
    await w.setProps({ reloadToken: 1 })
    await flushPromises()
    slow(info())
    await flushPromises()
    expect(body()).toContain('Todos · 2 invitaciones')
  })

  it('does not load while closed, and reloads when the parent bumps the token', async () => {
    serve()
    await open({ open: false })
    expect(svc.audience).not.toHaveBeenCalled()
    await wrapper.setProps({ reloadToken: 1 })
    expect(svc.audience).not.toHaveBeenCalled()
    await wrapper.setProps({ open: true })
    await flushPromises()
    expect(svc.audience).toHaveBeenCalledTimes(2) // invitation + reminder_pending
    await wrapper.setProps({ reloadToken: 2 })
    await flushPromises()
    expect(svc.audience).toHaveBeenCalledTimes(4)
    expect(body()).toContain('Paso 1 de 3')
  })

  it('emits closed from Cancel and from the close button', async () => {
    serve()
    const w = await open()
    await click('Cancelar')
    expect(w.emitted('closed')).toHaveLength(1)
    expect(w.emitted('update:open')[0]).toEqual([false])
    document.querySelector('[aria-label="Cerrar"]').click()
    await flushPromises()
    expect(w.emitted('closed')).toHaveLength(2)
  })
})

describe('SendWizard preselected family', () => {
  it('jumps straight to the list when the family can be shared', async () => {
    serve()
    await open({ preselectedIds: [2] })
    expect(body()).toContain('Paso 2 de 3')
    expect(body()).toContain('Así lo recibirán')
    await click('Siguiente')
    expect(body()).toContain('Enviar a mano · 1 invitación')
  })

  it('stays on step 1 when the family cannot be shared', async () => {
    serve()
    await open({ preselectedIds: [4] })
    expect(body()).toContain('¿A quién se lo enviamos?')
    expect(button('Siguiente').disabled).toBe(true)
  })
})

describe('SendWizard manual list', () => {
  const goToList = async () => {
    serve({ recipients: [rec(1), rec(2, { delivery: { state: 'manual', sharedAt: '2026-11-19T15:00:00Z' } }), rec(3, { phone: '', reason: 'no_phone' })] })
    await open({ preselectedIds: [1, 2, 3] })
    await click('Siguiente')
  }

  it('shows progress, the sample message and the links with the message ready', async () => {
    await goToList()
    expect(document.querySelector('[data-testid="manual-progress"]').textContent).toContain('Abiertos 1 de 3')
    expect(body()).toContain('Quedan 2 por enviar')
    expect(document.querySelector('[role="progressbar"]').getAttribute('aria-valuenow')).toBe('1')
    const links = [...document.querySelectorAll('[data-testid="manual-row"] a')].map(a => a.getAttribute('href'))
    expect(links[0]).toContain('https://wa.me/13055550101?text=')
    expect(decodeURIComponent(links[0])).toContain('https://q.test/i/xv/1')
    expect(links[2]).toMatch(/^https:\/\/wa\.me\/\?text=/)
    expect(body()).toContain('Elegir contacto')
    expect(body()).toContain('Sin número')
    expect(body()).toContain('Abrir de nuevo')
  })

  it('marks a family as opened when its link is tapped and keeps the count', async () => {
    await goToList()
    const link = document.querySelector('[data-testid="manual-row"] a')
    link.addEventListener('click', e => e.preventDefault())
    link.click()
    await flushPromises()
    expect(svc.markShared).toHaveBeenCalledWith(7, 1)
    expect(document.querySelector('[data-testid="manual-progress"]').textContent).toContain('Abiertos 2 de 3')
  })

  it('goes back to the previous mark when saving it fails', async () => {
    await goToList()
    svc.markShared.mockRejectedValue(new Error('x'))
    const link = document.querySelector('[data-testid="manual-row"] a')
    link.addEventListener('click', e => e.preventDefault())
    link.click()
    await flushPromises()
    expect(document.querySelector('[data-testid="manual-progress"]').textContent).toContain('Abiertos 1 de 3')
    expect(useToast().toasts.some(x => x.message?.includes('No pudimos guardar la marca') || x.title?.includes('No pudimos guardar la marca'))).toBe(true)
  })

  it('unmarks a family, and restores the mark when that fails', async () => {
    await goToList()
    await click('Desmarcar')
    expect(svc.unmarkShared).toHaveBeenCalledWith(7, 2)
    expect(document.querySelector('[data-testid="manual-progress"]').textContent).toContain('Abiertos 0 de 3')
    svc.markShared.mockClear()
    svc.unmarkShared.mockReset()
    document.querySelectorAll('[data-testid="manual-row"] a')[1].addEventListener('click', e => e.preventDefault())
    document.querySelectorAll('[data-testid="manual-row"] a')[1].click()
    await flushPromises()
    svc.unmarkShared.mockRejectedValue(new Error('x'))
    await click('Desmarcar')
    expect(document.querySelector('[data-testid="manual-progress"]').textContent).toContain('Abiertos 1 de 3')
  })

  it('says it is done when every family was opened', async () => {
    serve({ recipients: [rec(1, { delivery: { state: 'manual', sharedAt: '2026-11-19T15:00:00Z' } })] })
    await open({ preselectedIds: [1] })
    await click('Siguiente')
    expect(body()).toContain('Listo: abriste todas las conversaciones.')
  })

  it('keeps the edited text from step 2 in the links of step 3, and a template change drops it', async () => {
    serve({ recipients: [rec(1)] })
    await open({ preselectedIds: [1] })
    expect(document.querySelector('[data-testid="preview-bubble"]').textContent).toContain('Hola Familia 1, te invitamos a Los XV')
    await click('Editar el texto')
    const area = document.querySelector('textarea')
    expect(area.value).toBe('Hola {name}, te invitamos a {event}. Aquí está tu invitación: {link}')
    area.value = 'Hola {name}! {link}'
    area.dispatchEvent(new Event('input'))
    await flushPromises()
    expect(document.querySelector('[data-testid="preview-bubble"]').textContent).toContain('Hola Familia 1! https://q.test/i/xv/1')
    await click('Siguiente')
    expect(decodeURIComponent(document.querySelector('[data-testid="manual-row"] a').getAttribute('href'))).toContain('Hola Familia 1! https://q.test/i/xv/1')
    await click('Atrás')
    await click('Editar el texto')
    expect(document.querySelector('textarea').value).toBe('Hola {name}! {link}')
    document.querySelector('textarea').value = 'Hola {name}!'
    document.querySelector('textarea').dispatchEvent(new Event('input'))
    await flushPromises()
    expect(body()).toContain('no incluye {link}')
    await click('Restaurar mensaje')
    expect(document.querySelector('textarea').value).toContain('{link}')
    await click('Cambiar mensaje')
    document.querySelectorAll('[data-testid="preview-templates"] [role="radio"]')[1].click()
    await flushPromises()
    expect(document.querySelector('[data-testid="preview-bubble"]').textContent).toContain('aún no has respondido')
    await click('Ocultar el texto')
    expect(document.querySelector('textarea')).toBeNull()
  })

  it('uses the save-the-date text when RSVP is closed', async () => {
    serve({ recipients: [rec(1)], audience: info({ rsvp: { isOpen: false } }) })
    await open({ preselectedIds: [1] })
    expect(document.querySelector('[data-testid="preview-bubble"]').textContent).toContain('guarda la fecha')
    await click('Cambiar mensaje')
    expect(document.querySelectorAll('[data-testid="preview-templates"] [role="radio"]')).toHaveLength(1)
  })

  it('closes from the footer', async () => {
    await goToList()
    await click('Cerrar')
    expect(wrapper.emitted('closed')).toHaveLength(1)
  })
})

describe('SendWizard edge cases', () => {
  it('does nothing without an event', async () => {
    await open({ eventId: null })
    expect(svc.audience).not.toHaveBeenCalled()
  })
})

describe('SendWizard step 2 · link card in manual mode', () => {
  const card = () => document.querySelector('[data-testid="link-card"]')

  it('asks the preview only for the link card, and keeps the message local', async () => {
    serve({ recipients: [rec(1)] })
    await open({ preselectedIds: [1] })
    expect(wa.preview).toHaveBeenCalledWith(7, { template: 'invitation', guestId: 1, locale: 'es' })
    expect(card().textContent).toContain('Familia 1, estás invitado/a a Los XV')
    expect(card().textContent).toContain('Abre tu invitación.')
    expect(card().querySelector('img').getAttribute('alt')).toBe('Portada')
    expect(document.querySelector('[data-testid="preview-bubble"]').textContent).toContain('Hola Familia 1, te invitamos a Los XV')
    expect(document.querySelector('[data-testid="preview-error"]')).toBeNull()
  })

  it.each([403, 404, 500])('leaves the card out when the preview answers %i, without breaking the step', async status => {
    serve({ recipients: [rec(1)] })
    wa.preview.mockRejectedValue({ response: { status } })
    await open({ preselectedIds: [1] })
    expect(card()).toBeNull()
    expect(document.querySelector('[data-testid="preview-error"]')).toBeNull()
    expect(document.querySelector('[data-testid="preview-bubble"]').textContent).toContain('Hola Familia 1')
    expect(button('Siguiente').disabled).toBe(false)
  })

  it('leaves the card out when the API has no linkPreview', async () => {
    serve({ recipients: [rec(1)] })
    wa.preview.mockResolvedValue({ link: 'x', linkPreview: null })
    await open({ preselectedIds: [1] })
    expect(card()).toBeNull()
  })
})

describe('SendWizard step 1 · automatic holds', () => {
  const holds = () => {
    const recipients = [rec(1), rec(2, { reason: 'recently_sent' }), rec(3), rec(4)]
    svc.audience.mockImplementation(async (_e, template) => info({ mode: { automatic: true }, blocked: template === 'reminder_pending' ? { reminder_limit: 1, recently_sent: 0 } : { reminder_limit: 0, recently_sent: 1 } }))
    svc.allRecipients.mockImplementation(async (_e, template) => (template === 'reminder_pending' ? [rec(1), rec(2), rec(3, { reason: 'reminder_limit' }), rec(4)] : recipients))
    svc.allRoster.mockResolvedValue(recipients.map(r => row(r.id)))
  }

  it('explains the 24 h wait and the 3-reminder cap in the blocked group and out of the card counts', async () => {
    holds()
    await open({ mode: 'automatic' })
    expect(svc.allRecipients).toHaveBeenCalledWith(7, 'reminder_pending')
    expect(body()).toContain('Aún sin invitación · 3 invitaciones')
    const group = document.querySelector('[data-testid="who-blocked"]')
    expect(group.textContent).toContain('No se pueden compartir (2)')
    expect(group.querySelector('[data-testid="who-blocked-recently_sent"]').textContent).toContain('Familia 2')
    expect(group.querySelector('[data-testid="who-blocked-recently_sent"]').textContent).toContain('hace menos de 24 h')
    expect(group.querySelector('[data-testid="who-blocked-reminder_limit"]').textContent).toContain('Ya recibió los 3 recordatorios permitidos')
    expect(group.querySelector('[data-testid="who-blocked-reminder_limit"] button')).toBeNull()
  })

  it('does not block them in manual mode', async () => {
    holds()
    await open()
    expect(svc.allRecipients).not.toHaveBeenCalledWith(7, 'reminder_pending')
    expect(body()).toContain('Aún sin invitación · 4 invitaciones')
    expect(document.querySelector('[data-testid="who-blocked"]')).toBeNull()
  })

  it('does not ask for the reminder read when nothing is held, and survives its failure', async () => {
    serve({ recipients: [rec(1)], audience: info({ mode: { automatic: true }, blocked: { reminder_limit: 0, recently_sent: 0 } }) })
    await open({ mode: 'automatic' })
    expect(svc.allRecipients).toHaveBeenCalledTimes(1)
    svc.audience.mockImplementation(async (_e, template) => {
      if (template === 'reminder_pending') throw new Error('x')
      return info({ mode: { automatic: true } })
    })
    await wrapper.setProps({ reloadToken: 5 })
    await flushPromises()
    expect(body()).toContain('Paso 1 de 3')
    expect(body()).toContain('Aún sin invitación · 1 invitación')
  })

  it('labels every reason in the pick list instead of calling it a bad number', async () => {
    holds()
    await open({ mode: 'automatic' })
    await pickCard('Elegir invitados')
    const list = document.querySelector('[data-testid="pick-list"]').textContent
    expect(list).toContain('Recibió un mensaje hace menos de 24 h')
  })
})
