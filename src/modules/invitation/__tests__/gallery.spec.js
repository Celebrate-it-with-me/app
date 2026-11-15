import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import i18n from '@/locales/i18n'
import { INVITATION_KEY } from '../composables/useInvitation'
import InvitationGallery from '../components/InvitationGallery.vue'

const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: 'es' })

const photos = [
  { id: 1, url: 'https://x.test/1.jpg', thumbUrl: 'https://x.test/t1.jpg', title: '<b>Mis 5 años</b>', description: null, year: 2016 },
  { id: 2, url: 'https://x.test/2.jpg', thumbUrl: 'https://x.test/t2.jpg', title: null, description: null, year: null },
  { id: 3, url: 'https://x.test/3.jpg', thumbUrl: 'https://x.test/t3.jpg', title: null, description: 'Con la abuela', year: null }
]

function mountGallery(settings = { layout: 'grid', showCaptions: true }, list = photos) {
  return mount(InvitationGallery, {
    attachTo: document.body,
    props: { section: { type: 'gallery', title: 'Recuerdos', text: null, settings, data: { photos: list } } },
    global: { provide: { [INVITATION_KEY]: { invitation: ref({ locale: 'es' }), tt } } }
  })
}

describe('InvitationGallery', () => {
  it('lazy-loads every photo and falls back to a numbered alt text', () => {
    const wrapper = mountGallery()
    const images = wrapper.findAll('img')
    expect(images).toHaveLength(3)
    expect(images.every(img => img.attributes('loading') === 'lazy')).toBe(true)
    expect(images[1].attributes('alt')).toBe(tt('gallery.photoOf', { n: 2, total: 3 }))
    expect(images[2].attributes('alt')).toBe('Con la abuela')
    wrapper.unmount()
  })

  it('shows titles as text, never as HTML', () => {
    const wrapper = mountGallery()
    expect(wrapper.find('b').exists()).toBe(false)
    expect(wrapper.text()).toContain('<b>Mis 5 años</b> · 2016')
    wrapper.unmount()
  })

  it('hides captions when asked and renders a carousel without auto advance', () => {
    const wrapper = mountGallery({ layout: 'carousel', showCaptions: false })
    expect(wrapper.find('[data-layout="carousel"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('2016')
    wrapper.unmount()
  })

  it('opens the viewer, moves with the arrow keys and closes with Escape', async () => {
    const wrapper = mountGallery()
    await wrapper.findAll('ul button')[0].trigger('click')
    const dialog = () => document.body.querySelector('[role="dialog"]')
    expect(dialog()).not.toBeNull()
    expect(dialog().textContent).toContain(tt('gallery.photoOf', { n: 1, total: 3 }))
    expect(dialog().querySelector(`button[aria-label="${tt('gallery.previous')}"]`).disabled).toBe(true)

    dialog().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(dialog().textContent).toContain(tt('gallery.photoOf', { n: 2, total: 3 }))

    dialog().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(dialog()).toBeNull()
    wrapper.unmount()
  })

  it('renders nothing without photos', () => {
    const wrapper = mountGallery(undefined, [])
    expect(wrapper.find('section').exists()).toBe(false)
    wrapper.unmount()
  })
})
