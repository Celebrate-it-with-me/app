import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'

const svc = vi.hoisted(() => ({ audience: vi.fn(), allRecipients: vi.fn(), allRoster: vi.fn(), markShared: vi.fn(), unmarkShared: vi.fn() }))
vi.mock('../services/SendWizardService', () => ({ default: svc }))
import SendWizard from '../components/send/SendWizard.vue'

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
  svc.markShared.mockImplementation(async (_e, id) => ({ id, delivery: { sharedAt: '2026-11-19T18:02:00Z' } }))
  svc.unmarkShared.mockResolvedValue({})
  useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('SendWizard step 1', () => {
  it('shows the cards with live counts, the summary and what cannot be shared', async () => {
    serve()
    await open()
    expect(body()).toContain('¿A quién se lo enviamos?')
    expect(body()).toContain('Paso 1 de 2')
    expect(body()).toContain('Aún sin invitación · 3 familias')
    expect(body()).toContain('Pendientes de responder · 0 familias')
    expect(body()).toContain('Todos · 3 familias')
    expect(body()).not.toContain('Meta')
    expect(document.querySelector('[data-testid="who-summary"]').textContent).toContain('3 familias')
    expect(document.querySelector('[data-testid="who-nophone"]').textContent).toContain('1 sin número')
    expect(document.querySelector('[data-testid="who-blocked"]').textContent).toContain('No se pueden compartir (2)')
    expect(button('Siguiente · 3 familias').disabled).toBe(false)
  })

  it('goes to the assisted list with the chosen families and Back returns to step 1', async () => {
    serve()
    await open()
    await click('Siguiente')
    expect(body()).toContain('Paso 2 de 2')
    expect(body()).toContain('Enviar a mano · 3 familias')
    expect(document.querySelectorAll('[data-testid="manual-row"]')).toHaveLength(3)
    await click('Atrás')
    expect(body()).toContain('¿A quién se lo enviamos?')
  })

  it('starts on the first card that has people, and falls back to everyone when only a reminder fits and RSVP is closed', async () => {
    serve({ recipients: [rec(1, { delivery: { state: 'sent' } })] })
    await open()
    expect(body()).toContain('Pendientes de responder · 1 familia')
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

  it('asks to confirm a batch above 100 families before going on (P7)', async () => {
    serve({ recipients: Array.from({ length: 101 }, (_, i) => rec(i + 1)) })
    await open()
    expect(button('Siguiente').disabled).toBe(true)
    document.querySelector('[data-testid="who-big"] button').click()
    await flushPromises()
    expect(button('Siguiente').disabled).toBe(false)
  })

  it('lets the organizer choose families one by one, search and filter', async () => {
    serve({ recipients: [rec(1), rec(2, { delivery: { state: 'sent' } }), rec(4, { reason: 'invalid_phone' }), rec(5, { reason: 'opted_out' })] })
    const w = await open()
    await pickCard('Elegir invitados')
    expect(document.querySelector('[data-testid="pick-counter"]').textContent).toContain('0 elegidas')
    expect(document.querySelector('[data-testid="pick-counter"]').textContent).toContain('2 no se pueden compartir')
    expect(button('Siguiente').disabled).toBe(true)
    const boxes = document.querySelectorAll('[data-testid="pick-list"] [role="checkbox"]')
    boxes[0].click()
    await flushPromises()
    expect(document.querySelector('[data-testid="pick-counter"]').textContent).toContain('1 elegida')
    boxes[0].click()
    await flushPromises()
    expect(document.querySelector('[data-testid="pick-counter"]').textContent).toContain('0 elegidas')
    await click('Elegir las visibles')
    expect(document.querySelector('[data-testid="pick-counter"]').textContent).toContain('2 elegidas')
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
    expect(body()).toContain('Ninguna familia coincide.')
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
    expect(body()).toContain('El envío automático aún no está disponible')
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
    expect(body()).toContain('Todos · 2 familias')
  })

  it('does not load while closed, and reloads when the parent bumps the token', async () => {
    serve()
    await open({ open: false })
    expect(svc.audience).not.toHaveBeenCalled()
    await wrapper.setProps({ reloadToken: 1 })
    expect(svc.audience).not.toHaveBeenCalled()
    await wrapper.setProps({ open: true })
    await flushPromises()
    expect(svc.audience).toHaveBeenCalledTimes(1)
    await wrapper.setProps({ reloadToken: 2 })
    await flushPromises()
    expect(svc.audience).toHaveBeenCalledTimes(2)
    expect(body()).toContain('Paso 1 de 2')
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
    expect(body()).toContain('Enviar a mano · 1 familia')
    expect(body()).toContain('Paso 2 de 2')
  })

  it('stays on step 1 when the family cannot be shared', async () => {
    serve()
    await open({ preselectedIds: [5] })
    expect(body()).toContain('¿A quién se lo enviamos?')
    expect(button('Siguiente').disabled).toBe(true)
  })
})

describe('SendWizard manual list', () => {
  const goToList = async () => {
    serve({ recipients: [rec(1), rec(2, { delivery: { state: 'manual', sharedAt: '2026-11-19T15:00:00Z' } }), rec(3, { phone: '', reason: 'no_phone' })] })
    await open({ preselectedIds: [1, 2, 3] })
  }

  it('shows progress, the sample message and the links with the message ready', async () => {
    await goToList()
    expect(document.querySelector('[data-testid="manual-progress"]').textContent).toContain('Abiertos 1 de 3')
    expect(body()).toContain('Quedan 2 por enviar')
    expect(document.querySelector('[role="progressbar"]').getAttribute('aria-valuenow')).toBe('1')
    expect(document.querySelector('[data-testid="message-sample"]').textContent).toContain('Hola Familia 1, te invitamos a Los XV')
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
    expect(body()).toContain('Listo: abriste todas las conversaciones.')
  })

  it('edits the message, warns when the link is missing and restores it (P1)', async () => {
    await goToList()
    await click('Cambiar mensaje')
    const area = document.querySelector('textarea')
    expect(area.value).toBe('Hola {name}, te invitamos a {event}. Aquí está tu invitación: {link}')
    area.value = 'Hola {name}!'
    area.dispatchEvent(new Event('input'))
    await flushPromises()
    expect(document.querySelector('[data-testid="message-sample"]').textContent).toContain('Hola Familia 1!')
    expect(body()).toContain('no incluye {link}')
    await click('Restaurar mensaje')
    expect(document.querySelector('textarea').value).toContain('{link}')
    await click('Ocultar mensaje')
    expect(document.querySelector('textarea')).toBeNull()
  })

  it('uses the save-the-date text when RSVP is closed', async () => {
    serve({ recipients: [rec(1)], audience: info({ rsvp: { isOpen: false } }) })
    await open({ preselectedIds: [1] })
    expect(document.querySelector('[data-testid="message-sample"]').textContent).toContain('guarda la fecha')
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

  it('drops an edited message when the template changes', async () => {
    const { default: SendStepManual } = await import('../components/send/SendStepManual.vue')
    const step = mount(SendStepManual, { props: { eventId: 7, eventName: 'XV', families: [{ id: 1, name: 'Ana', people: 1, phone: '1', link: 'l', sharedAt: null }], template: 'invitation' }, global: { plugins: [i18n] }, attachTo: document.body })
    await step.findAll('button')[0].trigger('click')
    await step.find('textarea').setValue('custom {link}')
    expect(step.find('[data-testid="message-sample"]').text()).toContain('custom l')
    await step.setProps({ template: 'reminder_pending' })
    expect(step.find('[data-testid="message-sample"]').text()).toContain('aún no has respondido')
    step.unmount()
  })
})
