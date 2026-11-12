import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '../../stores/useEventsStore'
import EventCard from '../EventCard.vue'
import EventAddressField from '../EventAddressField.vue'
import EventStatusBadge from '../EventStatusBadge.vue'

// UiButton renders a router-link when `to` is set: a stub is enough here.
const stubs = { RouterLink: { props: ['to'], template: '<a><slot /></a>' } }

function setup() {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  const store = useEventsStore()
  store.eventTypes = [{ id: 1, slug: 'quinceanera', name: 'Quinceañera' }]
  return { global: { plugins: [i18n, pinia], stubs } }
}

const future = () => {
  const d = new Date()
  d.setDate(d.getDate() + 10)
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} 18:00`
}
// The browser collapses runs of whitespace; the test does the same.
const textOf = wrapper => wrapper.text().replace(/\s+/g, ' ')
const baseEvent = { id: 7, eventName: 'Los XV de Valentina', eventType: 1, status: 'draft', startDate: future(), guestsCount: 0, rsvpResponse: 0 }

beforeEach(() => setLocale('es'))

describe('EventStatusBadge', () => {
  it('names each status in the current language', () => {
    const options = setup()
    expect(mount(EventStatusBadge, { props: { status: 'draft' }, ...options }).text()).toBe('Borrador')
    expect(mount(EventStatusBadge, { props: { status: 'published' }, ...options }).text()).toBe('Publicado')
    expect(mount(EventStatusBadge, { props: { status: 'archived' }, ...options }).text()).toBe('Archivado')
    setLocale('en')
    expect(mount(EventStatusBadge, { props: { status: 'published' }, ...options }).text()).toBe('Published')
  })
})

describe('EventCard', () => {
  it('shows the type, name, countdown and, with no guests, says so', () => {
    const wrapper = mount(EventCard, { props: { event: baseEvent }, ...setup() })
    expect(wrapper.text()).toContain('Quinceañera')
    expect(wrapper.text()).toContain('Los XV de Valentina')
    expect(wrapper.text()).toContain('Faltan 10 días')
    expect(wrapper.text()).toContain('Sin invitados')
  })

  it('says how many guests have replied, and nobody when none have', () => {
    const options = setup()
    expect(textOf(mount(EventCard, { props: { event: { ...baseEvent, guestsCount: 39, rsvpResponse: 0 } }, ...options }))).toContain('39 invitados · Nadie ha respondido')
    expect(textOf(mount(EventCard, { props: { event: { ...baseEvent, guestsCount: 39, rsvpResponse: 29 } }, ...options }))).toContain('29 han respondido')
  })

  it('marks the active event', () => {
    const wrapper = mount(EventCard, { props: { event: baseEvent, active: true }, ...setup() })
    expect(wrapper.text()).toContain('Evento activo')
  })

  it('opens the event from "Abrir" and restores an archived one from "Restaurar"', async () => {
    const options = setup()
    const live = mount(EventCard, { props: { event: baseEvent }, ...options })
    await live.findAll('button').find(b => b.text() === 'Abrir').trigger('click')
    expect(live.emitted('open')[0][0]).toMatchObject({ id: 7 })

    const archived = mount(EventCard, { props: { event: { ...baseEvent, status: 'archived' } }, ...options })
    expect(archived.text()).not.toContain('Faltan')
    expect(archived.findAll('button').some(b => b.text() === 'Abrir')).toBe(false)
    await archived.findAll('button').find(b => b.text() === 'Restaurar').trigger('click')
    expect(archived.emitted('restore')[0][0]).toMatchObject({ id: 7 })
  })
})

describe('EventAddressField', () => {
  it('is editable while the event is a draft, and explains that it gets fixed on publishing', () => {
    const wrapper = mount(EventAddressField, { props: { modelValue: 'los-xv' }, ...setup() })
    expect(wrapper.get('input').attributes('disabled')).toBeUndefined()
    expect(wrapper.text()).toContain('Puedes cambiarla mientras tu evento sea un borrador')
    expect(wrapper.text()).toContain('/i/los-xv/')
  })

  it('is locked and says why once the event has been published', () => {
    const wrapper = mount(EventAddressField, { props: { modelValue: 'los-xv', locked: true }, ...setup() })
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Ya no se puede cambiar')
  })

  it('reports what is typed', async () => {
    const wrapper = mount(EventAddressField, { props: { modelValue: '' }, ...setup() })
    await wrapper.get('input').setValue('mi-quince')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['mi-quince'])
  })
})
