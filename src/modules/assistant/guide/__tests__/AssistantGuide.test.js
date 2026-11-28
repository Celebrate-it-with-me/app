import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp, effectScope, nextTick, ref } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const svc = vi.hoisted(() => ({ next: vi.fn(), plan: vi.fn(), act: vi.fn() }))
vi.mock('../../services/AssistantService', () => ({ default: svc }))
const imp = vi.hoisted(() => ({ active: false }))
vi.mock('@/modules/impersonation/stores/useImpersonationStore', () => ({ useImpersonationStore: () => imp }))
const support = vi.hoisted(() => ({ send: vi.fn() }))
vi.mock('@/modules/support/services/SupportService', () => ({ default: support }))

import AssistantGuide from '../AssistantGuide.vue'
import { useFloatingBarSpace } from '@/composables/useFloatingBarSpace'

const task = (key, over = {}) => ({
  key, phase: 'foundation', title: `Tarea ${key}`, state: 'next', reason: `Razon ${key}`, reasonCode: 'time_window', reasonParams: {},
  route: '/dashboard/budget', moduleKey: 'budget', moduleLocked: false, doneBy: null, blockedBy: [], snoozedUntil: null, ...over
})
const NEXT = {
  mode: 'normal', monthsLeft: 11.2, daysLeft: 340, steps: [task('a'), task('b'), task('c')], allSet: false,
  progress: { done: 5, total: 13, ratio: 0.38 }
}
const ROUTES = [
  { path: '/', component: { template: '<div />' } },
  { path: '/:p(.*)*', component: { template: '<div />' } }
]

let wrapper
let router
async function mountGuide({ userRole = 'owner', path = '/dashboard/events', next = NEXT, slug = 'quinceanera', dock = false } = {}) {
  if (dock) document.body.insertAdjacentHTML('beforeend', '<header><div id="shell-help-dock"></div></header>')
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  const events = useEventsStore()
  events.eventTypes = [{ id: 1, slug: 'quinceanera' }, { id: 2, slug: 'wedding' }]
  events.activeEvent = { id: 7, userRole, eventType: slug === 'wedding' ? 2 : 1 }
  svc.next.mockResolvedValue(next)
  svc.plan.mockResolvedValue({ mode: 'normal', progress: next.progress, phases: [], overdue: [], hidden: [], custom: [] })
  router = createRouter({ history: createMemoryHistory(), routes: ROUTES })
  await router.push(path)
  wrapper = mount(AssistantGuide, { global: { plugins: [i18n, pinia, router] }, attachTo: document.body })
  await flushPromises()
}
const trigger = () => document.querySelector('[data-testid=guide-trigger]')
const q = id => document.querySelector(`[data-testid=${id}]`)
const open = async () => {
  trigger().click()
  await flushPromises()
  await nextTick()
}

beforeEach(() => {
  setLocale('es')
  localStorage.clear()
  sessionStorage.clear()
  Object.values(svc).forEach(m => m.mockReset())
  support.send.mockReset()
  imp.active = false
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('AssistantGuide on the Inicio', () => {
  it('is only the help icon on /dashboard, where "Lo que toca ahora" shows the steps', async () => {
    await mountGuide({ path: '/dashboard' })
    expect(trigger().dataset.variant).toBe('help')
    expect(q('guide-dot')).toBeNull()
    expect(trigger().textContent).not.toContain('Tu siguiente paso')
  })
  it('sits in the header dock (never floating over the blocks) when the layout offers one', async () => {
    await mountGuide({ path: '/dashboard', dock: true })
    expect(trigger().dataset.docked).toBe('true')
    expect(trigger().parentElement.id).toBe('shell-help-dock')
    expect(q('assistant-guide')).toBeNull()
    trigger().click()
    await flushPromises()
    expect(document.querySelector('[role=dialog]')).not.toBeNull()
  })
  it('floats again once it leaves the Inicio, even with the dock in the page', async () => {
    await mountGuide({ path: '/dashboard', dock: true })
    await router.push('/dashboard/events')
    await flushPromises()
    expect(trigger().dataset.docked).toBeUndefined()
    expect(q('assistant-guide')).not.toBeNull()
  })
  it('comes back as the pill on the other screens', async () => {
    await mountGuide({ path: '/dashboard' })
    await router.push('/dashboard/events')
    await flushPromises()
    expect(trigger().dataset.variant).toBe('pill')
  })
})

describe('AssistantGuide pill', () => {
  it('shows the pill with the pink dot for an unseen step', async () => {
    await mountGuide()
    expect(trigger().dataset.variant).toBe('pill')
    expect(trigger().textContent).toContain('Tu siguiente paso')
    expect(q('guide-dot')).not.toBeNull()
  })

  it('pulses softly while the step is unseen, and stops once the sheet was opened', async () => {
    await mountGuide()
    const pulse = q('guide-pulse')
    expect(pulse).not.toBeNull()
    expect(pulse.className).toContain('motion-reduce:hidden')
    await open()
    expect(q('guide-pulse')).toBeNull()
  })

  it('shrinks to an icon on work screens', async () => {
    await mountGuide({ path: '/dashboard/invitation' })
    expect(trigger().dataset.variant).toBe('icon')
    expect(trigger().textContent).not.toContain('Tu siguiente paso')
  })

  it('is not drawn at all during impersonation', async () => {
    imp.active = true
    await mountGuide()
    expect(trigger()).toBeNull()
  })

  it('is only the help icon for a viewer, and opens support', async () => {
    await mountGuide({ userRole: 'viewer' })
    expect(trigger().dataset.variant).toBe('help')
    expect(svc.next).not.toHaveBeenCalled()
    await open()
    expect(document.body.textContent).toContain('¿En qué te ayudamos?')
  })

  it('is the help icon when the plan is unsupported', async () => {
    await mountGuide({ next: { mode: 'unsupported', steps: [], allSet: false, progress: { done: 0, total: 0, ratio: 0 } } })
    expect(trigger().dataset.variant).toBe('help')
  })

  it('turns calm with nothing left', async () => {
    await mountGuide({ next: { ...NEXT, steps: [], allSet: true, progress: { done: 13, total: 13, ratio: 1 } } })
    expect(trigger().dataset.variant).toBe('calm')
    expect(q('guide-dot')).toBeNull()
    await open()
    expect(q('guide-title').textContent).toContain('Todo al día')
  })
})

describe('AssistantGuide sheet', () => {
  it('shows one action, the reason, what comes next and the progress, and puts the dot out', async () => {
    await mountGuide()
    await open()
    expect(q('guide-title').textContent).toContain('Tarea a')
    expect(q('guide-reason').textContent).toContain('Razon a')
    expect(q('guide-after').textContent).toContain('Tarea b')
    expect(q('guide-after').textContent).toContain('Tarea c')
    expect(q('guide-progress').textContent).toContain('Tu fiesta va al 38 %')
    expect(q('guide-progress').textContent).toContain('Faltan 11 meses')
    expect(q('guide-progress').querySelector('[role=progressbar]').getAttribute('aria-valuenow')).toBe('38')
    expect(localStorage.getItem('quinvite:guide:seen:7')).toBe('a')
    expect(q('guide-dot')).toBeNull()
    expect(document.querySelector('[role=dialog]').getAttribute('aria-labelledby')).toBeTruthy()
  })

  it('uses the sober wording for a wedding', async () => {
    await mountGuide({ slug: 'wedding' })
    await open()
    expect(q('guide-progress').textContent).toContain('Tu boda va al 38 %')
  })

  it('links the primary button to the task and "Ver todo" to the plan', async () => {
    await mountGuide()
    await open()
    expect(q('guide-go').getAttribute('href')).toBe('/dashboard/budget')
    expect(q('guide-see-all').getAttribute('href')).toBe('/dashboard/plan')
  })

  it('"Ahora no" snoozes the step for a week and refreshes', async () => {
    await mountGuide()
    svc.act.mockResolvedValue(task('a', { state: 'upcoming' }))
    await open()
    svc.next.mockResolvedValue({ ...NEXT, steps: [task('b'), task('c')] })
    q('guide-snooze').click()
    await flushPromises()
    expect(svc.act).toHaveBeenCalledWith(7, 'a', 'snooze', { days: 7 }, expect.anything())
    expect(q('guide-title').textContent).toContain('Tarea b')
  })

  it('"Ya lo hice" marks it done and moves on to the next step', async () => {
    window.matchMedia = vi.fn(() => ({ matches: true }))
    await mountGuide()
    svc.act.mockResolvedValue(task('a', { state: 'done' }))
    await open()
    svc.next.mockResolvedValue({ ...NEXT, steps: [task('b'), task('c')] })
    q('guide-done').click()
    await flushPromises()
    await new Promise(r => setTimeout(r, 50))
    await flushPromises()
    expect(svc.act).toHaveBeenCalledWith(7, 'a', 'done', {}, expect.anything())
    expect(q('guide-title').textContent).toContain('Tarea b')
  })

  it('"Ocultar por hoy" shrinks the pill for the session', async () => {
    await mountGuide()
    await open()
    q('guide-hide').click()
    await flushPromises()
    expect(trigger().dataset.variant).toBe('icon')
    expect(sessionStorage.getItem('quinvite:guide:compact')).toBe('1')
  })

  it('"¿Necesitas ayuda?" opens the support sheet and sends the message', async () => {
    await mountGuide()
    await open()
    q('guide-help').click()
    await flushPromises()
    await nextTick()
    expect(document.body.textContent).toContain('¿En qué te ayudamos?')
    const area = document.querySelector('textarea')
    area.value = 'Necesito ayuda con mis invitados'
    area.dispatchEvent(new Event('input'))
    support.send.mockResolvedValue({})
    document.querySelector('#support-form').dispatchEvent(new Event('submit', { cancelable: true }))
    await flushPromises()
    expect(support.send).toHaveBeenCalledTimes(1)
  })
})

describe('AssistantGuide lifts above a fixed bottom bar', () => {
  const lift = () => q('assistant-guide').style.getPropertyValue('--assistant-lift')
  const declareBar = (height, options) => {
    const bar = document.createElement('div')
    bar.getBoundingClientRect = () => ({ height })
    const el = ref(null)
    const scope = effectScope()
    scope.run(() => useFloatingBarSpace(el, options))
    el.value = bar
    return { el, stop: () => scope.stop() }
  }

  it('stays at its base position without a bar, and lifts by the bar height plus a gap when one shows up', async () => {
    await mountGuide()
    expect(lift()).toBe('0px')
    const bar = declareBar(48)
    await nextTick()
    expect(lift()).toBe('56px')
    bar.el.value = null
    await nextTick()
    expect(lift()).toBe('0px')
    bar.stop()
  })

  it('takes the tallest of several bars and drops back when they go away', async () => {
    await mountGuide()
    const a = declareBar(40)
    const b = declareBar(64)
    await nextTick()
    expect(lift()).toBe('72px')
    b.stop()
    await nextTick()
    expect(lift()).toBe('48px')
    a.stop()
    await nextTick()
    expect(lift()).toBe('0px')
  })

  it('beside an inline bar (the roster send button) it takes its icon form, centred on the bar row and never lifted', async () => {
    await mountGuide()
    const bar = declareBar(44, { inline: true })
    await nextTick()
    expect(lift()).toBe('-2px')
    expect(q('guide-trigger').getAttribute('data-variant')).not.toBe('pill')
    expect(q('guide-trigger').className).toContain('w-12')
    bar.stop()
    await nextTick()
    expect(lift()).toBe('0px')
  })

  it('animates the move and keeps the safe area in its base offset', async () => {
    await mountGuide()
    const cls = q('assistant-guide').className
    expect(cls).toContain('transition-[bottom,translate,opacity]')
    expect(cls).toContain('motion-reduce:transition-none')
    expect(cls).toContain('env(safe-area-inset-bottom')
    expect(cls).toContain('var(--assistant-lift')
  })
})

describe('AssistantGuide welcome bubble (ORG-027)', () => {
  const welcome = () => q('guide-welcome')
  const settle = async ms => {
    await vi.advanceTimersByTimeAsync(ms)
    await nextTick()
  }
  beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] }))
  afterEach(() => vi.useRealTimers())

  it('shows once, then closes by itself after 6 seconds', async () => {
    await mountGuide()
    await settle(1600)
    expect(welcome()).not.toBeNull()
    expect(localStorage.getItem('quinvite:guide:welcomed')).not.toBeNull()
    await settle(5000)
    expect(welcome()).not.toBeNull()
    await settle(1000)
    expect(welcome()).toBeNull()
  })

  it('closes on the first scroll', async () => {
    await mountGuide()
    await settle(1600)
    expect(welcome()).not.toBeNull()
    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(welcome()).toBeNull()
  })

  it('never shows again once it was shown', async () => {
    localStorage.setItem('quinvite:guide:welcomed', '1')
    await mountGuide()
    await settle(2000)
    expect(welcome()).toBeNull()
  })

  it('does not appear over a button, and is not spent when it holds back', async () => {
    const main = document.createElement('main')
    main.innerHTML = '<button id="cta">Publicar invitación</button>'
    document.body.append(main)
    // The trigger sits at the bottom right; the button is right above it, where the bubble would go.
    const box = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height })
    const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      if (this.dataset?.testid === 'guide-trigger') return box(300, 700, 80, 48)
      return this.id === 'cta' ? box(200, 640, 180, 44) : box(0, 0, 0, 0)
    })
    await mountGuide()
    await settle(2000)
    expect(welcome()).toBeNull()
    expect(localStorage.getItem('quinvite:guide:welcomed')).toBeNull()
    spy.mockRestore()
  })

  it('does not appear over readable text either (ORG-027), and is not spent', async () => {
    const main = document.createElement('main')
    main.innerHTML = '<p>Actividad reciente</p>'
    document.body.append(main)
    const rect = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height })
    const trigger = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      return this.dataset?.testid === 'guide-trigger' ? rect(900, 800, 150, 48) : rect(0, 0, 0, 0)
    })
    // The line of text sits where the bubble would be drawn (above the trigger).
    const lines = (Range.prototype.getClientRects = vi.fn(() => [rect(820, 720, 200, 20)]))
    await mountGuide()
    await settle(2000)
    expect(welcome()).toBeNull()
    expect(localStorage.getItem('quinvite:guide:welcomed')).toBeNull()
    expect(lines).toHaveBeenCalled()
    trigger.mockRestore()
    delete Range.prototype.getClientRects
  })
})

describe('AssistantGuide: hides while scrolling down on phones', () => {
  const phone = wide => {
    window.matchMedia = vi.fn(() => ({ matches: wide, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  }
  const scrollTo = async y => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    await new Promise(r => setTimeout(r, 40))
    await nextTick()
  }
  const box = () => q('assistant-guide')
  beforeEach(() => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 5000, configurable: true })
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  })
  afterEach(() => {
    delete window.matchMedia
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  })

  it('goes out inert and aria-hidden when scrolling down, and returns scrolling up', async () => {
    phone(false)
    await mountGuide()
    expect(box().hasAttribute('inert')).toBe(false)
    await scrollTo(400)
    expect(box().hasAttribute('inert')).toBe(true)
    expect(box().getAttribute('aria-hidden')).toBe('true')
    expect(box().className).toContain('opacity-0')
    expect(box().className).toContain('pointer-events-none')
    await scrollTo(300)
    expect(box().hasAttribute('inert')).toBe(false)
    expect(box().getAttribute('aria-hidden')).toBeNull()
  })

  it('never hides from 768 px up', async () => {
    phone(true)
    await mountGuide()
    await scrollTo(400)
    expect(box().hasAttribute('inert')).toBe(false)
    expect(box().className).not.toContain('opacity-0')
  })

  it('stays visible while its sheet is open or the focus is inside', async () => {
    phone(false)
    await mountGuide()
    trigger().focus()
    await scrollTo(400)
    expect(box().hasAttribute('inert')).toBe(false)
    trigger().blur()
    await nextTick()
    await scrollTo(800)
    expect(box().hasAttribute('inert')).toBe(true)
    await scrollTo(700)
    await open()
    await scrollTo(1200)
    expect(box().hasAttribute('inert')).toBe(false)
  })
})
