import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import es from '@/locales/es'

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: api }))
const toasts = vi.hoisted(() => ({ toast: vi.fn() }))
vi.mock('@/ui', async importOriginal => ({ ...(await importOriginal()), useToast: () => toasts }))
vi.mock('@/modules/events/stores/useEventsStore', () => ({ useEventsStore: () => ({ activeEvent: { id: 1 } }) }))

import SeatingView from '../views/SeatingView.vue'
import { useSeatingStore } from '../stores/useSeatingStore'
import { UiTabs } from '@/ui'

const Modal = {
  props: ['open', 'title', 'description'],
  emits: ['update:open'],
  template: '<div v-if="open" class="modal" :data-title="title"><h2>{{ title }}</h2><p class="desc">{{ description }}</p><button class="modal-x" @click="$emit(\'update:open\', false)">x</button><slot /><slot name="footer" /></div>'
}

const g = (id, name, rsvpStatus = 'attending', parentId = null) => ({ id, name, rsvpStatus, parentId })
let state
const reset = () => {
  state = {
    guests: [g(1, 'Rosa Fernandez'), g(2, 'Jorge Fernandez', 'attending', 1), g(3, 'Hector Fernandez', 'pending', 1), g(4, 'Andres Castillo', 'not-attending'), g(5, 'Sofia Rivas', 'pending')],
    tables: [
      { id: 1, name: 'Honor', capacity: 4, type: 'vip', priority: 10, reserved_for: 'Padres', location: 'front', seats: [g(101, 'Valentina'), g(102, 'Padre')] },
      { id: 2, name: 'Familia', capacity: 3, type: 'family', priority: 5, reserved_for: null, location: null, seats: [] },
      { id: 3, name: 'Llena', capacity: 1, type: 'general', priority: 1, reserved_for: null, location: null, seats: [g(103, 'Solo')] }
    ]
  }
}
const tableJson = t => ({ ...t, assigned_guests: t.seats, available_seats: t.capacity - t.seats.length })
const seatedIds = () => state.tables.flatMap(t => t.seats.map(s => s.id))
const fail = (status, data = {}) => Object.assign(new Error('x'), { response: { status, data } })
let failNext
let moved = []

const wire = () => {
  api.get.mockImplementation(url => {
    if (failNext?.get) return Promise.reject(fail(500))
    if (url.endsWith('/seating/unassigned')) return Promise.resolve({ data: { data: state.guests.filter(x => !seatedIds().includes(x.id)) } })
    return Promise.resolve({ data: { data: state.tables.map(tableJson) } })
  })
  api.post.mockImplementation((url, body) => {
    if (failNext?.post) return Promise.reject(failNext.post)
    let m
    if (url.endsWith('/seating/bulk-assign')) {
      let n = 0
      const errors = []
      for (const a of body.assignments) {
        const t = state.tables.find(x => x.id === a.table_id)
        for (const id of a.guest_ids) {
          if (t.seats.length >= t.capacity) { errors.push('full'); break }
          t.seats.push(state.guests.find(x => x.id === id)); n++
        }
      }
      return Promise.resolve({ data: { meta: { total_assigned: n, errors } } })
    }
    if (url.endsWith('/seating/move')) {
      if (failNext?.move) return Promise.reject(failNext.move)
      const from = state.tables.find(x => x.seats.some(q => q.id === body.guest_id))
      const guest = from.seats.find(q => q.id === body.guest_id)
      from.seats = from.seats.filter(q => q.id !== body.guest_id)
      state.tables.find(x => x.id === body.to_table_id).seats.push(guest)
      return Promise.resolve({ data: { data: {}, meta: { declined: false } } })
    }
    if ((m = url.match(/tables\/(\d+)\/assign$/))) {
      const everyone = [...state.guests, ...state.tables.flatMap(t => t.seats), ...moved]
      state.tables.find(x => x.id === +m[1]).seats.push(everyone.find(x => x.id === body.guest_id))
      return Promise.resolve({ data: {} })
    }
    const created = { id: 9, name: body.name, capacity: body.capacity, type: body.type, priority: body.priority, seats: [] }
    state.tables.push(created)
    return Promise.resolve({ data: { data: tableJson(created) } })
  })
  api.put.mockImplementation(() => (failNext?.put ? Promise.reject(failNext.put) : Promise.resolve({ data: {} })))
  api.delete.mockImplementation(url => {
    if (failNext?.delete) return Promise.reject(failNext.delete)
    let m
    if (url.endsWith('/seating/clear-all')) {
      const n = seatedIds().length
      state.tables.forEach(t => (t.seats = []))
      return Promise.resolve({ data: { meta: { guests_unassigned: n } } })
    }
    if ((m = url.match(/tables\/(\d+)\/guest\/(\d+)$/))) {
      const t = state.tables.find(x => x.id === +m[1])
      moved.push(...t.seats.filter(s => s.id === +m[2]))
      t.seats = t.seats.filter(s => s.id !== +m[2])
      return Promise.resolve({ data: {} })
    }
    if ((m = url.match(/tables\/(\d+)$/))) {
      const t = state.tables.find(x => x.id === +m[1])
      state.tables = state.tables.filter(x => x !== t)
      return Promise.resolve({ data: { meta: { guests_unassigned: t.seats.length } } })
    }
    return Promise.resolve({ data: {} })
  })
}

const media = desktop => {
  window.matchMedia = () => ({ matches: desktop, addEventListener() {}, removeEventListener() {} })
}

let wrapper
const mountView = async ({ desktop = false } = {}) => {
  media(desktop)
  const i18n = createI18n({ legacy: false, locale: 'es', fallbackLocale: 'es', messages: { es } })
  wrapper = mount(SeatingView, {
    global: {
      plugins: [i18n],
      stubs: { UiModal: Modal, ModuleTemplateGate: true, ModuleTemplateNotice: true }
    }
  })
  await flushPromises()
  return wrapper
}
const btn = (text, root = wrapper) => root.findAll('button').find(b => b.text().includes(text))
const click = async (text, root = wrapper) => {
  const b = btn(text, root)
  if (!b) throw new Error(`no button "${text}"`)
  await b.trigger('click')
  await flushPromises()
}
const sheet = () => wrapper.find('.modal[data-title*="Sentar"], .modal[data-title*="Mover"]')
const lastToast = () => toasts.toast.mock.calls.at(-1)[0]

beforeEach(() => {
  setActivePinia(createPinia())
  reset()
  failNext = null
  moved = []
  Object.values(api).forEach(fn => fn.mockReset())
  toasts.toast.mockReset()
  wire()
})
afterEach(() => wrapper?.unmount())

describe('SeatingView (phone)', () => {
  it('shows the counters with seats free and declined guests', async () => {
    await mountView()
    const text = wrapper.text()
    expect(text).toContain('3/8')
    expect(text).toContain('5 libres')
    expect(text).toContain('1 no asisten')
    expect(wrapper.findAll('[role="progressbar"]').length).toBe(3)
    expect(text).toContain('Casi llena')
  })

  it('seats a guest from the unseated list through the sheet', async () => {
    await mountView()
    await click('Sin sentar')
    const seatButtons = wrapper.findAll('button').filter(b => b.text() === 'Sentar')
    await seatButtons[4].trigger('click') // Sofia Rivas
    await flushPromises()
    expect(sheet().exists()).toBe(true)
    expect(sheet().text()).toContain('Sentar a Sofia Rivas en')
    expect(sheet().text()).toContain('Llena')
    // the full table is disabled
    const llena = btn('Llena', sheet())
    expect(llena.attributes('disabled')).toBeDefined()
    await click('Familia', sheet())
    expect(api.post).toHaveBeenCalledWith('event/1/tables/2/assign', { guest_id: 5 })
    expect(lastToast().title).toBe('Sofia Rivas ahora está en Familia.')
    expect(sheet().exists()).toBe(false)
  })

  it('warns, without blocking, when the guest declined', async () => {
    await mountView()
    await click('Sin sentar')
    await click('No asisten')
    const seat = wrapper.findAll('button').find(b => b.text() === 'Sentar')
    await seat.trigger('click')
    await flushPromises()
    expect(sheet().text()).toContain('Andres Castillo dijo que no asiste')
    await click('Honor', sheet())
    expect(api.post).toHaveBeenCalledWith('event/1/tables/1/assign', { guest_id: 4 })
  })

  it('ticks a family at once and seats them with bulk-assign', async () => {
    await mountView()
    await click('Sin sentar')
    const group = wrapper.find('button[aria-label^="Marcar a su grupo"]')
    expect(group.exists()).toBe(true)
    await group.trigger('click')
    expect(wrapper.text()).toContain('3 marcados')
    await click('Sentar en...')
    expect(sheet().text()).toContain('Sentar 3 invitados en')
    // Honor has 2 free seats: it does not fit 3
    expect(btn('Honor', sheet()).attributes('disabled')).toBeDefined()
    expect(sheet().text()).toContain('Solo quedan 2 lugares (necesitas 3)')
    await click('Familia', sheet())
    expect(api.post).toHaveBeenCalledWith('event/1/seating/bulk-assign', { assignments: [{ table_id: 2, guest_ids: [1, 2, 3] }] })
    expect(lastToast().title).toBe('3 invitados sentados en Familia.')
    expect(wrapper.text()).not.toContain('marcados')
  })

  it('unticks a group, ticks everything shown and clears the ticks', async () => {
    await mountView()
    await click('Sin sentar')
    const group = () => wrapper.find('button[aria-label^="Marcar a su grupo"]')
    await group().trigger('click')
    await group().trigger('click')
    expect(wrapper.text()).not.toContain('marcado')
    await wrapper.find('[role="checkbox"]').trigger('click') // "tick everyone shown"
    await flushPromises()
    expect(wrapper.text()).toContain('5 marcados')
    await click('Quitar marcas')
    expect(wrapper.text()).not.toContain('5 marcados')
    // single tick through a row checkbox, then untick all shown
    const boxes = wrapper.findAll('[role="checkbox"]')
    await boxes[1].trigger('click')
    expect(wrapper.text()).toContain('1 marcado')
    await boxes[0].trigger('click')
    await boxes[0].trigger('click')
    expect(wrapper.text()).not.toContain('marcado')
  })

  it('reports a partial bulk result', async () => {
    await mountView()
    await click('Sin sentar')
    const boxes = wrapper.findAll('[role="checkbox"]')
    for (const i of [1, 2]) await boxes[i].trigger('click')
    await click('Sentar en...')
    state.tables[0].seats.push(g(104, 'Race')) // somebody else takes a seat meanwhile
    await click('Honor', sheet())
    expect(lastToast().tone).toBe('warning')
    expect(lastToast().title).toContain('no se pudieron sentar')
  })

  it('shows the companion of whoever comes with someone', async () => {
    await mountView()
    await click('Sin sentar')
    expect(wrapper.text()).toContain('Acompañante de Rosa Fernandez')
  })

  it('moves a guest from the table detail', async () => {
    await mountView()
    await click('Honor')
    const modal = wrapper.find('.modal[data-title="Honor"]')
    expect(modal.text()).toContain('Reservada para: Padres')
    expect(modal.text()).toContain('quedan 2 libres')
    await modal.find('button[aria-label="Mover a Valentina a otra mesa"]').trigger('click')
    await flushPromises()
    expect(sheet().text()).toContain('Mover a Valentina a')
    expect(sheet().text()).toContain('Ahora está en Honor.')
    expect(btn('Honor', sheet())).toBeUndefined()
    await click('Familia', sheet())
    expect(api.post).toHaveBeenCalledWith('event/1/seating/move', { guest_id: 101, to_table_id: 2 })
    expect(lastToast().title).toBe('Valentina se movió a Familia.')
  })

  it('keeps the guest and explains when the target is full (table_full)', async () => {
    await mountView()
    await click('Honor')
    await wrapper.find('button[aria-label="Mover a Valentina a otra mesa"]').trigger('click')
    await flushPromises()
    failNext = { move: fail(422, { code: 'table_full' }) }
    await click('Familia', sheet())
    expect(lastToast().title).toContain('ya está llena')
    expect(api.get).toHaveBeenCalled()
  })

  it('says so when the guest is already at that table', async () => {
    await mountView()
    await click('Honor')
    await wrapper.find('button[aria-label="Mover a Valentina a otra mesa"]').trigger('click')
    await flushPromises()
    failNext = { move: fail(422, { code: 'same_table' }) }
    await click('Familia', sheet())
    expect(lastToast().title).toContain('ya está en esa mesa')
  })

  it('removes a guest from the table after confirming', async () => {
    await mountView()
    await click('Honor')
    await wrapper.find('button[aria-label="Quitar a Padre de la mesa"]').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('¿Quitar a Padre de Honor?')
    await click('Quitar', wrapper.find('.modal[data-title="Quitar de la mesa"]'))
    expect(api.delete).toHaveBeenCalledWith('event/1/tables/1/guest/102')
    expect(lastToast().title).toBe('Padre salió de Honor.')
  })

  it('goes from the table detail to the unseated list', async () => {
    await mountView()
    await click('Familia')
    await click('Sentar invitados')
    expect(wrapper.find('#seating-unassigned-title').exists()).toBe(true)
    expect(wrapper.find('.modal[data-title="Familia"]').exists()).toBe(false)
  })

  it('previews who loses the table before deleting, and reports them after', async () => {
    await mountView()
    await click('Eliminar Honor'.replace('Eliminar ', '')) // open to make sure list renders
    wrapper.unmount()
    await mountView()
    await wrapper.find('button[aria-label="Eliminar Honor"]').trigger('click')
    await flushPromises()
    const del = wrapper.find('.modal[data-title="Eliminar mesa"]')
    expect(del.text()).toContain('2 invitados sentados')
    expect(del.text()).toContain('Valentina, Padre')
    await click('Eliminar mesa', del)
    expect(lastToast().title).toContain('2 invitados volvieron a "Sin sentar"')
  })

  it('deletes an empty table with the plain toast', async () => {
    await mountView()
    await wrapper.find('button[aria-label="Eliminar Familia"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('.modal[data-title="Eliminar mesa"]').text()).toContain('La mesa está vacía')
    await click('Eliminar mesa', wrapper.find('.modal[data-title="Eliminar mesa"]'))
    expect(lastToast().title).toBe('Mesa "Familia" eliminada.')
  })

  it('asks with the exact count before emptying every table', async () => {
    await mountView()
    await click('Vaciar todas las mesas')
    const modal = wrapper.find('.modal[data-title="Vaciar todas las mesas"]')
    expect(modal.text()).toContain('3 personas')
    expect(api.delete).not.toHaveBeenCalled()
    await click('Sí, vaciar (3 personas)', modal)
    expect(api.delete).toHaveBeenCalledWith('event/1/seating/clear-all')
    expect(lastToast().title).toContain('3 personas volvieron')
    expect(btn('Vaciar todas las mesas')).toBeUndefined()
  })

  it('can cancel the clear-all', async () => {
    await mountView()
    await click('Vaciar todas las mesas')
    await click('Cancelar', wrapper.find('.modal[data-title="Vaciar todas las mesas"]'))
    expect(wrapper.find('.modal[data-title="Vaciar todas las mesas"]').exists()).toBe(false)
  })

  it('reports clear-all failures', async () => {
    await mountView()
    await click('Vaciar todas las mesas')
    failNext = { delete: fail(500) }
    await click('Sí, vaciar', wrapper.find('.modal[data-title="Vaciar todas las mesas"]'))
    expect(lastToast().tone).toBe('danger')
  })

  it.each([
    [409, { }, 'ya no existe'],
    [404, {}, 'ya no existe'],
    [422, { message: 'Guest is already assigned' }, 'ya tiene mesa'],
    [422, {}, 'Revisa los datos'],
    [500, {}, 'Algo salió mal']
  ])('shows a specific toast for status %s', async (status, data, text) => {
    await mountView()
    await click('Sin sentar')
    failNext = { post: fail(status === 409 ? 404 : status, data) }
    await wrapper.findAll('button').filter(b => b.text() === 'Sentar')[0].trigger('click')
    await flushPromises()
    await click('Familia', sheet())
    expect(lastToast().title).toContain(text)
  })

  it('creates a table, validating like the API', async () => {
    await mountView()
    await click('Nueva mesa')
    const form = wrapper.find('form')
    await form.trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('Ponle un nombre a la mesa.')
    expect(api.post).not.toHaveBeenCalled()
    const inputs = form.findAll('input')
    const submit = () => form.trigger('submit').then(flushPromises)
    await inputs[0].setValue('x'.repeat(50))
    await inputs[1].setValue('80')
    await submit()
    expect(wrapper.text()).toContain('hasta 50 plazas')
    await inputs[1].setValue('8')
    await submit()
    expect(api.post).toHaveBeenCalledWith('event/1/tables', expect.objectContaining({ capacity: 8, priority: 5 }))
    expect(lastToast().tone).toBe('success')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('edits a table and says so when the API refuses', async () => {
    await mountView()
    await wrapper.find('button[aria-label="Editar Honor"]').trigger('click')
    await flushPromises()
    failNext = { put: fail(422, {}) }
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(lastToast().title).toContain('Revisa los datos')
    failNext = null
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(lastToast().title).toBe('Mesa "Honor" actualizada.')
  })

  it('searches, filters and pages the unseated list', async () => {
    state.guests = Array.from({ length: 30 }, (_, i) => g(200 + i, `Invitado ${i + 1}`, i < 5 ? 'pending' : 'attending'))
    await mountView()
    await click('Sin sentar')
    expect(wrapper.findAll('li').filter(li => li.text().includes('Invitado')).length).toBe(25)
    await click('Ver 5 más')
    expect(wrapper.text()).toContain('Invitado 30')
    await wrapper.find('input[type="search"]').setValue('Invitado 2')
    expect(wrapper.text()).not.toContain('Invitado 30')
    await wrapper.find('input[type="search"]').setValue('zzz')
    expect(wrapper.text()).toContain('Prueba con otra búsqueda')
    await wrapper.find('input[type="search"]').setValue('')
    await click('Pendientes')
    expect(wrapper.text()).toContain('Invitado 1')
  })

  it('says everybody has a table when nobody is left', async () => {
    state.guests = []
    await mountView()
    await click('Sin sentar')
    expect(wrapper.text()).toContain('Todos tus invitados ya tienen mesa.')
  })

  it('shows an empty state without tables and an error state with retry', async () => {
    state.tables = []
    await mountView()
    expect(wrapper.text()).toContain('Aún no tienes mesas')
    wrapper.unmount()
    failNext = { get: true }
    await mountView()
    expect(wrapper.text()).toContain('No pudimos cargar tus mesas')
    expect(toasts.toast).toHaveBeenCalled()
    failNext = null
    reset()
    await click('Intentar de nuevo')
    expect(wrapper.text()).toContain('Honor')
  })

  it('offers no table to seat at when none exists', async () => {
    state.tables = []
    await mountView()
    await click('Sin sentar')
    const seat = wrapper.findAll('button').find(b => b.text() === 'Sentar')
    expect(seat.attributes('disabled')).toBeDefined()
  })

  it('counts the seated from the guests listed, not from a separate counter (ghost seats)', async () => {
    state.tables[0].seats = [g(101, 'Valentina')]
    const original = tableJson
    api.get.mockImplementation(url => {
      if (url.endsWith('/seating/unassigned')) return Promise.resolve({ data: { data: [] } })
      // the API says 2 seats are taken but lists a single person
      return Promise.resolve({ data: { data: [{ ...original(state.tables[0]), available_seats: 2 }] } })
    })
    await mountView()
    expect(wrapper.text()).toContain('1 de 4')
    expect(wrapper.text()).toContain('1/4')
  })

  it('shows the sheet empty state when no other table exists to move to', async () => {
    state.tables = [state.tables[0]]
    await mountView()
    await click('Honor')
    await wrapper.find('button[aria-label="Mover a Valentina a otra mesa"]').trigger('click')
    await flushPromises()
    expect(sheet().text()).toContain('No hay otra mesa disponible')
  })

  it('closes the sheet and the details from their close controls', async () => {
    await mountView()
    await click('Honor')
    await wrapper.find('button[aria-label="Mover a Valentina a otra mesa"]').trigger('click')
    await flushPromises()
    await sheet().find('.modal-x').trigger('click')
    expect(sheet().exists()).toBe(false)
    await wrapper.find('.modal[data-title="Honor"] .modal-x').trigger('click')
    expect(wrapper.find('.modal[data-title="Honor"]').exists()).toBe(false)
  })
})

describe('SeatingView extras', () => {
  it('switches tabs from the tab bar', async () => {
    await mountView()
    wrapper.findComponent(UiTabs).vm.$emit('update:modelValue', 'unassigned')
    await flushPromises()
    expect(wrapper.find('section[aria-labelledby="seating-unassigned-title"]').classes()).toContain('block')
  })

  it('creates the first table from the empty state', async () => {
    state.tables = []
    await mountView()
    const buttons = wrapper.findAll('button').filter(b => b.text().includes('Nueva mesa'))
    await buttons.at(-1).trigger('click')
    expect(wrapper.find('form').exists()).toBe(true)
    await wrapper.find('.modal-x').trigger('click')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('shows the template notice when the API refuses the first table', async () => {
    state.tables = []
    await mountView()
    await wrapper.findAll('button').filter(b => b.text().includes('Nueva mesa'))[0].trigger('click')
    failNext = { post: fail(409, { code: 'template_missing_module', module: 'seating', template: { slug: 'm', name: 'Mínima' } }) }
    const inputs = wrapper.find('form').findAll('input')
    await inputs[0].setValue('Mesa 1')
    await inputs[1].setValue('4')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.html()).toContain('module-template-notice')
  })

  it('cancels the delete and remove confirmations', async () => {
    await mountView()
    await wrapper.find('button[aria-label="Eliminar Honor"]').trigger('click')
    await flushPromises()
    await click('Cancelar', wrapper.find('.modal[data-title="Eliminar mesa"]'))
    expect(wrapper.find('.modal[data-title="Eliminar mesa"]').exists()).toBe(false)
    await click('Honor')
    await wrapper.find('button[aria-label="Quitar a Padre de la mesa"]').trigger('click')
    await flushPromises()
    await click('Cancelar', wrapper.find('.modal[data-title="Quitar de la mesa"]'))
    expect(wrapper.find('.modal[data-title="Quitar de la mesa"]').exists()).toBe(false)
  })

  it('unticks a single guest', async () => {
    await mountView()
    const boxes = () => wrapper.findAll('[role="checkbox"]')
    await boxes()[2].trigger('click')
    expect(wrapper.text()).toContain('1 marcado')
    await boxes()[2].trigger('click')
    expect(wrapper.text()).not.toContain('1 marcado')
  })

  it('tolerates tables without a capacity', async () => {
    state.tables = [{ id: 1, name: 'X', priority: 1, seats: [] }]
    await mountView()
    expect(wrapper.text()).toContain('0/0')
  })
})

describe('SeatingView (desktop)', () => {
  it('keeps a table open in the detail panel and shows its facts', async () => {
    await mountView({ desktop: true })
    expect(wrapper.text()).toContain('Honor')
    expect(wrapper.text()).toContain('Reservada para: Padres')
    expect(wrapper.text()).toContain('Valentina')
  })

  it('selects another table and keeps the selection after deleting the open one', async () => {
    await mountView({ desktop: true })
    await click('Familia')
    expect(wrapper.text()).toContain('Nadie sentado todavía')
    await wrapper.find('button[aria-label="Eliminar Familia"]').trigger('click')
    await flushPromises()
    await click('Eliminar mesa', wrapper.find('.modal[data-title="Eliminar mesa"]'))
    const store = useSeatingStore()
    expect(store.selectedTable).not.toBeNull()
    expect(store.selectedTable.name).not.toBe('Familia')
  })

  it('removes a guest from the desktop panel', async () => {
    await mountView({ desktop: true })
    await wrapper.find('button[aria-label="Quitar a Padre de la mesa"]').trigger('click')
    await flushPromises()
    await click('Quitar', wrapper.find('.modal[data-title="Quitar de la mesa"]'))
    expect(api.delete).toHaveBeenCalledWith('event/1/tables/1/guest/102')
  })

  it('moves a guest from the desktop panel', async () => {
    await mountView({ desktop: true })
    await wrapper.find('button[aria-label="Mover a Padre a otra mesa"]').trigger('click')
    await flushPromises()
    expect(sheet().text()).toContain('Mover a Padre a')
  })

  it('opens the sheet for the table shown first', async () => {
    await mountView({ desktop: true })
    await wrapper.findAll('button').find(b => b.text() === 'Sentar').trigger('click')
    await flushPromises()
    expect(sheet().text()).toContain('Mesa abierta')
  })
})
