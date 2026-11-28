import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'

const svc = vi.hoisted(() => ({ download: vi.fn(), downloadVenue: vi.fn() }))
vi.mock('../services/RosterService', () => ({ default: svc }))
const saved = vi.hoisted(() => ({ saveBlob: vi.fn() }))
vi.mock('../utils/roster', async importOriginal => ({ ...(await importOriginal()), saveBlob: saved.saveBlob }))

import GuestList from '../components/GuestList.vue'
import GuestRow from '../components/GuestRow.vue'
import GuestItem from '../components/GuestItem.vue'
import GuestActionSheet from '../components/GuestActionSheet.vue'
import { useRosterDownload } from '../composables/useRosterDownload'

const family = (id, name, extra = {}) => ({ id, name, phone: '+13055550123', email: null, status: 'pending', link: `https://q.test/i/xv/${id}`, companions: [], notes: null, locale: null, delivery: { state: 'none' }, ...extra })
const FAMILIES = [family(1, 'Ana Perez'), family(2, 'Beto Ruiz')]
const media = matches => vi.stubGlobal('matchMedia', query => ({ matches, media: query, addEventListener() {}, removeEventListener() {} }))

beforeEach(() => setLocale('es'))
afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('GuestList on a wide screen', () => {
  it('passes every action of a row up with its family', () => {
    media(true)
    const w = mount(GuestList, { props: { families: FAMILIES, canEdit: true }, global: { plugins: [i18n] } })
    expect(w.findAllComponents(GuestRow)).toHaveLength(2)
    const row = w.findComponent(GuestRow)
    for (const key of ['edit', 'confirm', 'revert', 'remove', 'send', 'copy', 'retry']) {
      row.vm.$emit(key, FAMILIES[0])
      expect(w.emitted(key)[0][0]).toEqual(FAMILIES[0])
    }
    row.vm.$emit('locale', FAMILIES[0], 'en')
    expect(w.emitted('locale')[0]).toEqual([FAMILIES[0], 'en'])
  })

  it('dims the table while it reloads', () => {
    media(true)
    const w = mount(GuestList, { props: { families: FAMILIES, loading: true }, global: { plugins: [i18n] } })
    const table = w.get('[data-testid=guest-table]')
    expect(table.attributes('aria-busy')).toBe('true')
    expect(table.classes()).toContain('opacity-50')
  })
})

describe('GuestList on a phone', () => {
  it('lists the guests, passes edit and retry up, and opens the sheet from a guest', async () => {
    media(false)
    const w = mount(GuestList, { props: { families: FAMILIES, canEdit: true }, attachTo: document.body, global: { plugins: [i18n] } })
    expect(w.findAllComponents(GuestItem)).toHaveLength(2)
    const item = w.findComponent(GuestItem)
    item.vm.$emit('edit', FAMILIES[0])
    item.vm.$emit('retry', FAMILIES[0])
    expect(w.emitted('edit')[0][0]).toEqual(FAMILIES[0])
    expect(w.emitted('retry')[0][0]).toEqual(FAMILIES[0])
    item.vm.$emit('menu', FAMILIES[1])
    await flushPromises()
    const sheet = w.findComponent(GuestActionSheet)
    expect(sheet.props('open')).toBe(true)
    expect(sheet.props('family').name).toBe('Beto Ruiz')
    sheet.vm.$emit('act', 'remove', FAMILIES[1])
    expect(w.emitted('remove')[0][0]).toEqual(FAMILIES[1])
    sheet.vm.$emit('locale', FAMILIES[1], 'en')
    expect(w.emitted('locale')[0]).toEqual([FAMILIES[1], 'en'])
    w.unmount()
  })
})

describe('GuestItem delivery note', () => {
  it('passes the edit and retry of its delivery note up', () => {
    const w = mount(GuestItem, { props: { family: FAMILIES[0], canEdit: true, delivery: { key: 'failed', tone: 'danger', message: 'No se pudo enviar' } }, global: { plugins: [i18n] } })
    const note = w.findComponent({ name: 'GuestDeliveryNote' })
    note.vm.$emit('edit', FAMILIES[0])
    note.vm.$emit('retry', FAMILIES[0])
    expect(w.emitted('edit')[0][0]).toEqual(FAMILIES[0])
    expect(w.emitted('retry')[0][0]).toEqual(FAMILIES[0])
    w.get(`button[aria-label="${i18n.global.t('app.roster.menu.label', { name: 'Ana Perez' })}"]`).trigger('click')
    expect(w.emitted('menu')[0][0]).toEqual(FAMILIES[0])
  })
})

describe('useRosterDownload', () => {
  const mountHarness = params => {
    let exposed
    const Harness = defineComponent({
      setup() {
        exposed = useRosterDownload(() => params)
        return () => null
      }
    })
    mount(Harness, { global: { plugins: [i18n] } })
    return exposed
  }
  const toasts = () => useToast().toasts.map(t => `${t.tone}:${t.title}`)
  beforeEach(() => {
    Object.values(svc).forEach(fn => fn.mockReset())
    saved.saveBlob.mockReset()
    useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
  })

  it('offers "this list" only when a filter or search is on, named after the tab', () => {
    expect(mountHarness({ eventId: 7, status: 'all', search: '  ' }).items.value.map(i => i.label)).toHaveLength(2)
    const items = mountHarness({ eventId: 7, status: 'attending', search: '' }).items.value
    expect(items).toHaveLength(3)
    expect(items[0].label).toContain(i18n.global.t('app.roster.tabs.attending'))
    const searching = mountHarness({ eventId: 7, status: 'all', search: 'ana' }).items.value
    expect(searching[0].label).toContain(i18n.global.t('app.roster.title'))
  })

  it('downloads the file, and tells apart "too many requests" from any other failure', async () => {
    const h = mountHarness({ eventId: 7, status: 'pending', search: ' ana ' })
    svc.download.mockResolvedValue({ blob: new Blob(['x']), filename: 'g.xlsx' })
    await h.items.value[0].onSelect()
    expect(svc.download).toHaveBeenCalledWith(7, { status: 'pending', search: 'ana', locale: 'es' })
    expect(saved.saveBlob).toHaveBeenCalled()
    expect(toasts()).toContain(`success:${i18n.global.t('app.roster.download.done')}`)
    svc.downloadVenue.mockRejectedValueOnce({ response: { status: 429 } })
    await h.items.value[2].onSelect()
    expect(toasts()).toContain(`danger:${i18n.global.t('app.roster.download.tooMany')}`)
    svc.download.mockRejectedValueOnce(new Error('500'))
    await h.items.value[1].onSelect()
    expect(toasts()).toContain(`danger:${i18n.global.t('app.roster.download.error')}`)
    expect(h.busy.value).toBe(false)
  })

  it('ignores a second download while one is running', async () => {
    const h = mountHarness({ eventId: 7, status: 'all', search: '' })
    let finish
    svc.download.mockReturnValue(new Promise(resolve => (finish = resolve)))
    const first = h.items.value[0].onSelect()
    expect(h.busy.value).toBe(true)
    await h.items.value[0].onSelect()
    expect(svc.download).toHaveBeenCalledTimes(1)
    finish({ blob: new Blob(['x']), filename: 'g.xlsx' })
    await first
    expect(h.busy.value).toBe(false)
  })
})
