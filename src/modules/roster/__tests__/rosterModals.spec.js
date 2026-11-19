import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import { UiDropdown } from '@/ui'
import ConfirmModal from '../components/ConfirmModal.vue'
import GuestFormModal from '../components/GuestFormModal.vue'
import GuestCard from '../components/GuestCard.vue'

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

describe('GuestCard menu and details', () => {
  const card = (props = {}) => mount(GuestCard, { props: { family: family(), canEdit: true, ...props }, global: { plugins: [i18n] } })
  const items = w => w.findComponent(UiDropdown).props('items')
  const labels = w => items(w).map(i => i.label)

  it('an organizer sees every action, without "revert" while nobody has answered', () => {
    expect(labels(card())).toEqual(['Enviar invitación', 'Copiar enlace', 'Editar', 'Confirmar por teléfono', 'Eliminar'])
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
    expect(items(w).slice(0, 2).map(i => i.disabled)).toEqual([true, true])
  })

  it('every action emits its event with the family', () => {
    const f = family({ status: 'attending' })
    const w = card({ family: f })
    for (const item of items(w)) item.onSelect()
    expect(['send', 'copy', 'edit', 'confirm', 'revert', 'remove'].map(e => w.emitted(e)?.[0]?.[0])).toEqual(Array(6).fill(f))
  })

  it('shows contact, companions, notes and the note left on the RSVP', () => {
    const w = card({ family: { ...withKids(), notes: 'sin gluten', rsvpNote: 'Llegamos tarde' } })
    expect(w.text()).toContain('+13055550123')
    expect(w.text()).toContain('Beto')
    expect(w.text()).toContain('sin gluten')
    expect(w.text()).toContain('Llegamos tarde')
    expect(w.text()).toContain('3 personas')
  })

  it('falls back to the email, and to no contact line at all', () => {
    expect(card({ family: family({ phone: null }) }).text()).toContain('ana@x.com')
    expect(card({ family: family({ phone: null, email: null }) }).find('p.truncate').exists()).toBe(false)
  })

  it('relays a language change', () => {
    const w = card()
    w.findComponent({ name: 'GuestLocaleSelect' }).vm.$emit('change', 'en')
    expect(w.emitted('locale')[0]).toEqual([family(), 'en'])
  })
})

function withKidsAnswered() {
  return family({ companions: [{ id: 11, name: 'Beto', status: 'not-attending' }] })
}
