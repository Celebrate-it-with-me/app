import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import es from '@/locales/es'
import en from '@/locales/en'

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: api }))
const toasts = vi.hoisted(() => ({ toast: vi.fn() }))
vi.mock('@/ui', async importOriginal => ({ ...(await importOriginal()), useToast: () => toasts }))
const events = vi.hoisted(() => ({ activeEvent: { id: 1 } }))
vi.mock('@/modules/events/stores/useEventsStore', () => ({ useEventsStore: () => events }))

import { useSeatingStore } from '../stores/useSeatingStore'
import { useSeatingController } from '../composables/useSeatingController'
import { useMediaQuery } from '../composables/useMediaQuery'
import SeatingSeatSheet from '../components/SeatingSeatSheet.vue'
import SeatingTableDetails from '../components/SeatingTableDetails.vue'
import SeatingTablesList from '../components/SeatingTablesList.vue'
import SeatingUnassignedGuests from '../components/SeatingUnassignedGuests.vue'
import SeatingDeleteTableModal from '../components/SeatingDeleteTableModal.vue'
import SeatingRemoveGuestModal from '../components/SeatingRemoveGuestModal.vue'
import SeatingClearAllModal from '../components/SeatingClearAllModal.vue'
import SeatingTableFormModal from '../components/SeatingTableFormModal.vue'
import route from '../routes/seating.route'

const Modal = {
  props: ['open', 'title', 'description'],
  emits: ['update:open'],
  template: '<div v-if="open" class="modal"><h2>{{ title }}</h2><p>{{ description }}</p><button class="modal-x" @click="$emit(\'update:open\', false)">x</button><slot /><slot name="footer" /></div>'
}
const i18n = (locale = 'es') => createI18n({ legacy: false, locale, fallbackLocale: 'es', messages: { es, en } })
const mountC = (component, props = {}, locale) =>
  mount(component, { props, global: { plugins: [i18n(locale)], stubs: { UiModal: Modal } } })

const g = (id, name, rsvpStatus = 'attending', extra = {}) => ({ id, name, rsvpStatus, ...extra })
const table = (id, name, capacity, guests = [], extra = {}) => ({ id, name, capacity, type: 'general', priority: 5, assigned_guests: guests, ...extra })
const apiError = (status, data = {}) => Object.assign(new Error('x'), { response: { status, data } })

beforeEach(() => {
  setActivePinia(createPinia())
  Object.values(api).forEach(fn => fn.mockReset())
  toasts.toast.mockReset()
  events.activeEvent = { id: 1 }
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
})

describe('useSeatingStore edges', () => {
  it('works without an active event and with empty answers', async () => {
    events.activeEvent = null
    api.get.mockResolvedValue({ data: {} })
    const store = useSeatingStore()
    await store.refresh()
    expect(api.get).toHaveBeenCalledWith('event/0/tables')
    expect(store.tables).toEqual([])
    expect(store.unassigned).toEqual([])
  })

  it('drops the selection when its table disappears', async () => {
    api.get.mockImplementation(url => Promise.resolve({ data: { data: url.endsWith('unassigned') ? [] : [table(2, 'B', 2)] } }))
    const store = useSeatingStore()
    store.selectTable({ id: 1 })
    await store.loadEventTables()
    expect(store.selectedTableId).toBeNull()
    store.selectTable(null)
    expect(store.selectedTableId).toBeNull()
  })

  it('creates, updates and deletes tables', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    api.post.mockResolvedValueOnce({ data: { data: table(5, 'New', 4) } })
    const store = useSeatingStore()
    const created = await store.createTable({ name: 'New', capacity: 4 })
    expect(created.id).toBe(5)
    expect(store.selectedTableId).toBe(5)
    api.post.mockResolvedValueOnce({})
    await expect(store.createTable({ name: 'x' })).rejects.toThrow('Failed to create table')
    api.put.mockResolvedValue({})
    await store.updateTable(5, { name: 'N2' })
    expect(api.put).toHaveBeenCalled()
    api.delete.mockResolvedValue({})
    expect(await store.deleteTable(5)).toBe(0)
    expect(store.selectedTableId).toBeNull()
    api.delete.mockResolvedValue({ data: { meta: { guests_unassigned: 3 } } })
    expect(await store.deleteTable(7)).toBe(3)
  })

  it('assign and remove need a table', async () => {
    const store = useSeatingStore()
    await store.assignGuestToTable(1)
    await store.removeGuestFromTable(1)
    expect(api.post).not.toHaveBeenCalled()
    expect(api.delete).not.toHaveBeenCalled()
    api.get.mockImplementation(url => Promise.resolve({ data: { data: url.endsWith('unassigned') ? [] : [table(4, 'D', 2)] } }))
    api.post.mockResolvedValue({})
    api.delete.mockResolvedValue({})
    store.selectTable({ id: 4 })
    await store.assignGuestToTable(1)
    await store.removeGuestFromTable(1)
    expect(api.post).toHaveBeenCalledWith('event/1/tables/4/assign', { guest_id: 1 })
    expect(api.delete).toHaveBeenCalledWith('event/1/tables/4/guest/1')
  })

  it('reads the bulk answer in its different shapes', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    const store = useSeatingStore()
    api.post.mockResolvedValueOnce({ data: { meta: { total_assigned: 2, errors: ['x'] } } })
    expect(await store.bulkAssign(1, [1, 2, 3])).toEqual({ seated: 2, failed: 1 })
    api.post.mockResolvedValueOnce({ data: { meta: { assigned: 3, failed: 2 } } })
    expect(await store.bulkAssign(1, [1])).toEqual({ seated: 3, failed: 2 })
    api.post.mockResolvedValueOnce({})
    expect(await store.bulkAssign(1, [1])).toEqual({ seated: 0, failed: 0 })
    api.post.mockResolvedValueOnce({ data: { meta: {} } })
    expect(await store.bulkAssign(1, [1])).toEqual({ seated: 0, failed: 0 })
  })

  it('resyncs after a failed bulk or move, even if the resync fails too', async () => {
    api.get.mockRejectedValue(new Error('down'))
    const store = useSeatingStore()
    api.post.mockRejectedValue(apiError(500))
    await expect(store.bulkAssign(1, [1])).rejects.toBeTruthy()
    api.delete.mockResolvedValue({})
    await expect(store.moveGuest(1, 2, 3)).rejects.toBeTruthy()
    expect(api.get).toHaveBeenCalled()
  })

  it('clears everything and reports how many', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    api.delete.mockResolvedValueOnce({ data: { meta: { guests_unassigned: 4 } } })
    const store = useSeatingStore()
    expect(await store.clearAll()).toBe(4)
    api.delete.mockResolvedValueOnce({})
    expect(await store.clearAll()).toBe(0)
  })
})

const host = defineComponent({
  setup() {
    return useSeatingController()
  },
  render: () => h('div')
})
let ctl
const mountCtl = async () => {
  ctl = mount(host, { global: { plugins: [i18n()] } })
  await flushPromises()
  return ctl.vm
}

describe('useSeatingController edges', () => {
  const tables = [table(1, 'A', 2, [g(10, 'Ten')]), table(2, 'B', 2)]
  beforeEach(() => {
    api.get.mockImplementation(url => Promise.resolve({ data: { data: url.endsWith('unassigned') ? [g(1, 'One'), g(2, 'Two')] : tables } }))
  })
  afterEach(() => ctl?.unmount())

  it('ignores actions with nothing to act on', async () => {
    const c = await mountCtl()
    c.openSeat([])
    c.openSeat(null)
    expect(c.seatSheet).toBeNull()
    c.openMove(g(10, 'Ten'))
    expect(c.seatSheet).toBeNull()
    await c.seatAt(tables[0])
    await c.confirmDelete()
    await c.confirmRemoveGuest()
    expect(api.post).not.toHaveBeenCalled()
    expect(api.delete).not.toHaveBeenCalled()
  })

  it('opens a single guest, seats at a table and clears its tick', async () => {
    const c = await mountCtl()
    c.toggleSelect(g(1, 'One'))
    c.openSeat(g(1, 'One'))
    expect(c.seatSheet.guests).toHaveLength(1)
    api.post.mockResolvedValue({})
    await c.seatAt()
    expect(api.post).not.toHaveBeenCalled()
    await c.seatAt(tables[1])
    expect(c.selectedIds).toEqual([])
    expect(c.seatSheet).toBeNull()
  })

  it('bulk without failures says how many were seated', async () => {
    const c = await mountCtl()
    api.post.mockResolvedValue({ data: { meta: { total_assigned: 2, errors: [] } } })
    c.openSeat([g(1, 'One'), g(2, 'Two')])
    await c.seatAt(tables[1])
    expect(toasts.toast.mock.calls.at(-1)[0].title).toContain('2 invitados sentados en B')
  })

  it('shows the failure toast and resyncs when seating fails, even when the resync fails', async () => {
    const c = await mountCtl()
    api.post.mockRejectedValue(apiError(422, { code: 'table_full' }))
    c.openSeat(g(1, 'One'))
    api.get.mockRejectedValue(new Error('down'))
    await c.seatAt(tables[1])
    expect(toasts.toast.mock.calls.at(-1)[0].tone).toBe('warning')
    expect(c.saving).toBe(false)
  })

  it('reports failures when deleting a table and removing a guest', async () => {
    const c = await mountCtl()
    c.selectTable(tables[0])
    expect(c.showDetailsModal).toBe(true)
    c.tableToDelete = tables[0]
    api.delete.mockRejectedValue(apiError(500))
    await c.confirmDelete()
    expect(toasts.toast.mock.calls.at(-1)[0].tone).toBe('danger')
    c.guestToRemove = g(10, 'Ten')
    await c.confirmRemoveGuest()
    expect(toasts.toast.mock.calls.at(-1)[0].tone).toBe('danger')
  })

  it('closes the phone detail when the open table is deleted', async () => {
    const c = await mountCtl()
    c.selectTable(tables[1])
    api.delete.mockResolvedValue({ data: { meta: { guests_unassigned: 0 } } })
    api.get.mockImplementation(url => Promise.resolve({ data: { data: url.endsWith('unassigned') ? [] : [tables[0]] } }))
    c.tableToDelete = tables[1]
    await c.confirmDelete()
    expect(c.showDetailsModal).toBe(false)
  })

  it('walks the unseated pages and resets them when filtering', async () => {
    api.get.mockImplementation(url => Promise.resolve({ data: { data: url.endsWith('unassigned') ? Array.from({ length: 60 }, (_, i) => g(i + 1, `G${i + 1}`)) : [] } }))
    const c = await mountCtl()
    expect(c.visibleUnassigned).toHaveLength(25)
    expect(c.hiddenCount).toBe(35)
    c.showMore()
    expect(c.visibleUnassigned).toHaveLength(50)
    c.search = 'G1'
    await flushPromises()
    expect(c.visibleUnassigned.length).toBeLessThan(25)
    c.status = 'pending'
    await flushPromises()
    expect(c.visibleUnassigned).toHaveLength(0)
  })

  it('retries a failed load', async () => {
    api.get.mockRejectedValue(new Error('down'))
    const c = await mountCtl()
    expect(c.loadFailed).toBe(true)
    api.get.mockImplementation(url => Promise.resolve({ data: { data: url.endsWith('unassigned') ? [] : tables } }))
    await c.load()
    expect(c.loadFailed).toBe(false)
    expect(c.tables).toHaveLength(2)
  })

  it('names the host through companionOf coming from the API', async () => {
    api.get.mockImplementation(url => Promise.resolve({ data: { data: url.endsWith('unassigned') ? [g(1, 'One', 'attending', { companionOf: { id: 9, name: 'Host' } })] : [] } }))
    const c = await mountCtl()
    expect(c.companionName(c.unassigned[0])).toBe('Host')
    expect(c.groupSize(c.unassigned[0])).toBe(1)
  })
})

describe('useMediaQuery', () => {
  const Probe = defineComponent({
    props: { query: { type: String, default: '(min-width: 1px)' } },
    setup(p) {
      const matches = useMediaQuery(p.query)
      return () => h('p', String(matches.value))
    }
  })

  it('follows changes of the media query and cleans up', async () => {
    let listener
    const mql = { matches: true, addEventListener: (_, fn) => (listener = fn), removeEventListener: vi.fn() }
    window.matchMedia = () => mql
    const w = mount(Probe)
    expect(w.text()).toBe('true')
    listener({ matches: false })
    await flushPromises()
    expect(w.text()).toBe('false')
    w.unmount()
    expect(mql.removeEventListener).toHaveBeenCalled()
  })

  it('is false without matchMedia', () => {
    window.matchMedia = undefined
    expect(mount(Probe).text()).toBe('false')
  })
})

describe('components', () => {
  it('seat sheet explains itself for moves, families and empty cases, in both languages', () => {
    const tables = [table(1, 'A', 4, [g(1, 'x')]), table(2, 'B', 2, [g(2, 'y'), g(3, 'z')])]
    const w = mountC(SeatingSeatSheet, { guests: [g(9, 'Nine', 'not-attending')], tables, fromTable: tables[0], preferredId: 2 }, 'en')
    expect(w.text()).toContain('Move Nine to')
    expect(w.text()).toContain('Currently at A.')
    expect(w.text()).toContain('Full')
    const many = mountC(SeatingSeatSheet, { guests: Array.from({ length: 5 }, (_, i) => g(i, `P${i}`, i < 3 ? 'not-attending' : 'attending')), tables })
    expect(many.text()).toContain('Sentar 5 invitados')
    expect(many.text()).toContain('+2 más')
    expect(many.text()).toContain('dijeron que no asisten')
    expect(many.text()).toContain('+1 más')
    many.findAll('button').find(b => b.text().includes('A'))
    const none = mountC(SeatingSeatSheet, { guests: [g(1, 'One')], tables: [] })
    expect(none.text()).toContain('No hay otra mesa disponible')
    const closed = mountC(SeatingSeatSheet, { guests: [], tables, fromTable: tables[0] })
    expect(closed.find('.modal').exists()).toBe(false)
  })

  it('seat sheet emits pick and close', async () => {
    const tables = [table(1, 'A', 4)]
    const w = mountC(SeatingSeatSheet, { guests: [g(1, 'One')], tables })
    await w.find('li button').trigger('click')
    expect(w.emitted('pick')[0][0].id).toBe(1)
    await w.find('.modal-x').trigger('click')
    expect(w.emitted('close')).toHaveLength(1)
  })

  it('table details cover every guest state and emit actions', async () => {
    const tableObj = table(1, 'A', 2, [g(1, 'One', 'pending', { companionOf: { id: 5, name: 'Host' } }), g(2, 'Two', null)], { type: undefined, location: 'back', reserved_for: 'Todos' })
    const w = mountC(SeatingTableDetails, { table: tableObj, showAssign: true, companionName: x => x.companionOf?.name ?? '' })
    expect(w.text()).toContain('Acompañante de Host')
    expect(w.text()).toContain('Llena')
    expect(w.text()).toContain('Al fondo')
    await w.findAll('button[aria-label^="Mover"]')[0].trigger('click')
    await w.findAll('button[aria-label^="Quitar"]')[0].trigger('click')
    expect(w.emitted('move-guest')).toHaveLength(1)
    expect(w.emitted('remove-guest')).toHaveLength(1)
    const roomy = mountC(SeatingTableDetails, { table: table(2, 'B', 3, [], { type: 'vip' }), showAssign: true })
    await roomy.findAll('button').find(b => b.text().includes('Sentar invitados')).trigger('click')
    expect(roomy.emitted('assign')).toHaveLength(1)
    expect(roomy.text()).toContain('quedan 3 libres')
    expect(mountC(SeatingTableDetails, { table: null }).text()).toContain('Elige una mesa')
  })

  it('tables list renders every state and emits', async () => {
    const list = [
      table(1, 'Full', 1, [g(1, 'x')], { type: 'vip', location: 'front', reserved_for: 'R' }),
      table(2, 'Almost', 4, [g(1, 'a'), g(2, 'b'), g(3, 'c')], { type: undefined, reserved_for: 'Only note' }),
      table(3, 'Empty', 4, [], { location: 'center' })
    ]
    const w = mountC(SeatingTablesList, { tables: list, selectedId: 3 })
    expect(w.findAll('[role="progressbar"]')).toHaveLength(3)
    await w.findAll('button[aria-label^="Editar"]')[0].trigger('click')
    await w.findAll('button[aria-label^="Eliminar"]')[0].trigger('click')
    await w.findAll('button[aria-pressed]')[0].trigger('click')
    expect(w.emitted('edit')).toHaveLength(1)
    expect(w.emitted('delete')).toHaveLength(1)
    expect(w.emitted('select')).toHaveLength(1)
    const loading = mountC(SeatingTablesList, { loading: true })
    expect(loading.attributes('aria-busy')).toBe('true')
    const empty = mountC(SeatingTablesList, {})
    await empty.find('button').trigger('click')
    expect(empty.emitted('create')).toHaveLength(1)
    const failed = mountC(SeatingTablesList, { failed: true })
    await failed.find('button').trigger('click')
    expect(failed.emitted('retry')).toHaveLength(1)
  })

  it('unassigned list emits its events and handles missing statuses', async () => {
    const guests = [g(1, 'One', null), g(2, 'Two', 'attending', { parentId: 1 })]
    const w = mountC(SeatingUnassignedGuests, {
      guests, total: 2, hiddenCount: 3, selectedIds: [1], counts: { all: 2, attending: 1, pending: 1, 'not-attending': 0 },
      groupSize: x => (x.id === 1 ? 2 : 1), companionName: x => (x.parentId ? 'One' : '')
    })
    await w.find('input[type="search"]').setValue('x')
    expect(w.emitted('update:search')[0]).toEqual(['x'])
    await w.findAll('button[aria-pressed]')[1].trigger('click')
    expect(w.emitted('update:status')[0]).toEqual(['attending'])
    await w.findAll('button').find(b => b.text() === 'Sentar en...').trigger('click')
    await w.findAll('button').find(b => b.text() === 'Quitar marcas').trigger('click')
    await w.findAll('button').find(b => b.text().includes('Ver 3 más')).trigger('click')
    await w.find('button[aria-label^="Marcar a su grupo"]').trigger('click')
    expect(w.emitted('seat-selected')).toHaveLength(1)
    expect(w.emitted('clear-selection')).toHaveLength(1)
    expect(w.emitted('show-more')).toHaveLength(1)
    expect(w.emitted('toggle-group')).toHaveLength(1)
    await w.findAll('button').filter(b => b.text() === 'Sentar')[0].trigger('click')
    expect(w.emitted('seat')[0][0].id).toBe(1)
    const noTables = mountC(SeatingUnassignedGuests, { guests, total: 2, hasTables: false, selectedIds: [1] })
    expect(noTables.findAll('button').filter(b => b.text() === 'Sentar')[0].attributes('disabled')).toBeDefined()
    expect(noTables.text()).toContain('Sentar en...')
    const declined = mountC(SeatingUnassignedGuests, { guests, total: 2, counts: { all: 1, attending: 0, pending: 0, 'not-attending': 1 } })
    expect(declined.text()).toContain('no necesitan mesa')
  })

  it('confirmation modals emit close and confirm', async () => {
    const del = mountC(SeatingDeleteTableModal, { table: table(1, 'A', 2, [g(1, 'a'), g(2, 'b'), g(3, 'c'), g(4, 'd'), g(5, 'e')]) })
    expect(del.text()).toContain('a, b, c, d +1 más')
    await del.findAll('button').find(b => b.text() === 'Cancelar').trigger('click')
    await del.findAll('button').find(b => b.text() === 'Eliminar mesa').trigger('click')
    await del.find('.modal-x').trigger('click')
    expect(del.emitted('close')).toHaveLength(2)
    expect(del.emitted('confirm')).toHaveLength(1)
    expect(mountC(SeatingDeleteTableModal, { table: null }).find('.modal').exists()).toBe(false)
    const noName = mountC(SeatingDeleteTableModal, { table: { id: 1, name: 'A', capacity: 4, assigned_guests: [g(1, null)] } })
    expect(noName.exists()).toBe(true)
    const noList = mountC(SeatingDeleteTableModal, { table: { id: 1, name: 'A', capacity: 4, available_seats: 2 } })
    expect(noList.text()).toContain('2 invitados')

    const rm = mountC(SeatingRemoveGuestModal, { guest: g(1, 'a'), table: table(1, 'A', 2) })
    await rm.findAll('button').find(b => b.text() === 'Cancelar').trigger('click')
    await rm.findAll('button').find(b => b.text() === 'Quitar').trigger('click')
    await rm.find('.modal-x').trigger('click')
    expect(rm.emitted('close')).toHaveLength(2)
    expect(rm.emitted('confirm')).toHaveLength(1)
    expect(mountC(SeatingRemoveGuestModal, {}).find('.modal').exists()).toBe(false)

    const clear = mountC(SeatingClearAllModal, { open: true, count: 1 })
    expect(clear.text()).toContain('1 persona')
    await clear.findAll('button').find(b => b.text() === 'Cancelar').trigger('click')
    await clear.findAll('button').find(b => b.text().startsWith('Sí')).trigger('click')
    await clear.find('.modal-x').trigger('click')
    expect(clear.emitted('close')).toHaveLength(2)
    expect(clear.emitted('confirm')).toHaveLength(1)
  })

  it('table form loads a table, resets, validates live and cancels', async () => {
    const w = mountC(SeatingTableFormModal, { open: false, table: table(1, 'Honor', 6, [], { type: 'vip', priority: 9, reserved_for: 'R', location: 'front' }) })
    await w.setProps({ open: true })
    const inputs = w.findAll('input')
    expect(inputs[0].element.value).toBe('Honor')
    await w.find('form').trigger('submit')
    expect(w.emitted('save')[0][0]).toMatchObject({ name: 'Honor', capacity: 6, priority: 9 })
    await inputs[0].setValue('')
    await w.find('form').trigger('submit')
    expect(w.text()).toContain('Ponle un nombre')
    await inputs[0].setValue('x'.repeat(51))
    await w.vm.$nextTick()
    expect(w.text()).toContain('hasta 50 letras')
    await w.find('input[type="range"]').setValue(3)
    await w.find('input[placeholder="Ej. familia paterna"]').setValue('y'.repeat(101))
    await w.vm.$nextTick()
    expect(w.text()).toContain('hasta 100 letras')
    await w.findAll('button').find(b => b.text() === 'Cancelar').trigger('click')
    expect(w.emitted('update:open')[0]).toEqual([false])
    await w.find('.modal-x').trigger('click')
    await w.setProps({ open: false })
    await w.setProps({ open: true, table: null })
    expect(w.findAll('input')[0].element.value).toBe('')
    expect(w.text()).toContain('Crear mesa')
  })

  it('table helpers cope with half-empty tables', async () => {
    const u = await import('../utils/seating')
    expect(u.tableToForm(null)).toMatchObject({ name: '', capacity: '', type: 'general', priority: 5, location: 'none' })
    expect(u.tableToForm({})).toMatchObject({ reserved_for: '' })
    expect(u.formToPayload({ capacity: '4' })).toMatchObject({ name: '', capacity: 4, reserved_for: null, location: null })
    expect(u.assignedCount(null)).toBe(0)
    expect(u.assignedCount({ capacity: 4, available_seats: 1 })).toBe(3)
    expect(u.seatsLeft(null)).toBe(0)
    expect(u.occupancyPercent({})).toBe(0)
    expect(u.sortTables([{ name: 'b' }, { name: 'a' }, { name: null }]).map(x => x.name)).toEqual([null, 'a', 'b'])
    expect(u.sortTables(undefined)).toEqual([])
    expect(u.groupTablesByType(undefined)).toEqual([])
    expect(u.filterUnassigned(undefined)).toEqual([])
    expect(u.filterUnassigned([{ name: null }], { search: 'a' })).toEqual([])
    expect(u.countByStatus(undefined).all).toBe(0)
    expect(u.countByStatus([{ rsvpStatus: 'zz' }]).all).toBe(1)
  })

  it('has its route', () => {
    expect(route[0].meta.requiresFeature).toBe('seating')
    expect(typeof route[0].component).toBe('function')
  })
})
