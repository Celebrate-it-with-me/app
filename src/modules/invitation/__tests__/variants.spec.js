import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, ref } from 'vue'
import i18n from '@/locales/i18n'
import { INVITATION_KEY } from '../composables/useInvitation'
import { FrameScope } from '../composables/frame'
import InvitationItinerary from '../components/InvitationItinerary.vue'
import InvitationPadrinos from '../components/InvitationPadrinos.vue'
import InvitationCountdown from '../components/InvitationCountdown.vue'
import InvitationDressCode from '../components/InvitationDressCode.vue'
import InvitationLocations from '../components/InvitationLocations.vue'
import InvitationGallery from '../components/InvitationGallery.vue'
import InvitationMusic from '../components/InvitationMusic.vue'
import InvitationRsvp from '../components/InvitationRsvp.vue'
import InvitationLangSwitch from '../components/InvitationLangSwitch.vue'
import InvitationSection from '../components/InvitationSection.vue'

const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: 'es' })
const context = (extra = {}) => ({
  invitation: ref({ locale: 'es', event: { typeSlug: 'quinceanera' }, sections: [] }),
  locale: ref('es'),
  tt,
  preview: false,
  formatDate: () => '10 de diciembre',
  slug: () => 'x',
  code: () => 'y',
  updateSection: () => {},
  ...extra
})
const mountWith = (component, props, ctx = context()) =>
  mount(component, { props, global: { provide: { [INVITATION_KEY]: ctx }, stubs: { InvitationPetals: true } } })

const item = { type: 'ceremony', title: 'Misa', description: 'En la iglesia', startTime: '2026-12-28 17:00:00', endTime: null }
const place = { type: 'ceremony', name: 'Iglesia', address: 'Calle 8', city: 'Miami', state: 'FL', zipCode: '33101', startTime: null, latitude: null, longitude: null, directions: null, images: [], links: {} }

describe('component variants keep the built-in look by default', () => {
  it('itinerary: timeline has the icon badges, list drops them', () => {
    const section = { type: 'itinerary', title: 'Programa', text: null, data: { items: [item] } }
    expect(mountWith(InvitationItinerary, { section }).find('.inv-badge').exists()).toBe(true)
    const list = mountWith(InvitationItinerary, { section, variant: 'list' })
    expect(list.find('.inv-badge').exists()).toBe(false)
    expect(list.find('.inv-itinerary').attributes('data-variant')).toBe('list')
  })

  it('padrinos: list is a flex column, grid a grid', () => {
    const section = { type: 'padrinos', title: 'P', text: null, data: { items: [{ name: 'Ana', relationship: null, sponsors: [], thanks: null }] } }
    expect(mountWith(InvitationPadrinos, { section }).find('ul').classes()).toContain('flex')
    expect(mountWith(InvitationPadrinos, { section, variant: 'grid' }).find('ul').classes()).toContain('grid')
  })

  it('countdown: compact is one line', () => {
    const section = { type: 'countdown', title: null, text: null, data: { startsAt: '2099-01-01T10:00:00' } }
    expect(mountWith(InvitationCountdown, { section }).find('dl').exists()).toBe(true)
    const compact = mountWith(InvitationCountdown, { section, format: 'compact' })
    expect(compact.find('dl').exists()).toBe(false)
    expect(compact.find('.inv-countdown--compact').exists()).toBe(true)
  })

  it('dress code: plain shows names without colour circles', () => {
    const section = { type: 'dress_code', title: null, text: null, data: { type: 'formal', description: null, reservedColors: ['Rojo'], suggestedColors: [], images: [] } }
    expect(mountWith(InvitationDressCode, { section }).findAll('li span[aria-hidden=true]').length).toBeGreaterThan(0)
    expect(mountWith(InvitationDressCode, { section, variant: 'plain' }).findAll('li span[aria-hidden=true]')).toHaveLength(0)
  })

  it('locations: list drops the panel, maps=false drops the map button', () => {
    const section = { type: 'locations', title: null, text: null, data: { items: [place] } }
    expect(mountWith(InvitationLocations, { section }).find('.inv-panel').exists()).toBe(true)
    expect(mountWith(InvitationLocations, { section }).find('button[aria-expanded]').exists()).toBe(true)
    const plain = mountWith(InvitationLocations, { section, variant: 'list', maps: false })
    expect(plain.find('.inv-panel').exists()).toBe(false)
    expect(plain.find('button[aria-expanded]').exists()).toBe(false)
  })

  it('gallery: props override the section settings (layout, columns, max, captions)', () => {
    const photos = Array.from({ length: 6 }, (_, i) => ({ id: i, url: `https://x.test/${i}.jpg`, title: `T${i}`, description: null, year: null }))
    const section = { type: 'gallery', title: null, text: null, settings: { layout: 'grid', showCaptions: true }, data: { photos } }
    const w = mountWith(InvitationGallery, { section, layout: 'carousel', max: 4, captions: false })
    expect(w.find('[data-layout=carousel]').exists()).toBe(true)
    expect(w.findAll('img')).toHaveLength(4)
    expect(w.text()).not.toContain('T1')
    expect(mountWith(InvitationGallery, { section, columns: 4 }).find('[data-layout=grid]').classes().join(' ')).toContain('sm:grid-cols-4')
  })

  it('music: default keeps the bar-on-phone layout, button/bar force one', () => {
    const section = { type: 'music', title: null, settings: {}, data: { url: 'https://x.test/a.mp3', title: 'Song' } }
    expect(mountWith(InvitationMusic, { section }).find('.inv-music').classes()).toContain('sm:right-4')
    const button = mountWith(InvitationMusic, { section, variant: 'button' })
    expect(button.find('.inv-music').classes()).toContain('right-4')
    expect(button.find('.inv-music').classes()).not.toContain('inset-x-0')
    expect(mountWith(InvitationMusic, { section, variant: 'bar' }).find('.inv-music').classes()).toContain('inset-x-0')
  })

  it('rsvp: paper is a flat panel, inline has none', () => {
    const data = { guest: { id: 1, name: 'A', status: 'pending' }, companions: [], note: null, canEditNames: true, deadline: null, isOpen: true }
    const section = { type: 'rsvp', title: null, text: null, data }
    expect(mountWith(InvitationRsvp, { section }).find('.inv-panel').attributes('data-variant')).toBe('card')
    expect(mountWith(InvitationRsvp, { section, variant: 'paper' }).find('.inv-panel').attributes('data-variant')).toBe('flat')
    expect(mountWith(InvitationRsvp, { section, variant: 'inline' }).find('.inv-panel').exists()).toBe(false)
  })

  it('language switch: dropdown is a labelled select that emits the choice', async () => {
    const w = mount(InvitationLangSwitch, { props: { current: 'es', label: 'Idioma', variant: 'dropdown' } })
    expect(w.find('select').attributes('aria-label')).toBe('Idioma')
    await w.find('select').setValue('en')
    expect(w.emitted('change')[0]).toEqual(['en'])
    expect(mount(InvitationLangSwitch, { props: { current: 'es', label: 'Idioma' } }).find('[role=group]').exists()).toBe(true)
  })
})

describe('frame scope', () => {
  const section = { id: 'x' }
  const frameOf = frame =>
    mount({ render: () => h(FrameScope, { frame }, () => h(InvitationSection, { id: 'locations', title: 'Título', text: 'Texto' }, () => 'cuerpo')) })

  it('full (native): anchor id, flourish, heading', () => {
    const w = mount(InvitationSection, { props: { id: 'locations', title: 'Título', text: 'Texto' }, slots: { default: 'cuerpo' } })
    expect(w.find('section#locations').exists()).toBe(true)
    expect(w.find('h2').text()).toBe('Título')
    expect(section).toBeTruthy()
  })

  it('marks its band so the stylesheet can alternate runs of warm bands', () => {
    const mountBand = variant => mount(InvitationSection, { props: { id: 'x', title: 'T', variant }, slots: { default: 'c' } })
    expect(mountBand('alt').get('section').attributes('data-band')).toBe('alt')
    expect(mountBand('deep').get('section').attributes('data-band')).toBe('deep')
    expect(mountBand().get('section').attributes('data-band')).toBe('plain')
  })

  it('inside a package: full has no anchor of its own, no-title drops heading and text, bare is only the content', () => {
    const full = frameOf('full')
    expect(full.find('section').attributes('id')).toBeUndefined()
    expect(full.find('h2').exists()).toBe(true)
    const noTitle = frameOf('no-title')
    expect(noTitle.find('h2').exists()).toBe(false)
    expect(noTitle.find('.inv-section__flourish').exists()).toBe(true)
    const bare = frameOf('bare')
    expect(bare.find('section').exists()).toBe(false)
    expect(bare.text()).toBe('cuerpo')
  })
})
