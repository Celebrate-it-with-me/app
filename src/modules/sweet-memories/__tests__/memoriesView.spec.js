import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const api = vi.hoisted(() => ({ loadImages: vi.fn(), createImage: vi.fn(), updateImage: vi.fn(), deleteImage: vi.fn() }))
vi.mock('../services/SweetMemoriesService', () => ({ default: api }))
vi.mock('../utils/viewer', () => ({ openPhotoViewer: vi.fn() }))

import CSweetMemories from '../views/CSweetMemories.vue'
import { groupByYear, filterMemories } from '../utils/memories'

const mem = (id, year, extra = {}) => ({ id, title: `M${id}`, description: `d${id}`, year, visible: 1, imagePath: `/i${id}.jpg`, ...extra })
const SIX = [mem(1, 2020), mem(2, 2010), mem(3, null), mem(4, 2020, { visible: 0 }), mem(5, 2015), mem(6, 2010)]

describe('groupByYear / hiddenOnly', () => {
  it('groups consecutive years and keeps the undated last', () => {
    const g = groupByYear([mem(1, 2010), mem(2, 2010), mem(3, 2020), mem(4, null)])
    expect(g.map(x => [x.year, x.items.length])).toEqual([[2010, 2], [2020, 1], [null, 1]])
  })
  it('filters only hidden ones', () => {
    expect(filterMemories(SIX, { hiddenOnly: true }).map(m => m.id)).toEqual([4])
  })
})

describe('Memories timeline', () => {
  let wrapper
  const q = s => [...wrapper.element.querySelectorAll(s)]
  const text = () => wrapper.element.textContent.replace(/\s+/g, ' ')
  const btn = label => q('button').find(b => b.textContent.trim() === label)
  const toasts = () => useToast().toasts.map(x => x.title)

  async function setup(list) {
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useEventsStore().activeEvent = { id: 7, userRole: 'owner', eventName: 'XV' }
    api.loadImages.mockResolvedValue({ data: { data: list } })
    wrapper = mount(CSweetMemories, { global: { plugins: [i18n, pinia] }, attachTo: document.body })
    await flushPromises()
  }
  const years = () => q('h2').map(h => h.textContent.trim())

  beforeEach(() => {
    setLocale('es')
    Object.values(api).forEach(f => f.mockReset())
    api.updateImage.mockResolvedValue({})
    useToast().toasts.splice(0)
  })
  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('groups by year, oldest first by default, with "Sin año" last', async () => {
    await setup(SIX)
    expect(years()).toEqual(['2010', '2015', '2020', 'Sin año'])
    expect(text()).toContain('2 recuerdos')
    expect(text()).toContain('1 recuerdo')
  })

  it('switches the order', async () => {
    await setup(SIX)
    await btn('↓ Más antiguos primero').click()
    await flushPromises()
    expect(years()).toEqual(['2020', '2015', '2010', 'Sin año'])
    expect(btn('↑ Más recientes primero')).toBeTruthy()
  })

  it('shows the summary with plurals and no stat grid', async () => {
    await setup(SIX)
    const summary = q('p').find(p => p.querySelector('b'))
    expect(summary.textContent.replace(/\s+/g, ' ')).toContain('6 recuerdos')
    expect(summary.textContent.replace(/\s+/g, ' ')).toContain('5 visibles en la invitación')
    expect(summary.textContent.replace(/\s+/g, ' ')).toContain('1 oculto')
  })

  it('singular summary with one memory', async () => {
    await setup([mem(1, 2020)])
    expect(text()).toContain('1 recuerdo')
    expect(text()).toContain('1 visible en la invitación')
    expect(text()).toContain('0 ocultos')
  })

  it('hides the filters under 6 memories and shows them from 6', async () => {
    await setup(SIX.slice(0, 5))
    expect(q('input[type=search]')).toHaveLength(0)
    wrapper.unmount()
    await setup(SIX)
    expect(q('input[type=search]')).toHaveLength(1)
    expect(btn('Todos')).toBeTruthy()
  })

  it('keeps the filters visible while one is active, even under 6', async () => {
    await setup(SIX.slice(0, 3))
    q('button').find(b => b.getAttribute('aria-label') === 'Mostrar solo los ocultos').click()
    await flushPromises()
    expect(q('input[type=search]')).toHaveLength(1)
  })

  it('the hidden count in the summary filters to the hidden ones', async () => {
    await setup(SIX)
    q('button').find(b => b.getAttribute('aria-label') === 'Mostrar solo los ocultos').click()
    await flushPromises()
    expect(years()).toEqual(['2020'])
    expect(q('article')).toHaveLength(1)
  })

  it('filters by year chip and by search', async () => {
    await setup(SIX)
    btn('2010').click()
    await flushPromises()
    expect(years()).toEqual(['2010'])
    btn('Todos').click()
    const input = q('input[type=search]')[0]
    input.value = 'M5'
    input.dispatchEvent(new Event('input'))
    await flushPromises()
    expect(q('article')).toHaveLength(1)
  })

  it('shows the empty-results state with a way back', async () => {
    await setup(SIX)
    const input = q('input[type=search]')[0]
    input.value = 'zzz'
    input.dispatchEvent(new Event('input'))
    await flushPromises()
    expect(text()).toContain('No encontramos recuerdos')
    btn('Limpiar filtros').click()
    await flushPromises()
    expect(q('article')).toHaveLength(6)
  })

  it('the visibility chip toggles, saves details only, toasts and updates the summary', async () => {
    await setup(SIX)
    const chip = q('button').find(b => b.getAttribute('aria-pressed') === 'true' && b.textContent.trim() === 'Visible')
    expect(chip).toBeTruthy()
    api.loadImages.mockResolvedValue({ data: { data: SIX.map(m => (m.id === 2 ? { ...m, visible: 0 } : m)) } })
    // first chip belongs to the oldest year (id 2, 2010)
    chip.click()
    await flushPromises()
    expect(api.updateImage).toHaveBeenCalledTimes(1)
    const call = api.updateImage.mock.calls[0][0]
    expect(call.eventId).toBe(7)
    expect(call.id).toBe(2)
    expect(call.formData.get('visible')).toBe('0')
    expect(call.formData.has('files[0]')).toBe(false)
    expect(toasts()).toContain('Oculto en la invitación')
    expect(text()).toContain('2 ocultos')
  })

  it('toasts "Ahora se ve en la invitación" when showing a hidden one', async () => {
    await setup(SIX)
    const chip = q('button').find(b => b.getAttribute('aria-pressed') === 'false' && b.textContent.trim() === 'Oculto')
    chip.click()
    await flushPromises()
    expect(api.updateImage.mock.calls[0][0].formData.get('visible')).toBe('1')
    expect(toasts()).toContain('Ahora se ve en la invitación')
  })

  it('shows an error toast when the save fails', async () => {
    api.updateImage.mockRejectedValue(new Error('x'))
    await setup(SIX)
    q('button').find(b => b.getAttribute('aria-pressed') === 'true' && b.textContent.trim() === 'Visible').click()
    await flushPromises()
    expect(toasts()).toContain('No pudimos completar la acción. Intenta de nuevo.')
  })

  it('the ⋯ menu offers Editar, Ocultar and Eliminar (with confirmation)', async () => {
    await setup([mem(1, 2020)])
    const trigger = q('button').find(b => b.getAttribute('aria-label') === 'Más acciones para M1')
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await flushPromises()
    const items = [...document.body.querySelectorAll('[role=menuitem]')].map(i => i.textContent.trim())
    expect(items).toEqual(['Editar M1', 'Ocultar en la invitación', 'Eliminar M1'])
    ;[...document.body.querySelectorAll('[role=menuitem]')][2].click()
    await flushPromises()
    expect(document.body.textContent).toContain('Vas a eliminar')
    expect(api.deleteImage).not.toHaveBeenCalled()
  })

  it('has the add tile in the last year and opens the form', async () => {
    await setup(SIX)
    const tile = btn('Añadir recuerdo de cualquier año') || q('button').find(b => b.textContent.includes('de cualquier año'))
    expect(tile).toBeTruthy()
    tile.click()
    await flushPromises()
    expect(document.body.textContent).toContain('Nuevo recuerdo')
  })

  it('shows the big empty state with the invitation to upload the first one', async () => {
    await setup([])
    expect(text()).toContain('Sube tu primer recuerdo')
    expect(q('input[type=search]')).toHaveLength(0)
    expect(text()).not.toContain('ocultos')
    const tile = q('button').find(b => b.textContent.includes('Añadir mi primer recuerdo'))
    tile.click()
    await flushPromises()
    expect(document.body.textContent).toContain('Nuevo recuerdo')
  })
})
