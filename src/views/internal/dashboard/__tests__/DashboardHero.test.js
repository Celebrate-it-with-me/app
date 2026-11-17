import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'

vi.mock('@/modules/template-picker/components/InvitationPreviewSheet.vue', () => ({
  default: { props: ['open', 'eventId'], template: '<div data-testid="preview-sheet" :data-open="open"></div>' }
}))

import DashboardHero from '../DashboardHero.vue'

const stubs = { RouterLink: { props: ['to'], template: '<a :data-to="JSON.stringify(to)"><slot /></a>' } }
const editTo = { name: 'edit-event', params: { id: 7 } }
const inDays = n => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} 18:00`
}
const mountHero = (props = {}) => {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return mount(DashboardHero, {
    props: { eventId: 7, name: 'Los XV de Valentina', startDate: inDays(142), progress: 0.5, published: true, slug: 'xv-de-valentina', canEdit: true, editTo, ...props },
    global: { plugins: [i18n, pinia], stubs }
  })
}
const button = (w, id) => w.find(`[data-testid=${id}]`)

beforeEach(() => setLocale('es'))
afterEach(() => vi.restoreAllMocks())

describe('DashboardHero countdown', () => {
  it('shows the days as the protagonist number', () => {
    const c = button(mountHero(), 'hero-countdown')
    expect(c.attributes('data-kind')).toBe('future')
    expect(c.text()).toContain('142')
    expect(c.text()).toContain('días')
  })
  it('uses the singular for one day', () => {
    expect(button(mountHero({ startDate: inDays(1) }), 'hero-countdown').text()).toMatch(/^1\s*día para/)
  })
  it('says it is today', () => {
    const c = button(mountHero({ startDate: inDays(0) }), 'hero-countdown')
    expect(c.attributes('data-kind')).toBe('today')
    expect(c.text()).toContain('hoy')
  })
  it('says it already happened', () => {
    const c = button(mountHero({ startDate: inDays(-5) }), 'hero-countdown')
    expect(c.attributes('data-kind')).toBe('past')
    expect(c.text()).toContain('Ya pasó')
  })
  it('without a date offers to set it (editors only)', () => {
    const w = mountHero({ startDate: '' })
    expect(button(w, 'hero-countdown').attributes('data-kind')).toBe('none')
    expect(button(w, 'hero-countdown').text()).toContain('Definir la fecha')
    expect(button(mountHero({ startDate: '', canEdit: false }), 'hero-countdown').text()).not.toContain('Definir la fecha')
  })
})

describe('DashboardHero published', () => {
  it('copies the invitation link', async () => {
    const writeText = vi.fn().mockResolvedValue()
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    await button(mountHero(), 'hero-share').trigger('click')
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/i/xv-de-valentina`)
  })
  it('offers WhatsApp with the message and link, in the current language', () => {
    const href = decodeURIComponent(button(mountHero(), 'hero-whatsapp').attributes('href'))
    expect(href.startsWith('https://wa.me/?text=')).toBe(true)
    expect(href).toContain('Te invito a Los XV de Valentina')
    expect(href).toContain('/i/xv-de-valentina')
  })
  it('writes the WhatsApp text in English', () => {
    setLocale('en')
    expect(decodeURIComponent(button(mountHero(), 'hero-whatsapp').attributes('href'))).toContain('You are invited to')
  })
  it('has no publish button and opens the preview', async () => {
    const w = mountHero()
    expect(button(w, 'hero-publish').exists()).toBe(false)
    expect(button(w, 'hero-draft-hint').exists()).toBe(false)
    await button(w, 'hero-view').trigger('click')
    expect(w.get('[data-testid=preview-sheet]').attributes('data-open')).toBe('true')
  })
})

describe('DashboardHero draft', () => {
  it('makes Publish the main action and hides sharing, with a short reason', () => {
    const w = mountHero({ published: false })
    expect(button(w, 'hero-publish').exists()).toBe(true)
    expect(JSON.parse(button(w, 'hero-publish').attributes('data-to')).name).toBe('edit-event')
    expect(button(w, 'hero-share').exists()).toBe(false)
    expect(button(w, 'hero-whatsapp').exists()).toBe(false)
    expect(button(w, 'hero-draft-hint').text()).toContain('borrador')
    expect(button(w, 'hero-status').text()).toContain('Borrador')
  })
})

describe('DashboardHero roles', () => {
  it('a viewer sees the event but no edit, publish or preview actions', () => {
    const w = mountHero({ canEdit: false, published: false })
    ;['hero-edit', 'hero-publish', 'hero-view', 'hero-share'].forEach(id => expect(button(w, id).exists()).toBe(false))
  })
  it('shows Edit event for editors', () => {
    expect(button(mountHero(), 'hero-edit').text()).toContain('Editar')
    expect(JSON.parse(button(mountHero(), 'hero-edit').attributes('data-to')).name).toBe('edit-event')
  })
})

describe('DashboardHero phone', () => {
  it('draws the template image when there is one', () => {
    const w = mountHero({ image: 'https://cdn.test/classic.webp' })
    expect(w.find('[data-testid=hero-phone-image]').attributes('src')).toBe('https://cdn.test/classic.webp')
    expect(w.find('[data-testid=hero-phone-fallback]').exists()).toBe(false)
  })
  it('draws an elegant fallback card without image, and after a broken image', async () => {
    const w = mountHero({ image: '' })
    expect(w.find('[data-testid=hero-phone-fallback]').text()).toContain('Los XV de Valentina')
    const w2 = mountHero({ image: 'https://cdn.test/broken.webp' })
    await w2.get('[data-testid=hero-phone-image]').trigger('error')
    expect(w2.find('[data-testid=hero-phone-fallback]').exists()).toBe(true)
  })
})

describe('DashboardHero progress', () => {
  it('keeps the discreet progress bar', () => {
    const bar = mountHero({ progress: 0.62 }).get('[role=progressbar]')
    expect(bar.attributes('aria-valuenow')).toBe('62')
  })
})
