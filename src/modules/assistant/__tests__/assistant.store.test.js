import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const svc = vi.hoisted(() => ({ next: vi.fn(), plan: vi.fn(), act: vi.fn(), createCustom: vi.fn(), updateCustom: vi.fn(), removeCustom: vi.fn() }))
vi.mock('../services/AssistantService', () => ({ default: svc }))

import { useAssistantStore } from '../stores/useAssistantStore'

const t = (key, over = {}) => ({ key, phase: 'foundation', title: key, state: 'available', ...over })
const nextData = { mode: 'normal', steps: [t('a', { state: 'next' })], allSet: false, progress: { done: 0, total: 2, ratio: 0 } }
const planData = { mode: 'normal', progress: { done: 0, total: 2, ratio: 0 }, phases: [{ key: 'foundation', label: 'F', tasks: [t('a'), t('b')] }], overdue: [], hidden: [], custom: [] }

beforeEach(() => {
  setActivePinia(createPinia())
  Object.values(svc).forEach(m => m.mockReset())
})

describe('useAssistantStore reads', () => {
  it('loads next and goes ready', async () => {
    svc.next.mockResolvedValue(nextData)
    const s = useAssistantStore()
    const p = s.fetchNext({ eventId: 1, lang: 'es' })
    expect(s.nextStatus).toBe('loading')
    await p
    expect(s.nextStatus).toBe('ready')
    expect(s.next.steps[0].key).toBe('a')
    expect(svc.next).toHaveBeenCalledWith(1, 'es')
  })

  it('goes to error (no data) when the first load fails, so the card falls back', async () => {
    svc.next.mockRejectedValue(new Error('Network Error'))
    const s = useAssistantStore()
    await s.fetchNext({ eventId: 1 })
    expect(s.nextStatus).toBe('error')
    expect(s.next).toBeNull()
  })

  it('keeps the data it had when a later refresh fails', async () => {
    svc.next.mockResolvedValueOnce(nextData).mockRejectedValueOnce(new Error('x'))
    const s = useAssistantStore()
    await s.fetchNext({ eventId: 1 })
    await s.fetchNext({ eventId: 1, force: true })
    expect(s.nextStatus).toBe('ready')
    expect(s.next.steps).toHaveLength(1)
  })

  it('spaces queries unless forced', async () => {
    svc.next.mockResolvedValue(nextData)
    const s = useAssistantStore()
    await s.fetchNext({ eventId: 1 })
    await s.fetchNext({ eventId: 1 })
    expect(svc.next).toHaveBeenCalledTimes(1)
    await s.fetchNext({ eventId: 1, force: true })
    expect(svc.next).toHaveBeenCalledTimes(2)
  })

  it('drops the data when the event changes', async () => {
    svc.next.mockResolvedValue(nextData)
    const s = useAssistantStore()
    await s.fetchNext({ eventId: 1 })
    svc.next.mockReturnValue(new Promise(() => {}))
    s.fetchNext({ eventId: 2 })
    expect(s.next).toBeNull()
    expect(s.eventId).toBe(2)
  })

  it('loads the plan and reports errors', async () => {
    svc.plan.mockResolvedValueOnce(planData).mockRejectedValueOnce(new Error('x'))
    const s = useAssistantStore()
    await s.fetchPlan({ eventId: 1 })
    expect(s.planStatus).toBe('ready')
    s.plan = null
    await s.fetchPlan({ eventId: 1 })
    expect(s.planStatus).toBe('error')
  })
})

describe('useAssistantStore writes', () => {
  async function loaded() {
    svc.plan.mockResolvedValue(planData)
    svc.next.mockResolvedValue(nextData)
    const s = useAssistantStore()
    await s.fetchPlan({ eventId: 1, lang: 'en' })
    return s
  }

  it('replaces the task with the server answer, passes the language, and refreshes quietly', async () => {
    const s = await loaded()
    const doneA = t('a', { state: 'done', doneBy: 'user' })
    svc.act.mockResolvedValue(doneA)
    svc.plan.mockResolvedValue({ ...planData, phases: [{ key: 'foundation', label: 'F', tasks: [t('b'), doneA] }] })
    await s.actOnTask('a', 'done')
    expect(svc.act).toHaveBeenCalledWith(1, 'a', 'done', {}, 'en')
    expect(s.plan.phases[0].tasks.map(x => x.key)).toEqual(['b', 'a'])
    await vi.waitFor(() => expect(svc.plan).toHaveBeenCalledTimes(2))
    expect(svc.next).toHaveBeenCalled()
  })

  it('marks a key busy while its request is in flight, and clears it on failure', async () => {
    const s = await loaded()
    let reject
    svc.act.mockReturnValue(new Promise((_, r) => (reject = r)))
    const p = s.actOnTask('a', 'hide').catch(e => e)
    expect(s.isBusy('a')).toBe(true)
    reject(new Error('boom'))
    expect((await p).message).toBe('boom')
    expect(s.isBusy('a')).toBe(false)
  })

  it('creates, edits and removes custom tasks in the plan', async () => {
    const s = await loaded()
    svc.createCustom.mockResolvedValue({ id: 7, title: 'Mariachi', notes: null, dueDate: null, doneAt: null })
    await s.createCustom({ title: 'Mariachi' })
    expect(s.plan.custom.map(c => c.id)).toEqual([7])
    svc.updateCustom.mockResolvedValue({ id: 7, title: 'Mariachi', notes: null, dueDate: null, doneAt: '2026-11-15T10:00:00Z' })
    await s.updateCustom(7, { done: true })
    expect(s.plan.custom[0].doneAt).toBeTruthy()
    svc.removeCustom.mockResolvedValue()
    await s.removeCustom(7)
    expect(s.plan.custom).toEqual([])
  })
})
