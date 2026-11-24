import { describe, it, expect, vi, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import i18n from '@/locales/i18n'
import { INVITATION_KEY, invitationHelpers } from '../composables/useInvitation'
import { colorLabel } from '../composables/colorNames'
import { endsNextDay, formatClock } from '../composables/wallClock'
import InvitationItinerary from '../components/InvitationItinerary.vue'
import InvitationLocations from '../components/InvitationLocations.vue'
import InvitationDressCode from '../components/InvitationDressCode.vue'
import InvitationPadrinos from '../components/InvitationPadrinos.vue'
import InvitationClosing from '../components/InvitationClosing.vue'
import InvitationSuggestedMusic from '../components/InvitationSuggestedMusic.vue'

const api = vi.hoisted(() => ({ listSongs: vi.fn() }))
vi.mock('@/services/PublicEvents/InvitationService', () => ({ default: api }))

function render(component, data, { locale = 'es', typeSlug = 'quinceanera', branding = {}, props = {} } = {}) {
  i18n.global.locale.value = locale
  const invitation = ref({ locale, event: { typeSlug }, branding, sections: [] })
  return mount(component, {
    props: { section: { type: 'x', title: 'Titulo', text: '', data }, ...props },
    global: { plugins: [i18n], provide: { [INVITATION_KEY]: { invitation, ...invitationHelpers(invitation), slug: () => 'xv', code: () => 'AB1', preview: false } } }
  })
}

afterEach(() => vi.unstubAllGlobals())

describe('wall clock helpers', () => {
  it('formats a 12-hour clock in both languages', () => {
    expect(formatClock('2027-01-02 16:30:00', 'es')).toBe('4:30 p.m.')
    expect(formatClock('2027-01-02 16:30:00', 'en')).toBe('4:30 PM')
    expect(formatClock('', 'es')).toBe('')
  })

  it('detects an end on a later day', () => {
    expect(endsNextDay('2027-01-02 22:00:00', '2027-01-03 01:00:00')).toBe(true)
    expect(endsNextDay('2027-01-02T19:00:00', '2027-01-02T21:00:00')).toBe(false)
    expect(endsNextDay(null, '2027-01-03 01:00:00')).toBe(false)
  })
})

describe('INV-007 itinerary and locations use 12 hours', () => {
  const items = [
    { type: 'ceremony', title: 'Misa', description: null, startTime: '2027-01-02 16:30:00', endTime: '2027-01-02 17:30:00' },
    { type: 'dance', title: 'Baile', description: null, startTime: '2027-01-02 22:00:00', endTime: '2027-01-03 01:00:00' }
  ]

  it('writes p. m. in Spanish and flags an end after midnight', () => {
    const text = render(InvitationItinerary, { items }).text()
    expect(text).toContain('4:30 p.m. – 5:30 p.m.')
    expect(text).toContain('10:00 p.m. – 1:00 a.m. (+1 día)')
    expect(text).not.toContain('16:30')
  })

  it('writes PM in English', () => {
    const text = render(InvitationItinerary, { items }, { locale: 'en' }).text()
    expect(text).toContain('4:30 PM – 5:30 PM')
    expect(text).toContain('(+1 day)')
  })

  it('shows the place start time in 12 hours', () => {
    const place = { type: 'ceremony', name: 'Parroquia', address: '1 Calle', city: 'Miami', state: 'FL', zipCode: '33125', startTime: '2027-01-02 16:30:00', images: [], links: {} }
    expect(render(InvitationLocations, { items: [place] }).text()).toContain('A las 4:30 p.m.')
    expect(render(InvitationLocations, { items: [place] }, { locale: 'en' }).text()).toContain('At 4:30 PM')
  })
})

describe('INV-011 locations', () => {
  const links = { google: 'https://g.example/m', apple: 'https://a.example/m', waze: 'https://w.example/m' }
  const place = (extra = {}) => ({ type: 'reception', name: 'Salón', address: '1200 NW 7th', city: 'Miami', state: 'FL', zipCode: '33125', startTime: null, images: [], links, ...extra })

  it('puts Google first and the others as secondary links', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Linux; Android 14)' })
    const wrapper = render(InvitationLocations, { items: [place()] })
    const primary = wrapper.get('a.inv-button')
    expect(primary.attributes('href')).toBe('https://g.example/m')
    expect(primary.text()).toContain('Cómo llegar')
    expect(wrapper.findAll('a').map(a => a.attributes('href'))).toEqual(['https://g.example/m', 'https://a.example/m', 'https://w.example/m'])
    expect(wrapper.findAll('a.inv-button')).toHaveLength(1)
  })

  it('keeps the app name in the directions button at full opacity (R1-001)', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Linux; Android 14)' })
    const primary = render(InvitationLocations, { items: [place()] }).get('a.inv-button')
    expect(primary.get('span').classes().join(' ')).not.toContain('opacity')
    expect(primary.text()).toContain('Google Maps')
  })

  it('puts Apple Maps first on Apple devices', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' })
    expect(render(InvitationLocations, { items: [place()] }).get('a.inv-button').attributes('href')).toBe('https://a.example/m')
  })

  it('falls back to whatever link exists and rejects unsafe ones', () => {
    vi.stubGlobal('navigator', { userAgent: 'x' })
    const wrapper = render(InvitationLocations, { items: [place({ links: { google: 'javascript:alert(1)', waze: 'https://w.example/m' } })] })
    expect(wrapper.get('a.inv-button').attributes('href')).toBe('https://w.example/m')
    expect(render(InvitationLocations, { items: [place({ links: {} })] }).find('a.inv-button').exists()).toBe(false)
  })

  it('hides the generic type label for other and keeps the time', () => {
    const other = render(InvitationLocations, { items: [place({ type: 'other', startTime: '2027-01-02 19:00:00' })] }).text()
    expect(other).not.toContain('Lugar')
    expect(other).toContain('A las 7:00 p.m.')
    expect(render(InvitationLocations, { items: [place({ type: 'other' })] }).text()).not.toContain('Lugar')
    expect(render(InvitationLocations, { items: [place()] }).text()).toContain('Recepción')
  })

  it('copies the full address with one tap and confirms it', async () => {
    const writeText = vi.fn().mockResolvedValue()
    vi.stubGlobal('navigator', { userAgent: 'x', clipboard: { writeText } })
    const wrapper = render(InvitationLocations, { items: [place()] })
    const copy = wrapper.findAll('button').find(b => b.text() === 'Copiar dirección')
    await copy.trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith('1200 NW 7th, Miami, FL, 33125')
    expect(wrapper.get('[role="status"]').text()).toBe('Dirección copiada')
  })

  it('stays quiet when the clipboard fails and hides the button without one', async () => {
    vi.stubGlobal('navigator', { userAgent: 'x', clipboard: { writeText: vi.fn().mockRejectedValue(new Error('no')) } })
    const wrapper = render(InvitationLocations, { items: [place()] })
    await wrapper.findAll('button').find(b => b.text() === 'Copiar dirección').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="status"]').text()).toBe('')
    vi.stubGlobal('navigator', { userAgent: 'x' })
    expect(render(InvitationLocations, { items: [place()] }).text()).not.toContain('Copiar dirección')
  })

  it('opens and closes the map from a 44 px button', async () => {
    vi.stubGlobal('navigator', { userAgent: 'x' })
    const wrapper = render(InvitationLocations, { items: [place()] })
    const toggle = wrapper.findAll('button').find(b => b.text() === 'Ver mapa')
    expect(toggle.classes()).toContain('min-h-11')
    await toggle.trigger('click')
    expect(wrapper.find('iframe').exists()).toBe(true)
    expect(toggle.text()).toBe('Ocultar mapa')
  })
})

describe('INV-009 dress code', () => {
  const data = (extra = {}) => ({ type: 'formal', description: 'Vestimenta formal. Evita el blanco.', reservedColors: ['#FFFFFF', '#C2185B', 'Verde menta'], suggestedColors: ['Azul', '#7a7a1e'], images: [], ...extra })

  it('names every color and marks the reserved ones as to avoid', () => {
    const wrapper = render(InvitationDressCode, data())
    const text = wrapper.text()
    expect(text).toContain('Blanco')
    expect(text).toContain('Fucsia')
    expect(text).toContain('Verde menta')
    expect(wrapper.findAll('.inv-dresscode__avoid')).toHaveLength(3)
    expect(wrapper.findAll('.inv-dresscode__palette')[1].find('.inv-dresscode__avoid').exists()).toBe(false)
  })

  it('names colors in English and shows the code when no name is close', () => {
    const text = render(InvitationDressCode, data(), { locale: 'en' }).text()
    expect(text).toContain('White')
    expect(text).toContain('Fuchsia')
    expect(text).toContain('#7A7A1E')
    expect(text).toContain('Avoid')
  })

  it('drops the sentence that only restates the type', () => {
    expect(render(InvitationDressCode, data()).text()).not.toContain('Vestimenta formal.')
    expect(render(InvitationDressCode, data()).text()).toContain('Evita el blanco.')
    expect(render(InvitationDressCode, data({ description: 'Etiqueta formal' })).find('p.text-lg').exists()).toBe(false)
    expect(render(InvitationDressCode, data({ description: 'Formal. Sin jeans.' })).text()).toContain('Sin jeans.')
    expect(render(InvitationDressCode, data({ description: 'Traje oscuro, sin corbata.' })).text()).toContain('Traje oscuro, sin corbata.')
    expect(render(InvitationDressCode, data({ description: null })).find('p.text-lg').exists()).toBe(false)
  })

  it('renders names only in the plain variant', () => {
    const wrapper = render(InvitationDressCode, data(), { props: { variant: 'plain' } })
    expect(wrapper.find('.shadow-soft').exists()).toBe(false)
    expect(wrapper.text()).toContain('Blanco')
  })

  it('colorLabel handles names, short hex and junk', () => {
    expect(colorLabel('Dorado')).toBe('Dorado')
    expect(colorLabel('#fff')).toBe('Blanco')
    expect(colorLabel('#C9A24E', 'en')).toBe('Gold')
    expect(colorLabel('#7a7a1e')).toBeNull()
    expect(colorLabel(5)).toBeNull()
    expect(colorLabel('  ')).toBeNull()
  })
})

describe('INV-010 padrinos copy', () => {
  const items = [{ name: 'Tío Raúl', relationship: null, sponsors: ['DJ y vals', 'Banquete para 100'], thanks: null }]

  it('reads "Su regalo" and lowers a leading capital but keeps acronyms', () => {
    expect(render(InvitationPadrinos, { items }).text()).toContain('Su regalo: DJ y vals y banquete para 100')
  })

  it('reads "Gift" in English', () => {
    expect(render(InvitationPadrinos, { items }, { locale: 'en' }).text()).toContain('Gift: DJ y vals and banquete para 100')
  })
})

describe('INV-022 closing mark', () => {
  it('is a 44 px tap target with readable contrast', () => {
    const wrapper = render(InvitationClosing, {}, { branding: { watermark: true } })
    expect(wrapper.get('a').classes()).toEqual(expect.arrayContaining(['min-h-11', 'inline-flex']))
    expect(wrapper.get('.inv-watermark').classes()).toContain('text-inv-surface/90')
  })
})

describe('INV-014 cover art', () => {
  it('falls back to the initial when the cover fails to load', async () => {
    api.listSongs.mockResolvedValue({ data: { data: [{ id: 1, title: 'Zeta', artist: 'A', thumbnailUrl: 'https://i.scdn.co/broken.jpg', previewUrl: null, votes: 1, votedByMe: false, suggestedByMe: false }], meta: { currentPage: 1, lastPage: 1, total: 1 } } })
    const wrapper = render(InvitationSuggestedMusic, { heading: 'M', subHeading: null, usePreview: false, useVotes: true, maxSuggestions: 5, mySuggestions: 0, canWrite: true })
    await flushPromises()
    const img = wrapper.get('.inv-songs__cover img')
    await img.trigger('error')
    expect(wrapper.find('.inv-songs__cover img').exists()).toBe(false)
    expect(wrapper.get('.inv-songs__cover').text()).toBe('Z')
  })
})

describe('remaining branches of the touched sections', () => {
  it('formats explicit offsets in the event timezone and ignores a bad one', () => {
    expect(formatClock('2027-01-02T19:00:00Z', 'en', 'America/New_York')).toBe('2:00 PM')
    expect(formatClock('2027-01-02T19:00:00Z', 'en', 'Not/AZone')).toBe('7:00 PM')
  })

  it('shows an item with no end, with a description, in list variant', () => {
    const wrapper = render(InvitationItinerary, { items: [{ type: 'dance', title: 'Baile', description: 'Hasta tarde', startTime: '2027-01-02 22:00:00', endTime: null }] }, { props: { variant: 'list' } })
    expect(wrapper.text()).toContain('10:00 p.m.')
    expect(wrapper.text()).toContain('Hasta tarde')
    expect(wrapper.find('.inv-badge').exists()).toBe(false)
  })

  it('renders own and bank dress code photos', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ images: [] }) }))
    const wrapper = render(InvitationDressCode, { type: 'formal', description: '', reservedColors: [], suggestedColors: [], images: [{ source: 'upload', url: 'https://x.test/a.jpg' }, { source: 'bank', bankKey: 'zzz' }] })
    await flushPromises()
    expect(fetch).toHaveBeenCalledWith('/dress-code-bank/manifest.json')
    expect(wrapper.findAll('img')).toHaveLength(1)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    render(InvitationDressCode, { type: 'formal', reservedColors: [], suggestedColors: [], images: [{ source: 'bank', bankKey: 'zzz' }] })
    await flushPromises()
  })

  it('lays padrinos out as a grid with relationship and thanks', () => {
    const wrapper = render(InvitationPadrinos, { items: [{ name: 'Marta', relationship: 'Madrina', sponsors: [], thanks: 'Gracias' }] }, { props: { variant: 'grid' } })
    expect(wrapper.text()).toContain('Madrina')
    expect(wrapper.text()).toContain('Gracias')
    expect(wrapper.text()).not.toContain('Su regalo')
    expect(wrapper.get('ul').classes()).toContain('grid')
  })

  it('uses the plain closing variant', () => {
    expect(render(InvitationClosing, {}, { props: { variant: 'plain' } }).find('.inv-watermark').exists()).toBe(false)
  })
})
