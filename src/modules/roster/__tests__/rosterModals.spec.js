import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import { UiDropdown } from '@/ui'
import ConfirmModal from '../components/ConfirmModal.vue'
import GuestFormModal from '../components/GuestFormModal.vue'
import GuestLocaleSelect from '../components/GuestLocaleSelect.vue'
import GuestRow from '../components/GuestRow.vue'

let wrapper
const body = () => document.body.textContent
const button = text => [...document.body.querySelectorAll('button')].find(b => b.textContent.trim().startsWith(text))
const radio = (name, value) => document.body.querySelector(`input[name="${name}"][value="${value}"]`)

const family = (extra = {}) => ({ id: 1, name: 'Ana Perez', phone: '+13055550123', email: 'ana@x.com', status: 'pending', link: 'https://q.test/i/1', notes: null, locale: null, companions: [], ...extra })
const withKids = () => family({ companions: [{ id: 11, name: 'Beto', status: 'pending' }, { id: 12, name: 'Cami', status: 'attending' }] })

beforeEach(() => setLocale('es'))
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

async function open(component, props) {
  wrapper = mount(component, { props: { open: false, ...props }, global: { plugins: [i18n] }, attachTo: document.body })
  await wrapper.setProps({ open: true })
  await flushPromises()
}

describe('ConfirmModal', () => {
  it('starts from the current answers: pending people are unanswered', async () => {
    await open(ConfirmModal, { family: withKids() })
    expect(radio('answer-1', 'attending').checked).toBe(false)
    expect(radio('answer-12', 'attending').checked).toBe(true)
    expect(body()).toContain('Beto')
  })

  it('refuses to save while someone has no answer, and says so', async () => {
    await open(ConfirmModal, { family: withKids() })
    button('Guardar respuestas').click()
    await flushPromises()
    expect(document.body.querySelector('[role="alert"]').textContent).toContain('Elige una respuesta para cada persona')
    expect(wrapper.emitted('save')).toBeUndefined()
  })

  it('answers for each person and sends the family answers', async () => {
    await open(ConfirmModal, { family: withKids() })
    radio('answer-1', 'attending').click()
    radio('answer-11', 'not-attending').click()
    await flushPromises()
    button('Guardar respuestas').click()
    await flushPromises()
    expect(wrapper.emitted('save')[0][0]).toEqual({
      status: 'attending',
      companions: [{ id: 11, status: 'not-attending' }, { id: 12, status: 'attending' }]
    })
  })

  it('answers everybody at once with the shortcuts', async () => {
    await open(ConfirmModal, { family: withKids() })
    button('Ninguno asiste').click()
    await flushPromises()
    button('Guardar respuestas').click()
    await flushPromises()
    expect(wrapper.emitted('save')[0][0]).toEqual({ status: 'not-attending', companions: [{ id: 11, status: 'not-attending' }, { id: 12, status: 'not-attending' }] })
    button('Todos asisten').click()
    await flushPromises()
    button('Guardar respuestas').click()
    await flushPromises()
    expect(wrapper.emitted('save')[1][0].status).toBe('attending')
  })

  it('clears an old warning when it opens again, and cancel closes it', async () => {
    await open(ConfirmModal, { family: family() })
    button('Guardar respuestas').click()
    await flushPromises()
    expect(document.body.querySelector('[role="alert"]')).toBeTruthy()
    await wrapper.setProps({ open: false })
    await wrapper.setProps({ open: true })
    await flushPromises()
    expect(document.body.querySelector('[role="alert"]')).toBeNull()
    button('Cancelar').click()
    expect(wrapper.emitted('update:open')[0]).toEqual([false])
  })

  it('renders nothing to answer without a family, and does not break when opened', async () => {
    await open(ConfirmModal, { family: null })
    expect(document.body.querySelector('fieldset')).toBeNull()
  })

  it('shows the saving state on the save button', async () => {
    await open(ConfirmModal, { family: family(), saving: true })
    expect(button('Guardar respuestas').disabled).toBe(true)
  })
})

describe('GuestFormModal', () => {
  const field = label => [...document.body.querySelectorAll('label')].find(l => l.textContent.trim().startsWith(label))
  const inputOf = label => document.body.querySelector(`#${field(label).getAttribute('for')}`)
  const type = async (el, value) => {
    el.value = value
    el.dispatchEvent(new Event('input'))
    await flushPromises()
  }
  const submit = async () => {
    document.body.querySelector('form#guest-form').dispatchEvent(new Event('submit', { cancelable: true }))
    await flushPromises()
  }

  it('adds a guest: blocks an empty name and shows the field errors', async () => {
    await open(GuestFormModal, { family: null })
    expect(body()).toContain('Nuevo invitado')
    await submit()
    expect(body()).toContain('Escribe el nombre')
    expect(wrapper.emitted('save')).toBeUndefined()
    await type(inputOf('Nombre'), 'Ana')
    await type(inputOf('Correo'), 'no')
    await type(inputOf('Teléfono'), 'abc')
    await submit()
    expect(wrapper.emitted('save')).toBeUndefined()
    expect(document.body.querySelectorAll('[aria-invalid="true"]').length).toBe(2)
  })

  it('sends the person, the named companions and nothing removed', async () => {
    await open(GuestFormModal, { family: null })
    await type(inputOf('Nombre'), 'Ana')
    button('Añadir acompañante').click()
    await flushPromises()
    await type(document.body.querySelector('[aria-label="Nombre del acompañante"]'), '  Beto ')
    await submit()
    const [{ person, companions, removed }] = wrapper.emitted('save')[0]
    expect(person).toMatchObject({ name: 'Ana', email: '', phone: '', notes: '' })
    expect(companions).toEqual([{ name: 'Beto' }])
    expect(removed).toEqual([])
  })

  it('requires a name for each companion', async () => {
    await open(GuestFormModal, { family: null })
    await type(inputOf('Nombre'), 'Ana')
    button('Añadir acompañante').click()
    await flushPromises()
    await submit()
    expect(document.body.querySelector('[role="alert"]').textContent).toContain('Escribe el nombre de cada acompañante')
    expect(wrapper.emitted('save')).toBeUndefined()
  })

  it('edits a family: fills the form, remembers the removed companions, and keeps new ones', async () => {
    await open(GuestFormModal, { family: { ...withKids(), notes: 'vegano' } })
    expect(body()).toContain('Editar invitado')
    expect(inputOf('Nombre').value).toBe('Ana Perez')
    expect(inputOf('Correo').value).toBe('ana@x.com')
    const kids = () => [...document.body.querySelectorAll('[aria-label="Nombre del acompañante"]')]
    expect(kids().map(k => k.value)).toEqual(['Beto', 'Cami'])
    document.body.querySelectorAll('[aria-label="Quitar acompañante"]')[0].click()
    await flushPromises()
    button('Añadir acompañante').click()
    await flushPromises()
    await type(kids()[1], 'Nuevo')
    // A companion added and dropped again was never saved: it is not reported as removed.
    document.body.querySelectorAll('[aria-label="Quitar acompañante"]')[1].click()
    await flushPromises()
    await submit()
    const [{ companions, removed }] = wrapper.emitted('save')[0]
    expect(removed).toEqual([11])
    expect(companions).toEqual([{ id: 12, name: 'Cami' }])
  })

  it('edits the invitation language with the form: reported only when it changed, and not offered when adding', async () => {
    await open(GuestFormModal, { family: family({ locale: 'es' }), eventLocale: 'en' })
    expect(wrapper.findComponent(GuestLocaleSelect).props('eventLocale')).toBe('en')
    await submit()
    expect(wrapper.emitted('save')[0][0]).not.toHaveProperty('locale')
    wrapper.findComponent(GuestLocaleSelect).vm.$emit('change', null)
    await flushPromises()
    await submit()
    expect(wrapper.emitted('save')[1][0].locale).toBeNull()
    wrapper.unmount()
    document.body.innerHTML = ''
    await open(GuestFormModal, { family: null })
    expect(wrapper.findComponent(GuestLocaleSelect).exists()).toBe(false)
  })

  it('fills missing contact data with empty strings and resets when reopened', async () => {
    await open(GuestFormModal, { family: family({ email: null, phone: null, notes: null }) })
    expect(inputOf('Correo').value).toBe('')
    await type(inputOf('Nombre'), 'Cambio')
    await wrapper.setProps({ open: false })
    await wrapper.setProps({ open: true })
    await flushPromises()
    expect(inputOf('Nombre').value).toBe('Ana Perez')
  })

  it('cancel closes the dialog', async () => {
    await open(GuestFormModal, { family: null })
    button('Cancelar').click()
    expect(wrapper.emitted('update:open')[0]).toEqual([false])
  })
})

describe('GuestRow menu and details', () => {
  const card = (props = {}) => mount(GuestRow, { props: { family: family(), canEdit: true, ...props }, global: { plugins: [i18n] } })
  const items = w => w.findComponent(UiDropdown).props('items')
  const labels = w => items(w).map(i => i.label)

  it('an organizer sees every action in order, without "revert" while nobody has answered', () => {
    expect(labels(card())).toEqual(['Editar invitado', 'Idioma de la invitación', 'Enviar invitación', 'Copiar enlace', 'Confirmar por teléfono', 'Eliminar'])
  })

  it('opens the language as a submenu of three choices with the current one marked', () => {
    const lang = items(card({ family: family({ locale: 'en' }), eventLocale: 'es' }))[1]
    expect(lang.radio.value).toBe('en')
    expect(lang.radio.options.map(o => o.value)).toEqual(['event', 'es', 'en'])
    expect(lang.radio.options[0].label).toBe('El del evento (Español)')
    expect(items(card())[1].radio.value).toBe('event')
  })

  it('offers to go back to pending once the family or a companion answered', () => {
    expect(labels(card({ family: family({ status: 'attending' }) }))).toContain('Volver a pendiente')
    expect(labels(card({ family: withKidsAnswered() }))).toContain('Volver a pendiente')
  })

  it('a viewer can only send or copy', () => {
    expect(labels(card({ canEdit: false }))).toEqual(['Enviar invitación', 'Copiar enlace'])
  })

  it('without a link, sending and copying are disabled', () => {
    const w = card({ family: family({ link: null }) })
    expect(items(w).filter(i => ['Enviar invitación', 'Copiar enlace'].includes(i.label)).map(i => i.disabled)).toEqual([true, true])
  })

  it('every action emits its event with the family, and the language choice emits "locale"', () => {
    const f = family({ status: 'attending' })
    const w = card({ family: f })
    for (const item of items(w)) item.onSelect?.()
    expect(['send', 'copy', 'edit', 'confirm', 'revert', 'remove'].map(e => w.emitted(e)?.[0]?.[0])).toEqual(Array(6).fill(f))
    items(w)[1].radio.onChange('en')
    items(w)[1].radio.onChange('event')
    expect(w.emitted('locale')).toEqual([[f, 'en'], [f, null]])
  })

  it('shows contact, notes, the RSVP note and the number of people; companions get their own rows with a status chip', () => {
    const w = card({ family: { ...withKids(), notes: 'sin gluten', rsvpNote: 'Llegamos tarde' } })
    expect(w.text()).toContain('+13055550123')
    expect(w.text()).toContain('sin gluten')
    expect(w.text()).toContain('Llegamos tarde')
    const rows = w.findAll('[data-testid="companion-row"]')
    expect(rows.map(r => r.get('[data-testid="companion-name"]').text())).toEqual(['Beto', 'Cami'])
    expect(rows[1].text()).toContain('Asiste')
    expect(w.get('[role="row"] [role="cell"]:nth-child(4)').text()).toBe('3')
  })

  it('falls back to the email, and to no contact line at all', () => {
    expect(card({ family: family({ phone: null }) }).text()).toContain('ana@x.com')
    expect(card({ family: family({ phone: null, email: null }) }).text()).not.toContain('@')
  })

  it('clicking the row edits the guest, but the menu button does not; viewers cannot edit from the row', async () => {
    const w = card()
    await w.get('[data-testid="guest-row"]').trigger('click')
    expect(w.emitted('edit')).toHaveLength(1)
    await w.get('button[aria-label="Acciones para Ana Perez"]').trigger('click')
    expect(w.emitted('edit')).toHaveLength(1)
    const viewer = card({ canEdit: false })
    await viewer.get('[data-testid="guest-row"]').trigger('click')
    expect(viewer.emitted('edit')).toBeUndefined()
  })

  it('shows the language chip only for a language of her own, with the same status chip (and dot) for companions', () => {
    expect(card().find('[data-testid="locale-chip"]').exists()).toBe(false)
    const en = card({ family: family({ locale: 'en' }) }).get('[data-testid="locale-chip"]')
    expect(en.text()).toContain('EN')
    expect(en.attributes('title')).toBe('Invitación en inglés')
    expect(card({ family: family({ locale: 'es' }) }).get('[data-testid="locale-chip"]').attributes('title')).toBe('Invitación en español')
    const w = card({ family: withKids() })
    const dots = w.findAll('[data-testid="companion-row"] .h-1\\.5.w-1\\.5')
    expect(dots).toHaveLength(2)
  })
})

function withKidsAnswered() {
  return family({ companions: [{ id: 11, name: 'Beto', status: 'not-attending' }] })
}
