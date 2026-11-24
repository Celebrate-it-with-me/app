import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import i18n from '@/locales/i18n'
import { INVITATION_KEY } from '../composables/useInvitation'
import InvitationRsvpFab from '../components/InvitationRsvpFab.vue'

const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: 'es' })

/** A controllable IntersectionObserver: tests push entries by hand. */
let observers = []
class FakeObserver {
  constructor(callback) {
    this.callback = callback
    this.targets = []
    observers.push(this)
  }
  observe(el) {
    this.targets.push(el)
  }
  disconnect() {
    this.targets = []
  }
}
const fire = (target, isIntersecting, top = 0) => {
  const observer = observers.find(item => item.targets.includes(target))
  observer.callback([{ target, isIntersecting, boundingClientRect: { top } }])
}

let page
const rsvpSection = (data = {}) => ({ type: 'rsvp', data: { isOpen: true, guest: { id: 1, status: 'pending' }, ...data } })

function setPage({ cover = true, rsvp = true, music = null, ctaStyle = null } = {}) {
  page = document.createElement('div')
  page.className = 'inv-root'
  page.innerHTML = [
    cover ? '<header class="inv-cover"></header>' : '',
    ctaStyle ? `<div style="${ctaStyle}"><div data-q="cta"></div></div>` : '',
    rsvp ? '<section id="rsvp"><input id="first" type="text" /></section>' : '',
    music ? `<div class="inv-music" ${music === true ? '' : `data-variant="${music}"`}></div>` : ''
  ].join('')
  document.body.appendChild(page)
  return page
}

async function mountFab({ sections = [rsvpSection()], ...pageOptions } = {}) {
  const root = setPage(pageOptions)
  const wrapper = mount(InvitationRsvpFab, {
    attachTo: document.body,
    global: { provide: { [INVITATION_KEY]: { invitation: ref({ sections }), tt } } }
  })
  await flushPromises()
  return { wrapper, root, cover: root.querySelector('.inv-cover'), target: root.querySelector('#rsvp') }
}
const button = wrapper => wrapper.find('[data-testid="invitation-rsvp-fab"]')

beforeEach(() => {
  observers = []
  vi.stubGlobal('IntersectionObserver', FakeObserver)
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => {
  vi.unstubAllGlobals()
  page?.remove()
  document.body.innerHTML = ''
})

describe('InvitationRsvpFab', () => {
  it('stays hidden while the cover is on screen and appears once it scrolls away', async () => {
    const { wrapper, cover } = await mountFab()
    expect(button(wrapper).exists()).toBe(false)
    fire(cover, true)
    fire(document.getElementById('rsvp'), false, 2000)
    await flushPromises()
    expect(button(wrapper).exists()).toBe(false)
    fire(cover, false)
    await flushPromises()
    expect(button(wrapper).exists()).toBe(true)
    expect(button(wrapper).text()).toBe(tt('confirmCta'))
  })

  it('goes away when the RSVP reaches the screen and does not come back once the guest is past it', async () => {
    const { wrapper, cover, target } = await mountFab()
    fire(cover, false)
    fire(target, false, 1500)
    await flushPromises()
    expect(button(wrapper).exists()).toBe(true)
    fire(target, true, 100)
    await flushPromises()
    expect(button(wrapper).exists()).toBe(false)
    fire(target, false, -900)
    await flushPromises()
    expect(button(wrapper).exists()).toBe(false)
  })

  it('offers "change my answer" once the guest has replied', async () => {
    const { wrapper, cover, target } = await mountFab({ sections: [rsvpSection({ guest: { id: 1, status: 'attending' } })] })
    fire(cover, false)
    fire(target, false, 1500)
    await flushPromises()
    expect(button(wrapper).text()).toBe(tt('rsvp.change'))
    expect(button(wrapper).attributes('aria-label')).toBe(`${tt('rsvp.change')}: ${tt('rsvpFab.changeHint')}`)
  })

  it('has a labelled, real button with the stable package hook', async () => {
    const { wrapper, cover, target } = await mountFab()
    fire(cover, false)
    fire(target, false, 1500)
    await flushPromises()
    const fab = button(wrapper)
    expect(fab.element.tagName).toBe('BUTTON')
    expect(fab.attributes('aria-label')).toBe(`${tt('confirmCta')}: ${tt('rsvpFab.confirmHint')}`)
    expect(fab.classes()).toContain('inv-q--rsvp-fab')
    expect(fab.attributes('data-inv-fab')).toBe('rsvp')
    expect(fab.attributes('data-inv-system-ui')).toBeDefined()
    expect(fab.classes().join(' ')).toContain('min-h-12')
  })

  it.each([
    ['there is no RSVP section', { sections: [{ type: 'closing', data: {} }] }],
    ['the RSVP is closed', { sections: [rsvpSection({ isOpen: false })] }],
    ['the page has no #rsvp to scroll to', { rsvp: false }]
  ])('never appears when %s', async (_name, options) => {
    const { wrapper, cover, target } = await mountFab(options)
    fire(cover, false)
    if (target) fire(target, false, 1500)
    await flushPromises()
    expect(button(wrapper).exists()).toBe(false)
  })

  it('appears from the start when the page has no cover to observe', async () => {
    const { wrapper, target } = await mountFab({ cover: false })
    fire(target, false, 1500)
    await flushPromises()
    expect(button(wrapper).exists()).toBe(true)
  })

  it('is not drawn when the package already shows its own floating CTA', async () => {
    const { wrapper, cover, target } = await mountFab({ ctaStyle: 'position: fixed; bottom: 0' })
    fire(cover, false)
    fire(target, false, 1500)
    await flushPromises()
    expect(button(wrapper).exists()).toBe(false)
  })

  it('sits where the music control leaves room', async () => {
    const none = await mountFab()
    expect(none.wrapper.get('.inv-rsvp-fab').attributes('data-stack')).toBe('none')
    none.wrapper.unmount()
    none.root.remove()
    const phone = await mountFab({ music: true })
    fire(phone.cover, false)
    expect(phone.wrapper.get('.inv-rsvp-fab').attributes('data-stack')).toBe('phone')
    expect(phone.wrapper.get('.inv-rsvp-fab').classes()).toContain('bottom-20')
    phone.wrapper.unmount()
    phone.root.remove()
    const bar = await mountFab({ music: 'bar' })
    fire(bar.cover, false)
    expect(bar.wrapper.get('.inv-rsvp-fab').attributes('data-stack')).toBe('always')
    bar.wrapper.unmount()
    bar.root.remove()
    const floating = await mountFab({ music: 'button' })
    fire(floating.cover, false)
    expect(floating.wrapper.get('.inv-rsvp-fab').attributes('data-stack')).toBe('none')
  })

  it('animates only opacity and translate, 150-220 ms ease-out, and switches the motion off for reduced-motion guests', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/modules/invitation/components/InvitationRsvpFab.vue'), 'utf8')
    const transitions = source.match(/(?:enter|leave)-active-class="[^"]+"/g)
    expect(transitions).toHaveLength(2)
    for (const classes of transitions) {
      expect(classes).toContain('transition-[opacity,translate]')
      expect(classes).toMatch(/duration-(\[220ms\]|150)/)
      expect(classes).toContain('ease-out')
      expect(classes).toContain('motion-reduce:transition-none')
    }
    expect(source).not.toMatch(/transition-all|animate-/)
  })

  it.each([
    [false, 'smooth'],
    [true, 'auto']
  ])('scrolls to the RSVP and focuses its first control (reduced motion: %s)', async (reduced, behavior) => {
    vi.stubGlobal('matchMedia', query => ({ matches: reduced && /reduce/.test(query), media: query, addEventListener() {}, removeEventListener() {} }))
    const { wrapper, cover, target } = await mountFab()
    fire(cover, false)
    fire(target, false, 1500)
    await flushPromises()
    const first = document.getElementById('first')
    const focus = vi.spyOn(first, 'focus')
    await button(wrapper).trigger('click')
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior, block: 'start' })
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  })

  it('does nothing on tap when the RSVP vanished meanwhile', async () => {
    const { wrapper, cover, target } = await mountFab()
    fire(cover, false)
    fire(target, false, 1500)
    await flushPromises()
    target.remove()
    await button(wrapper).trigger('click')
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })

  it('shows nothing and does not fail without IntersectionObserver, and disconnects on unmount', async () => {
    vi.unstubAllGlobals()
    delete globalThis.IntersectionObserver
    const without = await mountFab()
    expect(button(without.wrapper).exists()).toBe(false)
    without.wrapper.unmount()
    without.root.remove()
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const { wrapper } = await mountFab()
    const [observer] = observers.slice(-1)
    wrapper.unmount()
    expect(observer.targets).toEqual([])
  })
})
