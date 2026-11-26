import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n from '@/locales/i18n'

const mocks = vi.hoisted(() => ({ preview: vi.fn() }))
vi.mock('../services/TemplatePickerService', () => ({ default: mocks }))

import TemplateCard from '../components/TemplateCard.vue'
import { MINIATURE_SESSION, createMiniatureSession } from '../composables/useMiniatureSession'

const payload = id => ({ locale: 'es', theme: { colors: {} }, sections: [{ type: 'cover', title: `T${id}`, data: {} }, { type: 'rsvp', data: {} }] })
const tpl = (id, extra = {}) => ({ id, name: `Plantilla ${id}`, tier: 'free', locked: false, current: false, previewImage: null, description: { es: 'd', en: 'd' }, ...extra })
const err = status => Object.assign(new Error('x'), { response: { status } })

const wrappers = []
let session
function card(template, props = {}) {
  const w = mount(TemplateCard, {
    props: { template, eventId: 5, ...props },
    global: { plugins: [i18n], provide: { [MINIATURE_SESSION]: session } },
    attachTo: document.body
  })
  wrappers.push(w)
  return w
}
const ready = w => {
  const frame = w.get('[data-testid=miniature-frame]').element
  window.dispatchEvent(new MessageEvent('message', { data: { type: 'qv-preview-ready' }, origin: window.location.origin, source: frame.contentWindow }))
}

beforeEach(() => {
  i18n.global.locale.value = 'es'
  mocks.preview.mockReset()
  mocks.preview.mockImplementation(async (e, { templateId }) => payload(templateId))
  session = createMiniatureSession({ spacing: 0 })
})
afterEach(() => {
  wrappers.splice(0).forEach(w => w.unmount())
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('TemplateCard miniature', () => {
  it('draws the real cover of the event with that card\'s template and is still the button', async () => {
    const w = card(tpl(7))
    await flushPromises()
    expect(w.get('button').element.tagName).toBe('BUTTON')
    expect(mocks.preview).toHaveBeenCalledWith(5, { templateId: 7, locale: 'es' })
    expect(w.find('[data-testid=miniature-frame]').exists()).toBe(true)
    expect(w.text()).not.toContain('Sin imagen')
    await w.get('button').trigger('click')
    expect(w.emitted('select')[0][0].id).toBe(7)
  })

  it('keeps the miniature inert and gives it a text alternative', async () => {
    const w = card(tpl(7))
    await flushPromises()
    const frame = w.get('[data-testid=miniature-frame]')
    expect(frame.attributes('aria-hidden')).toBe('true')
    expect(frame.attributes('tabindex')).toBe('-1')
    expect(w.get('[data-testid=invitation-miniature]').attributes('aria-label')).toContain('Plantilla 7')
  })

  it('loads lazily: nothing is asked until the card scrolls into view', async () => {
    let notify
    vi.stubGlobal('IntersectionObserver', class { constructor(cb) { notify = cb } observe() {} disconnect() {} })
    const w = card(tpl(7))
    await flushPromises()
    expect(mocks.preview).not.toHaveBeenCalled()
    notify([{ isIntersecting: true }])
    await flushPromises()
    expect(mocks.preview).toHaveBeenCalledTimes(1)
    expect(w.find('[data-testid=miniature-frame]').exists()).toBe(true)
  })

  it('at most 2 iframes boot at once; the rest queue in order and go as the first ones draw', async () => {
    const ws = [1, 2, 3, 4].map(id => card(tpl(id)))
    await flushPromises()
    expect(ws.map(w => w.find('[data-testid=miniature-frame]').exists())).toEqual([true, true, false, false])
    expect(session.slots.stats()).toMatchObject({ active: 2, waiting: 2 })
    ready(ws[0])
    await flushPromises()
    expect(ws.map(w => w.find('[data-testid=miniature-frame]').exists())).toEqual([true, true, true, false])
    ready(ws[1])
    await flushPromises()
    expect(ws[3].find('[data-testid=miniature-frame]').exists()).toBe(true)
    expect(ws[0].find('[data-testid=miniature-frame]').exists()).toBe(true) // drawn ones stay
  })

  it('unloads the iframe when the card leaves the screen and draws it again from the cache when it returns', async () => {
    let notify
    vi.stubGlobal('IntersectionObserver', class { constructor(cb) { notify = cb } observe() {} disconnect() {} })
    const w = card(tpl(7))
    notify([{ isIntersecting: true }])
    await flushPromises()
    ready(w)
    await flushPromises()
    expect(w.get('[data-testid=invitation-miniature]').attributes('data-state')).toBe('ready')
    notify([{ isIntersecting: false }])
    await flushPromises()
    expect(w.find('[data-testid=miniature-frame]').exists()).toBe(false)
    notify([{ isIntersecting: true }])
    await flushPromises()
    expect(w.find('[data-testid=miniature-frame]').exists()).toBe(true)
    expect(mocks.preview).toHaveBeenCalledTimes(1)
  })

  it('a new card for the same template (coming back from a detail, reopening) does not call the API again', async () => {
    card(tpl(7))
    card(tpl(8))
    await flushPromises()
    wrappers.splice(0).forEach(w => w.unmount())
    card(tpl(7))
    card(tpl(8))
    await flushPromises()
    expect(mocks.preview).toHaveBeenCalledTimes(2)
  })

  it('a locked premium template is looked at as well', async () => {
    const w = card(tpl(9, { tier: 'premium', locked: true }))
    await flushPromises()
    expect(mocks.preview).toHaveBeenCalledWith(5, { templateId: 9, locale: 'es' })
    expect(w.find('[data-testid=miniature-frame]').exists()).toBe(true)
    expect(w.text()).not.toContain('Se desbloquea')
    expect(w.find('[aria-hidden=true] svg').exists()).toBe(true)
  })

  it('falls back to the template image, then to the stationery card, when the cover fails', async () => {
    mocks.preview.mockRejectedValue(err(500))
    const withImage = card(tpl(1, { previewImage: 'https://x.test/1.webp' }))
    const bare = card(tpl(2))
    await flushPromises()
    expect(withImage.get('[data-testid=miniature-image]').attributes('src')).toBe('https://x.test/1.webp')
    expect(bare.find('[data-testid=miniature-card]').exists()).toBe(true)
    expect(bare.find('[data-testid=miniature-frame]').exists()).toBe(false)
  })

  it('on a 429 shows the fallback and retries once, quietly, after the delay', async () => {
    vi.useFakeTimers()
    mocks.preview.mockRejectedValueOnce(err(429))
    const w = card(tpl(1), { retryDelay: 1000 })
    await vi.advanceTimersByTimeAsync(0)
    expect(w.get('[data-testid=invitation-miniature]').attributes('data-state')).toBe('fallback')
    await vi.advanceTimersByTimeAsync(7000)
    expect(mocks.preview).toHaveBeenCalledTimes(2)
    expect(w.find('[data-testid=miniature-frame]').exists()).toBe(true)
  })

  it('retries only once and never when the role cannot preview (403)', async () => {
    vi.useFakeTimers()
    mocks.preview.mockRejectedValue(err(500))
    const a = card(tpl(1), { retryDelay: 100 })
    await vi.advanceTimersByTimeAsync(5000)
    expect(mocks.preview).toHaveBeenCalledTimes(2)
    expect(a.get('[data-testid=invitation-miniature]').attributes('data-state')).toBe('fallback')
    mocks.preview.mockReset()
    mocks.preview.mockRejectedValue(err(403))
    card(tpl(2), { retryDelay: 100 })
    await vi.advanceTimersByTimeAsync(5000)
    expect(mocks.preview).toHaveBeenCalledTimes(1)
  })

  it('does not call the API when live is off', async () => {
    const w = card(tpl(1), { live: false })
    await flushPromises()
    expect(mocks.preview).not.toHaveBeenCalled()
    expect(w.find('[data-testid=miniature-card]').exists()).toBe(true)
  })
})
