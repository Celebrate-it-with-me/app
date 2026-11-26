import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n from '@/locales/i18n'

const mocks = vi.hoisted(() => ({ preview: vi.fn() }))
vi.mock('../services/TemplatePickerService', () => ({ default: mocks }))

import TemplateCard from '../components/TemplateCard.vue'
import TemplateFilters from '../components/TemplateFilters.vue'
import TemplateGrid from '../components/TemplateGrid.vue'
import TemplateThumbStrip from '../components/TemplateThumbStrip.vue'
import TemplatePreviewPanel from '../components/TemplatePreviewPanel.vue'
import TemplatePreviewFrame from '../components/TemplatePreviewFrame.vue'

const global = { plugins: [i18n] }
const tpl = (id, extra = {}) => ({ id, name: `Plantilla ${id}`, tier: 'free', locked: false, current: false, previewImage: null, description: { es: 'Una descripción', en: 'A description' }, ...extra })
const wrappers = []
const mountIt = (component, props, options = {}) => {
  const w = mount(component, { props, global, attachTo: document.body, ...options })
  wrappers.push(w)
  return w
}

beforeEach(() => {
  i18n.global.locale.value = 'es'
  mocks.preview.mockReset()
  mocks.preview.mockResolvedValue({ locale: 'es', sections: [], theme: {} })
})
afterEach(() => {
  wrappers.splice(0).forEach(w => w.unmount())
  document.body.innerHTML = ''
})

describe('TemplateCard', () => {
  const badge = w => w.get('[data-testid=template-badge]').text()

  it('shows one badge by priority: Actual, then Premium, then Gratis', () => {
    expect(badge(mountIt(TemplateCard, { template: tpl(1, { current: true, tier: 'premium' }) }))).toBe('Actual')
    expect(badge(mountIt(TemplateCard, { template: tpl(2, { tier: 'premium', locked: true }) }))).toBe('Premium')
    expect(badge(mountIt(TemplateCard, { template: tpl(3) }))).toBe('Gratis')
    i18n.global.locale.value = 'en'
    expect(badge(mountIt(TemplateCard, { template: tpl(4, { current: true }) }))).toBe('Current')
  })

  it('names the card with its state and marks the selected one as pressed', async () => {
    const w = mountIt(TemplateCard, { template: tpl(2, { tier: 'premium', locked: true }), selected: true })
    const main = w.get('button[aria-label]')
    expect(main.attributes('aria-label')).toBe('Plantilla 2, Premium, bloqueada')
    expect(main.attributes('aria-pressed')).toBe('true')
    expect(main.classes()).toContain('ring-rose-600')
    await main.trigger('click')
    expect(w.emitted('select')[0][0].id).toBe(2)
  })

  it('draws palette dots and a count only with more than one palette', () => {
    const presets = [
      { value: 'a', label: { es: 'A', en: 'A' }, colors: ['#111', '#222', '#333'] },
      { key: 'b', label: { es: 'B', en: 'B' }, palette: { background: '#fff', text: '#000', accent: '#f00' } },
      { key: 'c' }
    ]
    const many = mountIt(TemplateCard, { template: tpl(1, { presets }) })
    expect(many.get('[data-testid=template-palettes]').text()).toContain('3 paletas')
    expect(many.findAll('[data-testid=template-palettes] span.rounded-full').length).toBe(3)
    expect(many.get('button[aria-label]').attributes('aria-label')).toContain('3 paletas')
    expect(mountIt(TemplateCard, { template: tpl(2, { presets: presets.slice(0, 1) }) }).find('[data-testid=template-palettes]').exists()).toBe(false)
    expect(mountIt(TemplateCard, { template: tpl(3) }).find('[data-testid=template-palettes]').exists()).toBe(false)
  })

  it('has a heart that is a sibling button: it toggles without selecting the card', async () => {
    const w = mountIt(TemplateCard, { template: tpl(1), canFavorite: true, favorite: false })
    const heart = w.get('[data-testid=template-favorite]')
    expect(heart.attributes('aria-pressed')).toBe('false')
    expect(heart.attributes('aria-label')).toBe('Marcar Plantilla 1 como favorita')
    expect(heart.element.closest('button[aria-label]:not([data-testid])')).toBeNull()
    await heart.trigger('click')
    expect(w.emitted('favorite')[0][0].id).toBe(1)
    expect(w.emitted('select')).toBeUndefined()
    await w.setProps({ favorite: true })
    expect(w.get('[data-testid=template-favorite]').attributes('aria-label')).toBe('Quitar Plantilla 1 de tus favoritas')
  })

  it('has no heart unless asked, and warns about modules the template lacks', () => {
    const w = mountIt(TemplateCard, { template: tpl(1, { missingModules: ['comments'] }) })
    expect(w.find('[data-testid=template-favorite]').exists()).toBe(false)
    expect(w.get('[data-testid=template-missing]').text()).toBe('No incluye: Comentarios')
  })

  it('keeps a very long name inside the card (clamped, breakable)', () => {
    const w = mountIt(TemplateCard, { template: tpl(1, { name: 'Una plantilla con un nombre larguísimo que no cabe en una sola línea de la tarjeta' }) })
    const name = w.findAll('span').find(el => el.classes().includes('line-clamp-2'))
    expect(name.classes()).toEqual(expect.arrayContaining(['line-clamp-2', 'break-words', 'min-w-0']))
  })

  it('tells the grid when it is looked at (to prefetch)', async () => {
    const w = mountIt(TemplateCard, { template: tpl(1) })
    await w.get('div').trigger('pointerenter')
    expect(w.emitted('hover')[0][0].id).toBe(1)
  })
})

describe('TemplateFilters', () => {
  const base = { tags: ['elegante', 'raro'], count: 4 }

  it('emits each choice and marks the active ones', async () => {
    const w = mountIt(TemplateFilters, { ...base, access: 'free', tag: 'elegante' })
    const chip = label => w.findAll('button').find(b => b.text() === label)
    expect(chip('Gratis').attributes('aria-pressed')).toBe('true')
    expect(chip('Elegante').attributes('aria-pressed')).toBe('true')
    await chip('Premium').trigger('click')
    expect(w.emitted('update:access')[0]).toEqual(['premium'])
    await chip('Elegante').trigger('click')
    expect(w.emitted('update:tag')[0]).toEqual([''])
    await w.setProps({ tag: '' })
    await chip('raro').trigger('click')
    expect(w.emitted('update:tag')[1]).toEqual(['raro'])
    const input = w.get('input')
    await input.setValue('ros')
    expect(w.emitted('update:query')[0]).toEqual(['ros'])
    expect(input.attributes('aria-label')).toBe('Buscar plantilla')
  })

  it('shows the favorites chip only when there are favorites, the style row only with tags, and a plural count', async () => {
    const w = mountIt(TemplateFilters, { tags: [], count: 1 })
    expect(w.find('[data-testid=template-tags]').exists()).toBe(false)
    expect(w.findAll('button').some(b => b.text() === 'Favoritas')).toBe(false)
    expect(w.get('[data-testid=template-count]').text()).toBe('1 plantilla')
    await w.setProps({ hasFavorites: true, count: 3 })
    const fav = w.findAll('button').find(b => b.text() === 'Favoritas')
    await fav.trigger('click')
    expect(w.emitted('update:favoritesOnly')[0]).toEqual([true])
    expect(w.get('[data-testid=template-count]').text()).toBe('3 plantillas')
  })
})

describe('TemplateGrid', () => {
  it('has skeletons while loading and an error with retry', async () => {
    const loading = mountIt(TemplateGrid, { status: 'loading' })
    expect(loading.get('[data-testid=template-skeleton]').attributes('role')).toBe('status')
    const failed = mountIt(TemplateGrid, { status: 'error' })
    await failed.get('button').trigger('click')
    expect(failed.emitted('retry')).toHaveLength(1)
  })

  it('tells apart nothing available from nothing matching, and clears the filters', async () => {
    const none = mountIt(TemplateGrid, { status: 'ready', total: 0, templates: [] })
    expect(none.text()).toContain('Por ahora no hay plantillas disponibles.')
    const filtered = mountIt(TemplateGrid, { status: 'ready', total: 4, templates: [] })
    expect(filtered.text()).toContain('Ninguna plantilla coincide')
    await filtered.get('button').trigger('click')
    expect(filtered.emitted('clear')).toHaveLength(1)
  })

  it.each([1, 2, 6])('draws %i cards in auto-fill columns (no phantom columns)', count => {
    const templates = Array.from({ length: count }, (_, i) => tpl(i + 1))
    const w = mountIt(TemplateGrid, { status: 'ready', total: count, templates, selectedId: 2, isFavorite: id => id === 1, canFavorite: true })
    expect(w.findAll('[data-testid=template-grid] > li').length).toBe(count)
    expect(w.get('[data-testid=template-grid]').classes().join(' ')).toContain('auto-fill')
    expect(w.findAll('button[aria-pressed="true"]:not([data-testid=template-favorite])').length).toBe(count >= 2 ? 1 : 0)
  })

  it('forwards select, favorite and hover', async () => {
    const w = mountIt(TemplateGrid, { status: 'ready', total: 1, templates: [tpl(1)], canFavorite: true })
    await w.get('button[aria-label]').trigger('click')
    await w.get('[data-testid=template-favorite]').trigger('click')
    await w.get('li > div').trigger('pointerenter')
    expect(w.emitted('select')[0][0].id).toBe(1)
    expect(w.emitted('favorite')[0][0].id).toBe(1)
    expect(w.emitted('hover')[0][0].id).toBe(1)
  })
})

describe('TemplateThumbStrip', () => {
  it('lists every template, presses the selected one and emits the choice', async () => {
    const templates = [tpl(1), tpl(2), tpl(3)]
    const w = mountIt(TemplateThumbStrip, { templates, selectedId: 2 })
    const buttons = w.findAll('[data-testid=template-strip] button')
    expect(buttons.map(b => b.attributes('aria-pressed'))).toEqual(['false', 'true', 'false'])
    expect(buttons[0].attributes('aria-label')).toBe('Ver Plantilla 1')
    await buttons[2].trigger('click')
    expect(w.emitted('select')[0][0].id).toBe(3)
  })

  it('centres the selected thumbnail inside the strip only (never scrolls the page)', async () => {
    const w = mountIt(TemplateThumbStrip, { templates: [tpl(1), tpl(2)], selectedId: 1 })
    const scroller = w.get('[data-testid=template-strip]').element.parentElement
    scroller.scrollTo = vi.fn()
    await w.setProps({ selectedId: 2 })
    await flushPromises()
    expect(scroller.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ left: expect.any(Number) }))
    scroller.scrollTo = undefined
    await w.setProps({ selectedId: 1 })
    await flushPromises()
  })
})

describe('TemplatePreviewPanel', () => {
  const payload = { sections: [{ type: 'cover', data: {} }] }
  const props = { template: tpl(1, { current: true }), payload, status: 'ready' }

  it('shows the skeleton until the first payload is drawn, then only a thin veil while the next one loads', async () => {
    const w = mountIt(TemplatePreviewPanel, { ...props, payload: null, status: 'loading' })
    expect(w.get('[data-testid=phone-skeleton]').attributes('role')).toBe('status')
    await w.setProps({ payload, status: 'ready' })
    expect(w.find('[data-testid=phone-skeleton]').exists()).toBe(true) // framed, not drawn yet
    w.getComponent(TemplatePreviewFrame).vm.$emit('ready')
    await flushPromises()
    expect(w.find('[data-testid=phone-skeleton]').exists()).toBe(false)
    await w.setProps({ status: 'loading' })
    expect(w.find('[data-testid=phone-skeleton]').exists()).toBe(true)
    expect(w.findComponent(TemplatePreviewFrame).exists()).toBe(true) // the previous one stays
  })

  it('speaks the error and the retry, and the forbidden role without one', async () => {
    const w = mountIt(TemplatePreviewPanel, { ...props, status: 'error', error: 'other' })
    await w.get('[role=alert] button').trigger('click')
    expect(w.emitted('retry')).toHaveLength(1)
    await w.setProps({ error: 'forbidden' })
    expect(w.get('[role=alert]').text()).toBe('Tu rol no puede preparar la vista previa.')
    expect(w.find('[role=alert] button').exists()).toBe(false)
  })

  it('emits the language and the stage, and shows the premium box and the paid note', async () => {
    const w = mountIt(TemplatePreviewPanel, { ...props, template: tpl(2, { tier: 'premium', locked: true }), included: ['Uno', 'Dos'] })
    await w.findAll('button').find(b => b.text() === 'English').trigger('click')
    await w.findAll('button').find(b => b.text() === 'Guarda la fecha').trigger('click')
    expect(w.emitted('update:language')[0]).toEqual(['en'])
    expect(w.emitted('update:stage')[0]).toEqual(['save_the_date'])
    expect(w.text()).toContain('Plantilla premium')
    expect(w.text()).toContain('Dos')
    await w.setProps({ template: tpl(3, { tier: 'premium' }), paidNow: true })
    expect(w.text()).toContain('Ya desbloqueaste tu evento. ¿Usamos Plantilla 3 ahora?')
  })

  it('renders nothing of the details without a template', () => {
    const w = mountIt(TemplatePreviewPanel, { template: null, payload: null, status: 'idle' })
    expect(w.find('h3').exists()).toBe(false)
  })
})

describe('TemplatePreviewFrame scaled and inert', () => {
  it('scales the 390x844 page to its box, hands over the payload once ready and says when it drew', async () => {
    const calls = []
    const w = mountIt(TemplatePreviewFrame, { payload: { a: 1 }, title: 'x', scaled: true, inert: true })
    const iframe = w.get('iframe')
    expect(iframe.attributes('scrolling')).toBe('no')
    expect(iframe.attributes('tabindex')).toBe('-1')
    expect(iframe.element.style.width).toBe('390px')
    expect(iframe.element.style.height).toBe('844px')
    iframe.element.contentWindow.postMessage = (...args) => calls.push(args)
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'qv-preview-ready' }, origin: window.location.origin, source: iframe.element.contentWindow }))
    await flushPromises()
    expect(calls[0][0]).toEqual({ type: 'qv-preview', payload: { a: 1 } })
    expect(w.emitted('ready')).toHaveLength(1)
    await w.setProps({ payload: { a: 2 } })
    await flushPromises()
    expect(calls.at(-1)[0].payload).toEqual({ a: 2 })
    expect(w.emitted('ready').length).toBeGreaterThan(1)
  })

  it('ignores messages from elsewhere and stays a plain iframe when not scaled', async () => {
    const w = mountIt(TemplatePreviewFrame, { payload: { a: 1 }, title: 'x' })
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'qv-preview-ready' }, origin: 'https://evil.test' }))
    await flushPromises()
    expect(w.emitted('ready')).toBeUndefined()
    expect(w.get('iframe').attributes('scrolling')).toBeUndefined()
    expect(w.get('iframe').element.style.transform).toBe('')
  })

  it('measures the box with a ResizeObserver when there is one', async () => {
    let callback
    class RO {
      constructor(cb) {
        callback = cb
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', RO)
    const w = mountIt(TemplatePreviewFrame, { payload: null, title: 'x', scaled: true })
    callback([{ contentRect: { width: 195 } }])
    await flushPromises()
    expect(w.get('iframe').element.style.transform).toBe('scale(0.5)')
    vi.unstubAllGlobals()
  })
})
