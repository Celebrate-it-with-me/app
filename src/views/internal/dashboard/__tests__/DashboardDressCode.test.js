import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import DashboardDressCode from '../DashboardDressCode.vue'
import { dressCodeSummary } from '../dashboardLogic'

const stubs = { RouterLink: { props: ['to'], template: '<a :data-to="to"><slot /></a>' } }
// Valentina's dress code (seed): formal, white and fuchsia reserved.
const DRESS = { id: 1, dressCodeType: 'formal', description: 'Evita el blanco y el fucsia.', reservedColors: ['#FFFFFF', '#C2185B'], suggestedColors: [], images: [] }
const NONE = { id: null, dressCodeType: null, description: null, reservedColors: [], suggestedColors: [], images: [] }
const mountDress = (props = {}) => mount(DashboardDressCode, { props: { dressCode: DRESS, status: 'ready', canEdit: true, ...props }, global: { plugins: [i18n], stubs } })
const names = w => w.findAll('[data-testid=dress-color-name]').map(n => n.text())

beforeEach(() => setLocale('es'))

describe('dressCodeSummary', () => {
  it('names the palette colours, keeps custom ones as hex and drops repeats and junk', () => {
    const s = dressCodeSummary({ dressCodeType: 'formal', reservedColors: ['#FFFFFF', '#fff', '#c2185b', '#123456', 'red', null] })
    expect(s.colors).toEqual([
      { hex: '#ffffff', key: 'white' },
      { hex: '#c2185b', key: 'fuchsia' },
      { hex: '#123456', key: null }
    ])
    expect(s.empty).toBe(false)
  })
  it('is empty when nothing is defined (the API answers a null type and empty lists)', () => {
    expect(dressCodeSummary(NONE).empty).toBe(true)
    expect(dressCodeSummary(null).empty).toBe(true)
    expect(dressCodeSummary({ description: 'Zapatos cómodos' }).empty).toBe(false)
  })
})

describe('DashboardDressCode', () => {
  it('shows the translated style, the indications and each colour with its name, never the swatch alone', () => {
    const w = mountDress()
    expect(w.get('[data-testid=dress-type]').text()).toBe('Formal')
    expect(w.get('[data-testid=dress-description]').text()).toBe('Evita el blanco y el fucsia.')
    expect(names(w)).toEqual(['Blanco', 'Fucsia'])
    expect(w.get('[data-testid=dress-colors]').attributes('aria-label')).toBe('Colores reservados: Blanco, Fucsia')
    expect(w.get('[data-hex="#c2185b"] span').attributes('style')).toContain('background-color')
    expect(w.find('[data-to="/dashboard/dress-code"]').text()).toBe('Editar')
  })
  it('writes a custom colour as its hex, and the names in English', () => {
    expect(names(mountDress({ dressCode: { ...DRESS, reservedColors: ['#a1b2c3'] } }))).toEqual(['#A1B2C3'])
    setLocale('en')
    const w = mountDress()
    expect(names(w)).toEqual(['White', 'Fuchsia'])
    expect(w.get('[data-testid=dress-type]').text()).toBe('Formal')
  })
  it('a viewer gets "Ver" instead of "Editar"; an unknown style is shown as it comes', () => {
    expect(mountDress({ canEdit: false }).find('[data-to="/dashboard/dress-code"]').text()).toBe('Ver')
    expect(mountDress({ dressCode: { ...DRESS, dressCodeType: 'gala' } }).get('[data-testid=dress-type]').text()).toBe('gala')
  })
  it('without a dress code: an empty state with the way to define it (owner decision), and none for a viewer', () => {
    const w = mountDress({ dressCode: NONE })
    expect(w.get('[data-testid=dress-empty]').text()).toContain('Define la vestimenta')
    expect(w.get('[data-testid=dress-empty]').find('[data-to="/dashboard/dress-code"]').text()).toBe('Definir vestimenta')
    const viewer = mountDress({ dressCode: NONE, canEdit: false })
    expect(viewer.get('[data-testid=dress-empty]').text()).toContain('Aún no se ha definido la vestimenta.')
    expect(viewer.find('a').exists()).toBe(false)
  })
  it('loading draws the skeleton, never the empty state; an error offers retry', async () => {
    const loading = mountDress({ dressCode: null, status: 'loading' })
    expect(loading.find('[data-testid=dress-skeleton]').exists()).toBe(true)
    expect(loading.find('[data-testid=dress-empty]').exists()).toBe(false)
    const error = mountDress({ dressCode: null, status: 'error' })
    expect(error.get('[data-testid=block-error]').text()).toContain('No pudimos cargar la vestimenta')
    await error.get('[data-testid=block-retry]').trigger('click')
    expect(error.emitted('retry')).toHaveLength(1)
  })
})
