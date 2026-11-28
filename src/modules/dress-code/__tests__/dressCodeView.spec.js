import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const api = vi.hoisted(() => ({ get: vi.fn(), save: vi.fn(), remove: vi.fn() }))
vi.mock('../services/DressCodeService', () => ({ default: api }))
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('@/ui/useToast', () => ({ useToast: () => toast, toasts: { value: [] }, default: () => toast }))
import DressCodeView from '../views/DressCodeView.vue'

let wrapper
const body = () => document.body
const q = sel => body().querySelector(sel)
const qa = sel => [...body().querySelectorAll(sel)]
const SAVED = { id: 1, dressCodeType: 'formal', description: 'Evita el blanco', reservedColors: ['#FFFFFF', '#c2185b'], suggestedColors: [], images: [] }

async function setup(data = SAVED, role = 'owner') {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  const store = useEventsStore()
  store.activeEvent = { id: 7, userRole: role, eventType: 1 }
  store.eventTypes = [{ id: 1, slug: 'quince' }]
  api.get.mockResolvedValue(data)
  wrapper = mount(DressCodeView, { global: { plugins: [i18n, pinia], stubs: { RouterLink: true } }, attachTo: document.body })
  await flushPromises()
}

beforeEach(() => {
  setLocale('es')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({}) }))
  api.get.mockReset()
  api.save.mockReset().mockImplementation(async () => ({ ...SAVED }))
  api.remove.mockReset().mockResolvedValue({})
  toast.success.mockReset()
  toast.error.mockReset()
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

const chipNames = group => [...group.querySelectorAll('[data-testid=dress-chip-name]')].map(n => n.textContent.trim())
const groups = () => qa('[data-testid=dress-colors-group]')
const click = async el => {
  el.click()
  await flushPromises()
}
const openPalette = async index => click(groups()[index].querySelector('[data-testid=dress-add]'))
const swatch = key => q(`[data-swatch="${key}"]`)

describe('Vestimenta: the colour bug', () => {
  it('recognises saved #FFFFFF, #fff and lower-case values as palette colours with their name', async () => {
    await setup({ ...SAVED, reservedColors: ['#FFFFFF', '#c2185b'] })
    expect(chipNames(groups()[0])).toEqual(['Blanco', 'Fucsia'])
    await openPalette(0)
    expect(swatch('white').getAttribute('aria-pressed')).toBe('true')
    expect(swatch('fuchsia').getAttribute('aria-pressed')).toBe('true')
    expect(swatch('gold').getAttribute('aria-pressed')).toBe('false')
  })

  it('shows a custom colour as Personalizado with the hex in its title', async () => {
    await setup({ ...SAVED, reservedColors: ['#a1b2c3'] })
    const chip = groups()[0].querySelector('li[data-hex]')
    expect(chipNames(groups()[0])).toEqual(['Personalizado'])
    expect(chip.getAttribute('title')).toBe('#A1B2C3')
  })

  it('saves colours in capitals', async () => {
    await setup({ ...SAVED, reservedColors: [] })
    await openPalette(0)
    await click(swatch('gold'))
    await click(q('[data-testid=dress-save-row] button'))
    const sent = api.save.mock.calls[0][1]
    expect(sent.getAll('reservedColors[]')).toEqual(['#C9A24E'])
  })
})

describe('Vestimenta: style, indications and colours', () => {
  it('describes the chosen style under the grid, in an aria-live region', async () => {
    await setup()
    const hint = q('[data-testid=dress-type-hint]')
    expect(hint.getAttribute('aria-live')).toBe('polite')
    expect(hint.textContent).toContain('Formal:')
    await click(q('input[value="cocktail"]'))
    expect(hint.textContent).toContain('Cóctel:')
  })

  it('grows the textarea with its content and leaves room for the counter', async () => {
    await setup()
    const area = q('textarea')
    expect(area.className).toContain('pb-7!')
    expect(area.className).toContain('overflow-hidden')
    Object.defineProperty(area, 'scrollHeight', { configurable: true, value: 222 })
    area.value = 'una\nlinea\nmuy\nlarga'
    area.dispatchEvent(new Event('input'))
    await flushPromises()
    expect(area.style.height).toBe('222px')
  })

  it('shows "Ninguno todavía", counts per group and caps a group at 8', async () => {
    await setup({ ...SAVED, reservedColors: [], suggestedColors: [] })
    expect(groups()[1].querySelector('[data-testid=dress-none]').textContent).toBe('Ninguno todavía')
    expect(groups()[0].querySelector('[data-testid=dress-group-count]').textContent).toContain('0 de 8')
    const eight = ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777', '#888888']
    wrapper.unmount()
    await setup({ ...SAVED, reservedColors: eight })
    const add = groups()[0].querySelector('[data-testid=dress-add]')
    expect(add.disabled).toBe(true)
    expect(add.textContent).toContain('Máximo 8')
  })

  it('removes a colour from its chip', async () => {
    await setup()
    await click(groups()[0].querySelector('button[aria-label="Quitar Blanco"]'))
    expect(chipNames(groups()[0])).toEqual(['Fucsia'])
  })

  it('does not let a colour live in both groups', async () => {
    await setup()
    await openPalette(1)
    const white = swatch('white')
    expect(white.disabled).toBe(true)
    expect(white.getAttribute('title')).toBe('Ya está en colores reservados')
    await click(white)
    expect(chipNames(groups()[1])).toEqual([])
    await click(swatch('gold'))
    expect(chipNames(groups()[1])).toEqual(['Dorado'])
  })

  it('opens the palette inline on wide screens', async () => {
    await setup()
    await openPalette(0)
    expect(q('[data-testid=dress-panel]')).not.toBeNull()
    expect(q('[data-testid=bottom-sheet]')).toBeNull()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(q('[data-testid=dress-panel]')).toBeNull()
    await openPalette(0)
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await flushPromises()
    expect(q('[data-testid=dress-panel]')).toBeNull()
  })

  it('opens the palette as a bottom sheet with "Listo" on phones', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
    await setup()
    await openPalette(0)
    expect(q('[data-testid=dress-panel]')).toBeNull()
    expect(q('[data-testid=bottom-sheet]')).not.toBeNull()
    await click(q('[data-testid=dress-done]'))
    expect(q('[data-testid=bottom-sheet]')).toBeNull()
  })
})

describe('Vestimenta: preview', () => {
  it('follows the unsaved form: style, notes (or the style hint) and colours', async () => {
    await setup({ ...SAVED, description: '', reservedColors: ['#fff'] })
    const preview = q('[data-testid=dress-preview]')
    expect(q('[data-testid=preview-style]').textContent).toBe('Formal')
    expect(q('[data-testid=preview-text]').textContent).toContain('Traje oscuro')
    expect([...preview.querySelectorAll('[data-testid=preview-avoid] [data-testid=preview-color-name]')].map(n => n.textContent)).toEqual(['Blanco'])
    expect(q('[data-testid=preview-suggested]')).toBeNull()
    await click(q('input[value="cocktail"]'))
    expect(q('[data-testid=preview-style]').textContent).toBe('Cóctel')
    const area = q('textarea')
    area.value = 'Zapatos cómodos'
    area.dispatchEvent(new Event('input'))
    await openPalette(1)
    await click(swatch('gold'))
    expect(q('[data-testid=preview-text]').textContent).toBe('Zapatos cómodos')
    expect(q('[data-testid=preview-suggested]').textContent).toContain('Dorado')
  })
})

describe('Vestimenta: save and remove', () => {
  it('is "Todo guardado" until something changes, and clean again after saving', async () => {
    await setup()
    expect(q('[data-testid=dress-saved]').textContent).toContain('Todo guardado')
    expect(q('[data-testid=dress-save-bar]').textContent).toContain('Todo guardado')
    expect(q('[data-testid=dress-save-bar] button').disabled).toBe(true)
    await click(q('input[value="cocktail"]'))
    expect(q('[data-testid=dress-saved]')).toBeNull()
    const bar = q('[data-testid=dress-save-bar]')
    expect(bar.textContent).toContain('Cambios sin guardar')
    await click(bar.querySelector('button'))
    expect(api.save).toHaveBeenCalledTimes(1)
    expect(q('[data-testid=dress-saved]')).not.toBeNull()
    expect(toast.success).toHaveBeenCalled()
  })

  it('treats a re-spelled colour as no change', async () => {
    await setup({ ...SAVED, reservedColors: ['#ffffff'] })
    expect(q('[data-testid=dress-saved]')).not.toBeNull()
  })

  it('asks before removing the dress code', async () => {
    await setup()
    await click(q('[data-testid=dress-remove]'))
    expect(body().textContent).toContain('¿Quitar la vestimenta?')
    expect(api.remove).not.toHaveBeenCalled()
    const confirm = qa('button').find(b => b.textContent.trim() === 'Quitar vestimenta' && b.closest('[role=dialog]'))
    await click(confirm)
    expect(api.remove).toHaveBeenCalledWith(7)
  })

  it('a viewer sees no save bar, no remove and no add buttons', async () => {
    await setup(SAVED, 'viewer')
    expect(q('[data-testid=dress-save-bar]')).toBeNull()
    expect(q('[data-testid=dress-remove]')).toBeNull()
    expect(q('[data-testid=dress-add]')).toBeNull()
  })
})
