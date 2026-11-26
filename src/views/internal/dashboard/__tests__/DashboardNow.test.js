import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'

const svc = vi.hoisted(() => ({ next: vi.fn(), plan: vi.fn(), act: vi.fn() }))
vi.mock('@/modules/assistant/services/AssistantService', () => ({ default: svc }))

import DashboardNow from '../DashboardNow.vue'
import { useAssistantStore } from '@/modules/assistant/stores/useAssistantStore'

const step = (key, over = {}) => ({ key, title: `Paso ${key}`, state: 'next', reason: `Porque ${key}`, route: '/dashboard/budget', moduleKey: 'budget', moduleLocked: false, doneBy: null, blockedBy: [], ...over })
const next = (steps, over = {}) => ({ mode: 'normal', steps, allSet: steps.length === 0, progress: { done: 1, total: 9 }, ...over })
const stubs = { RouterLink: { props: ['to'], template: '<a :data-to="typeof to === \'string\' ? to : JSON.stringify(to)"><slot /></a>' } }

function mountNow(props = {}) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  useAssistantStore().$patch({ eventId: 7 })
  return mount(DashboardNow, { props: { next: next([step('a'), step('b')]), status: 'ready', eventId: 7, ...props }, global: { plugins: [i18n, pinia], stubs } })
}
const rows = w => w.findAll('[data-testid=now-list] > li')

beforeEach(() => {
  setLocale('es')
  Object.values(svc).forEach(fn => fn.mockReset())
  svc.next.mockResolvedValue(next([]))
  svc.plan.mockResolvedValue({ mode: 'normal', phases: [] })
  useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
})

describe('DashboardNow', () => {
  it('draws a skeleton while the steps load, and no false "Todo al día"', () => {
    const w = mountNow({ next: null, status: 'loading' })
    expect(w.find('[data-testid=now-skeleton]').exists()).toBe(true)
    expect(w.find('[data-testid=now-empty]').exists()).toBe(false)
    expect(w.text()).not.toContain('Todo al día')
  })
  it('shows an error with retry and no empty state when the request fails', async () => {
    const w = mountNow({ next: null, status: 'error' })
    expect(w.find('[data-testid=block-error]').text()).toContain('No pudimos cargar tus próximos pasos')
    expect(w.find('[data-testid=now-empty]').exists()).toBe(false)
    await w.get('[data-testid=block-retry]').trigger('click')
    expect(w.emitted('retry')).toHaveLength(1)
  })
  it('lists at most three open steps with their reason and a link to do each one', () => {
    const w = mountNow({ next: next([step('a'), step('b', { state: 'done' }), step('c'), step('d'), step('e')]) })
    expect(rows(w).map(r => r.attributes('data-testid'))).toEqual(['now-a', 'now-c', 'now-d'])
    expect(rows(w)[0].text()).toContain('Porque a')
    expect(rows(w)[0].get('[data-testid=now-go]').attributes('data-to')).toBe('/dashboard/budget')
    expect(w.get('h2').text()).toBe('3 pasos para avanzar tu plan')
  })
  it('uses the singular for one step', () => {
    expect(mountNow({ next: next([step('a')]) }).get('h2').text()).toBe('Un paso para avanzar tu plan')
    setLocale('en')
    expect(mountNow({ next: next([step('a'), step('b')]) }).get('h2').text()).toBe('2 steps to move your plan forward')
  })
  it('says "Todo al día" with the empty state when there is nothing to do', () => {
    const w = mountNow({ next: next([]) })
    expect(w.get('[data-testid=now-empty]').text()).toContain('Todo al día')
    expect(w.get('h2').text()).toBe('Todo al día')
  })
  it('hides itself for events the assistant does not plan', () => {
    expect(mountNow({ next: next([], { mode: 'unsupported' }) }).find('[data-testid=dashboard-now]').exists()).toBe(false)
    expect(mountNow({ next: next([], { mode: 'no_date' }) }).find('[data-testid=dashboard-now]').exists()).toBe(false)
  })
  it('sends a locked step to unlock its module', () => {
    const w = mountNow({ next: next([step('a', { moduleLocked: true, moduleKey: 'whatsapp' })]) })
    expect(w.get('[data-testid=now-go]').attributes('data-to')).toBe('/dashboard/unlock/whatsapp')
    expect(w.get('[data-testid=now-go]').text()).toContain('Desbloquear')
  })
  it('marks a step done: it stays crossed out in its place and the count goes down', async () => {
    svc.act.mockResolvedValue(step('a', { state: 'done', doneBy: 'user' }))
    const w = mountNow()
    const box = rows(w)[0].get('[data-testid=now-check]')
    expect(box.attributes('aria-pressed')).toBe('false')
    expect(box.attributes('aria-label')).toBe('Marcar como hecho: Paso a')
    await box.trigger('click')
    await flushPromises()
    expect(svc.act).toHaveBeenCalledWith(7, 'a', 'done', {}, null)
    expect(rows(w)[0].attributes('data-done')).toBe('true')
    expect(rows(w)[0].get('[data-testid=now-check]').attributes('aria-pressed')).toBe('true')
    expect(rows(w)[0].find('[data-testid=now-go]').exists()).toBe(false)
    expect(w.get('h2').text()).toBe('Un paso para avanzar tu plan')
    // The refreshed answer no longer has "a" and brings "c": "a" keeps its row, "c" goes below.
    await w.setProps({ next: next([step('b'), step('c')]) })
    expect(rows(w).map(r => r.attributes('data-testid'))).toEqual(['now-a', 'now-b', 'now-c'])
  })
  it('never grows past three rows: a done step keeps its row and no fourth one is added', async () => {
    svc.act.mockResolvedValue(step('a', { state: 'done', doneBy: 'user' }))
    const w = mountNow({ next: next([step('a'), step('b'), step('c')]) })
    await rows(w)[0].get('[data-testid=now-check]').trigger('click')
    await flushPromises()
    await w.setProps({ next: next([step('b'), step('c'), step('d')]) })
    expect(rows(w).map(r => r.attributes('data-testid'))).toEqual(['now-a', 'now-b', 'now-c'])
    expect(w.get('h2').text()).toBe('2 pasos para avanzar tu plan')
  })
  it('undoes a step marked by hand', async () => {
    svc.act.mockResolvedValueOnce(step('a', { state: 'done', doneBy: 'user' })).mockResolvedValueOnce(step('a'))
    const w = mountNow()
    await rows(w)[0].get('[data-testid=now-check]').trigger('click')
    await flushPromises()
    await rows(w)[0].get('[data-testid=now-check]').trigger('click')
    await flushPromises()
    expect(svc.act).toHaveBeenLastCalledWith(7, 'a', 'reset', {}, null)
    expect(rows(w)[0].attributes('data-done')).toBe('false')
  })
  it('cannot undo a step the assistant detected from the data', async () => {
    svc.act.mockResolvedValue(step('a', { state: 'done', doneBy: 'data' }))
    const w = mountNow()
    await rows(w)[0].get('[data-testid=now-check]').trigger('click')
    await flushPromises()
    expect(rows(w)[0].get('[data-testid=now-check]').attributes('disabled')).toBeDefined()
  })
  it('says why when marking fails and leaves the step open', async () => {
    svc.act.mockRejectedValue({ response: { status: 403 } })
    const w = mountNow()
    await rows(w)[0].get('[data-testid=now-check]').trigger('click')
    await flushPromises()
    expect(rows(w)[0].attributes('data-done')).toBe('false')
    expect(useToast().toasts.at(-1).title).toMatch(/organiza el evento/i)
  })
})
