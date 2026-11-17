import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const svc = vi.hoisted(() => ({ next: vi.fn(), plan: vi.fn(), act: vi.fn(), createCustom: vi.fn(), updateCustom: vi.fn(), removeCustom: vi.fn() }))
vi.mock('../services/AssistantService', () => ({ default: svc }))
const imp = vi.hoisted(() => ({ active: false }))
vi.mock('@/modules/impersonation/stores/useImpersonationStore', () => ({ useImpersonationStore: () => imp }))

import PlanView from '../views/PlanView.vue'

const task = (key, over = {}) => ({
  key, phase: 'foundation', title: `Tarea ${key}`, state: 'available', reason: `Razon ${key}`, reasonCode: 'time_window', reasonParams: {},
  route: '/dashboard/budget', moduleKey: 'budget', moduleLocked: false, doneBy: null, blockedBy: [], snoozedUntil: null, ...over
})
const PLAN = {
  mode: 'normal', monthsLeft: 11, daysLeft: 340, progress: { done: 1, total: 4, ratio: 0.25 },
  phases: [
    { key: 'foundation', label: 'Primeros pasos', tasks: [task('a', { state: 'next' }), task('o', { state: 'overdue' }), task('d', { state: 'done', doneBy: 'user' })] },
    { key: 'final', label: 'Recta final', tasks: [task('s', { state: 'upcoming', moduleLocked: true, moduleKey: 'seating', blockedBy: ['a'] })] }
  ],
  overdue: [task('o', { state: 'overdue' })],
  hidden: [task('h', { state: 'hidden' })],
  custom: [{ id: 5, title: 'Cotizar mariachi', notes: 'Dos presupuestos', dueDate: '2027-03-01', doneAt: null, createdAt: '2026-11-15T14:00:00Z' }]
}

const ROUTES = [
  { path: '/', component: { template: '<div />' } },
  { path: '/dashboard/events/:id/edit', name: 'edit-event', component: { template: '<div />' } },
  { path: '/:p(.*)*', component: { template: '<div />' } }
]
let wrapper
async function mountPlan({ userRole = 'owner', plan = PLAN } = {}) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  useEventsStore().activeEvent = { id: 7, userRole, eventName: 'XV' }
  svc.plan.mockResolvedValue(plan)
  svc.next.mockResolvedValue({ mode: 'normal', steps: [], allSet: false, progress: plan.progress })
  const router = createRouter({ history: createMemoryHistory(), routes: ROUTES })
  await router.push('/')
  wrapper = mount(PlanView, { global: { plugins: [i18n, pinia, router] }, attachTo: document.body })
  await flushPromises()
}

beforeEach(() => {
  setLocale('es')
  Object.values(svc).forEach(m => m.mockReset())
  imp.active = false
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('PlanView', () => {
  it('shows overdue first, then phases without overdue/done tasks, custom tasks, and done folded', async () => {
    await mountPlan()
    const order = wrapper.findAll('section[data-testid^=group-]').map(s => s.attributes('data-testid'))
    expect(order).toEqual(['group-overdue', 'group-foundation', 'group-final', 'group-custom', 'group-done', 'group-hidden'])
    // `o` only under overdue, `d` only under done
    expect(wrapper.findAll('[data-testid=task-o]')).toHaveLength(1)
    expect(wrapper.get('[data-testid=group-foundation]').text()).not.toContain('Tarea o')
    expect(wrapper.get('[data-testid=group-done]').text()).toContain('Tarea d')
    expect(wrapper.get('#plan-done-list').attributes('style')).toContain('display: none')
    expect(wrapper.text()).toContain('1 de 4 listas')
  })

  it('shows the reason, the prerequisite title and the premium CTA once for a locked task', async () => {
    await mountPlan()
    expect(wrapper.get('[data-testid=task-a] [data-testid=task-reason]').text()).toContain('Razon a')
    const locked = wrapper.get('[data-testid=task-s]')
    expect(locked.text()).toContain('Incluida en el plan premium')
    expect(locked.text()).toContain('Primero: Tarea a')
    expect(locked.find('a').attributes('href')).toBe('/dashboard/unlock/seating')
    expect(locked.text()).not.toContain('Marcar hecha')
  })

  it('puts the "Ahora" badge only on recommended (next) tasks, not on available, blocked or locked ones', async () => {
    const plan = {
      ...PLAN,
      phases: [{ key: 'foundation', label: 'Primeros pasos', tasks: [
        task('n', { state: 'next' }),
        task('v', { state: 'available' }),
        task('b', { state: 'available', blockedBy: ['n'] }),
        task('l', { state: 'next', moduleLocked: true, moduleKey: 'seating' })
      ] }],
      overdue: [], hidden: []
    }
    await mountPlan({ plan })
    expect(wrapper.get('[data-testid=task-n]').text()).toContain('Ahora')
    expect(wrapper.get('[data-testid=task-v]').text()).not.toContain('Ahora')
    const blocked = wrapper.get('[data-testid=task-b]')
    expect(blocked.text()).not.toContain('Ahora')
    expect(blocked.text()).toContain('Primero: Tarea n')
    const locked = wrapper.get('[data-testid=task-l]')
    expect(locked.text()).not.toContain('Ahora')
    expect(locked.find('a').attributes('href')).toBe('/dashboard/unlock/seating')
  })

  it('folds a long phase keeping the recommended steps visible, and expands on demand', async () => {
    const tasks = [task('t0', { state: 'next' }), ...[1, 2, 3, 4, 5, 6].map(i => task(`t${i}`))]
    await mountPlan({ plan: { ...PLAN, phases: [{ key: 'foundation', label: 'Primeros pasos', tasks }], overdue: [], hidden: [] } })
    expect(wrapper.findAll('[data-testid^=task-t]')).toHaveLength(4)
    expect(wrapper.find('[data-testid=task-t0]').exists()).toBe(true)
    const toggle = wrapper.get('[data-testid=fold-foundation]')
    expect(toggle.text()).toContain('Ver 3 más')
    await toggle.trigger('click')
    expect(wrapper.findAll('[data-testid^=task-t]')).toHaveLength(7)
    expect(wrapper.get('[data-testid=fold-foundation]').text()).toContain('Ver menos')
  })

  it('marks a task done with the API and says so', async () => {
    await mountPlan()
    const doneA = task('a', { state: 'done', doneBy: 'user' })
    svc.act.mockResolvedValue(doneA)
    // the quiet reload that follows every write brings the same truth
    svc.plan.mockResolvedValue({ ...PLAN, phases: [{ ...PLAN.phases[0], tasks: [PLAN.phases[0].tasks[1], PLAN.phases[0].tasks[2], doneA] }, PLAN.phases[1]] })
    const btn = wrapper.get('[data-testid=task-a]').findAll('button').find(b => b.text().includes('Marcar hecha'))
    await btn.trigger('click')
    await flushPromises()
    expect(svc.act).toHaveBeenCalledWith(7, 'a', 'done', {}, 'es')
    expect(wrapper.get('[data-testid=group-done]').text()).toContain('Tarea a')
  })

  it('restores a hidden task', async () => {
    await mountPlan()
    svc.act.mockResolvedValue(task('h', { state: 'available' }))
    const hiddenToggle = wrapper.get('[data-testid=group-hidden] button')
    expect(hiddenToggle.text()).toContain('Mostrar ocultas (1)')
    await hiddenToggle.trigger('click')
    await wrapper.get('[data-testid=task-h] button').trigger('click')
    await flushPromises()
    expect(svc.act).toHaveBeenCalledWith(7, 'h', 'reset', {}, 'es')
  })

  it('gives a viewer a read-only plan: no writes, only links', async () => {
    await mountPlan({ userRole: 'viewer' })
    expect(wrapper.get('[data-testid=read-only]').exists()).toBe(true)
    const labels = wrapper.findAll('button').map(b => b.text() + (b.attributes('aria-label') ?? ''))
    expect(labels.join('|')).not.toMatch(/Marcar hecha|Agregar tarea|Más acciones|Editar|Borrar/)
    expect(wrapper.find('[data-testid=add-custom]').exists()).toBe(false)
    expect(wrapper.get('[data-testid=custom-5] input').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid=task-a]').find('a').exists()).toBe(true)
  })

  it('is read-only in a support session even for an owner', async () => {
    imp.active = true
    await mountPlan()
    expect(wrapper.find('[data-testid=add-custom]').exists()).toBe(false)
  })

  it('creates a custom task from the modal, and validates the title first', async () => {
    await mountPlan()
    await wrapper.get('[data-testid=add-custom]').trigger('click')
    await flushPromises()
    const form = document.body.querySelector('#custom-task-form')
    form.dispatchEvent(new Event('submit', { cancelable: true }))
    await flushPromises()
    expect(document.body.textContent).toContain('Escribe qué hay que hacer.')
    expect(svc.createCustom).not.toHaveBeenCalled()
    const input = form.querySelector('input[type=text]')
    input.value = ' Probar pastel '
    input.dispatchEvent(new Event('input'))
    svc.createCustom.mockResolvedValue({ id: 9, title: 'Probar pastel', notes: null, dueDate: null, doneAt: null })
    form.dispatchEvent(new Event('submit', { cancelable: true }))
    await flushPromises()
    expect(svc.createCustom).toHaveBeenCalledWith(7, { title: 'Probar pastel', notes: null, due_date: null })
    expect(wrapper.text()).toContain('Probar pastel')
  })

  it('shows the 409 limit message instead of closing the modal', async () => {
    await mountPlan()
    await wrapper.get('[data-testid=add-custom]').trigger('click')
    await flushPromises()
    const form = document.body.querySelector('#custom-task-form')
    const input = form.querySelector('input[type=text]')
    input.value = 'Otra'
    input.dispatchEvent(new Event('input'))
    svc.createCustom.mockRejectedValue({ response: { status: 409, data: { code: 'custom_task_limit' } } })
    form.dispatchEvent(new Event('submit', { cancelable: true }))
    await flushPromises()
    expect(useToast().toasts.map(x => x.title)).toContain('Llegaste al máximo de tareas propias. Borra alguna para agregar otra.')
    expect(document.body.querySelector('#custom-task-form')).not.toBeNull()
  })

  it('deletes a custom task after confirming', async () => {
    await mountPlan()
    svc.removeCustom.mockResolvedValue()
    await wrapper.get('[data-testid=custom-5] button[aria-label^="Borrar"]').trigger('click')
    await flushPromises()
    document.body.querySelector('[data-testid=confirm-delete]').click()
    await flushPromises()
    expect(svc.removeCustom).toHaveBeenCalledWith(7, 5)
    expect(wrapper.find('[data-testid=custom-5]').exists()).toBe(false)
  })

  it('shows the error state with a retry', async () => {
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useEventsStore().activeEvent = { id: 7, userRole: 'owner' }
    svc.plan.mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce(PLAN)
    wrapper = mount(PlanView, { global: { plugins: [i18n, pinia, createRouter({ history: createMemoryHistory(), routes: ROUTES })] }, attachTo: document.body })
    await flushPromises()
    expect(wrapper.get('[data-testid=plan-error]').text()).toContain('No pudimos cargar tu plan')
    await wrapper.get('[data-testid=plan-error] button').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-testid=plan-error]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Tarea a')
  })

  it.each([
    ['unsupported', 'plan-unsupported'],
    ['no_date', 'plan-no-date']
  ])('handles mode %s', async (mode, testid) => {
    await mountPlan({ plan: { ...PLAN, mode, phases: [], overdue: [], hidden: [], custom: [] } })
    expect(wrapper.find(`[data-testid=${testid}]`).exists()).toBe(true)
  })

  it('shows the empty state when the plan has nothing', async () => {
    await mountPlan({ plan: { ...PLAN, phases: [], overdue: [], hidden: [], custom: [], progress: { done: 0, total: 0, ratio: 0 } } })
    expect(wrapper.find('[data-testid=plan-empty]').exists()).toBe(true)
  })
})
