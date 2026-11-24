import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import i18n from '@/locales/i18n'
import { INVITATION_KEY } from '../composables/useInvitation'
import InvitationRsvpFab from '../components/InvitationRsvpFab.vue'

const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: 'es' })

/** Moves the page: where the bottom of the cover and the top of the RSVP are relative to the viewport. */
function scrollTo({ coverBottom, rsvpTop }) {
  const cover = document.querySelector('.inv-cover')
  const target = document.getElementById('rsvp')
  if (cover) cover.getBoundingClientRect = () => ({ bottom: coverBottom })
  if (target) target.getBoundingClientRect = () => ({ top: rsvpTop })
  window.dispatchEvent(new Event('scroll'))
}
const COVER_ON = { coverBottom: 400, rsvpTop: 2000 }
const PAST_COVER = { coverBottom: -200, rsvpTop: 1500 }

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
  return { wrapper, root, target: root.querySelector('#rsvp') }
}
const go = async position => {
  scrollTo(position)
  await flushPromises()
}
const button = wrapper => wrapper.find('[data-testid="invitation-rsvp-fab"]')

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', callback => (queueMicrotask(callback), 1))
  vi.stubGlobal('innerHeight', 844)
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => {
  vi.unstubAllGlobals()
  page?.remove()
  document.body.innerHTML = ''
})

describe('InvitationRsvpFab', () => {
  it('stays hidden while the cover is on screen and appears once it scrolls away', async () => {
    const { wrapper } = await mountFab()
    await go(COVER_ON)
    expect(button(wrapper).exists()).toBe(false)
    await go(PAST_COVER)
    expect(button(wrapper).exists()).toBe(true)
    expect(button(wrapper).text()).toBe(tt('confirmCta'))
  })

  it('goes away when the RSVP reaches the screen and stays away once the guest is past it', async () => {
    const { wrapper } = await mountFab()
    await go(PAST_COVER)
    expect(button(wrapper).exists()).toBe(true)
    await go({ coverBottom: -1500, rsvpTop: 100 })
    expect(button(wrapper).exists()).toBe(false)
    await go({ coverBottom: -3000, rsvpTop: -900 })
    expect(button(wrapper).exists()).toBe(false)
  })

  it('comes back when the guest jumps from below the RSVP to between the cover and the RSVP', async () => {
    const { wrapper } = await mountFab()
    await go({ coverBottom: -3000, rsvpTop: -900 })
    await go(PAST_COVER)
    expect(button(wrapper).exists()).toBe(true)
  })

  it('offers "change my answer" once the guest has replied', async () => {
    const { wrapper } = await mountFab({ sections: [rsvpSection({ guest: { id: 1, status: 'attending' } })] })
    await go(PAST_COVER)
    expect(button(wrapper).text()).toBe(tt('rsvp.change'))
    expect(button(wrapper).attributes('aria-label')).toBe(`${tt('rsvp.change')}: ${tt('rsvpFab.changeHint')}`)
  })

  it('has a labelled, real button with the stable package hook', async () => {
    const { wrapper } = await mountFab()
    await go(PAST_COVER)
    const fab = button(wrapper)
    expect(fab.element.tagName).toBe('BUTTON')
    expect(fab.attributes('aria-label')).toBe(`${tt('confirmCta')}: ${tt('rsvpFab.confirmHint')}`)
    expect(fab.classes()).toContain('inv-q--rsvp-fab')
    expect(fab.attributes('data-inv-fab')).toBe('rsvp')
    expect(fab.attributes('data-inv-system-ui')).toBeDefined()
    expect(fab.classes()).toContain('min-h-12')
  })

  it.each([
    ['there is no RSVP section', { sections: [{ type: 'closing', data: {} }] }],
    ['the RSVP is closed', { sections: [rsvpSection({ isOpen: false })] }],
    ['the page has no #rsvp to scroll to', { rsvp: false }]
  ])('never appears when %s', async (_name, options) => {
    const { wrapper } = await mountFab(options)
    await go(PAST_COVER)
    expect(button(wrapper).exists()).toBe(false)
  })

  it('is available from the start when the page has no cover to wait for', async () => {
    const { wrapper } = await mountFab({ cover: false })
    await go({ rsvpTop: 1500 })
    expect(button(wrapper).exists()).toBe(true)
  })

  it('is not drawn when the package already shows its own floating CTA', async () => {
    const { wrapper } = await mountFab({ ctaStyle: 'position: fixed; bottom: 0' })
    await go(PAST_COVER)
    expect(button(wrapper).exists()).toBe(false)
  })

  it('still draws when the package CTA is an ordinary block', async () => {
    const { wrapper } = await mountFab({ ctaStyle: 'margin: 0' })
    await go(PAST_COVER)
    expect(button(wrapper).exists()).toBe(true)
  })

  it.each([
    [null, 'none', 'bottom-[max(1rem,env(safe-area-inset-bottom))]'],
    [true, 'phone', 'bottom-20'],
    ['bar', 'always', 'bottom-20'],
    ['button', 'none', 'bottom-[max(1rem,env(safe-area-inset-bottom))]']
  ])('stacks above the music control (music %s -> %s)', async (music, stack, cls) => {
    const { wrapper } = await mountFab({ music })
    await go(PAST_COVER)
    const holder = wrapper.get('.inv-rsvp-fab')
    expect(holder.attributes('data-stack')).toBe(stack)
    expect(holder.classes()).toContain(cls)
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
    vi.stubGlobal('matchMedia', query => ({ matches: reduced && /reduce/.test(query), media: query }))
    const { wrapper, target } = await mountFab()
    await go(PAST_COVER)
    const focus = vi.spyOn(document.getElementById('first'), 'focus')
    await button(wrapper).trigger('click')
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior, block: 'start' })
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  })

  it('does nothing on tap when the RSVP vanished meanwhile', async () => {
    const { wrapper, target } = await mountFab()
    await go(PAST_COVER)
    target.remove()
    await button(wrapper).trigger('click')
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })

  it('stops listening to the page when it unmounts', async () => {
    const { wrapper } = await mountFab()
    const off = vi.spyOn(window, 'removeEventListener')
    wrapper.unmount()
    expect(off).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(off).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
