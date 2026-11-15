import { describe, it, expect } from 'vitest'
import {
  LEGACY_STEP_KEYS,
  applyTask,
  apiFieldErrors,
  cardFromNext,
  normalizeNext,
  normalizePlan,
  normalizeTask,
  planIsEmpty,
  resolveTaskRoute,
  stepKey,
  titleIndex,
  validateCustomTask
} from '../utils/assistant'

const task = (key, over = {}) => normalizeTask({ key, phase: 'foundation', title: key, state: 'available', ...over })

describe('stepKey', () => {
  it('reads both shapes and maps the legacy ids to the contract keys', () => {
    expect(stepKey({ key: 'book_venue' })).toBe('book_venue')
    expect(stepKey({ id: 'addGuests' })).toBe('guest_list')
    expect(stepKey({ id: 'publish' })).toBe('publish_invitation')
    expect(stepKey({ id: 'pendingGuests' })).toBe('rsvp_follow_up')
    expect(stepKey({ id: 'budget' })).toBe('budget_cap')
    expect(stepKey({ id: 'allSet' })).toBe('allSet')
    expect(Object.keys(LEGACY_STEP_KEYS)).toHaveLength(5)
  })
})

describe('resolveTaskRoute', () => {
  it('keeps real internal routes as they are', () => {
    expect(resolveTaskRoute('/dashboard/budget')).toBe('/dashboard/budget')
    expect(resolveTaskRoute('/dashboard/guests?status=pending')).toBe('/dashboard/guests?status=pending')
  })
  it('replaces the contract destinations the router does not have', () => {
    expect(resolveTaskRoute('/dashboard/program')).toBe('/dashboard/timeline')
    expect(resolveTaskRoute('/dashboard/rsvp')).toBe('/dashboard/guests?status=pending')
    expect(resolveTaskRoute('/dashboard/events/:id')).toBe('/dashboard/memories')
  })
  it('turns @edit-event (and the missing invitation editor) into the edit-event route', () => {
    expect(resolveTaskRoute('@edit-event', 9)).toEqual({ name: 'edit-event', params: { id: 9 } })
    expect(resolveTaskRoute('/dashboard/invitation', 9)).toEqual({ name: 'edit-event', params: { id: 9 } })
    expect(resolveTaskRoute('@edit-event')).toBeNull()
  })
  it.each(['//evil.example', 'https://evil.example', 'javascript:alert(1)', '/a\\b', '', null, undefined, 4])('rejects %s', value => {
    expect(resolveTaskRoute(value, 1)).toBeNull()
  })
})

describe('cardFromNext', () => {
  const next = over => normalizeNext({ mode: 'normal', steps: [], allSet: false, ...over })
  it('uses the first step and tells how many there are', () => {
    const card = cardFromNext(next({ steps: [{ key: 'a', title: 'A' }, { key: 'b', title: 'B' }] }))
    expect(card).toMatchObject({ key: 'a', title: 'A', total: 2 })
  })
  it('asks for the date in no_date mode', () => expect(cardFromNext(next({ mode: 'no_date' }))).toEqual({ key: 'set_date', local: true }))
  it('shows allSet when nothing is pending and something is done', () => expect(cardFromNext(next({ allSet: true }))).toEqual({ key: 'allSet' }))
  it('falls back (null) for unsupported events, no data, and no steps with nothing done', () => {
    expect(cardFromNext(next({ mode: 'unsupported' }))).toBeNull()
    expect(cardFromNext(null)).toBeNull()
    expect(cardFromNext(next())).toBeNull()
  })
})

describe('applyTask', () => {
  const plan = () =>
    normalizePlan({
      phases: [
        { key: 'foundation', label: 'F', tasks: [{ key: 'a', phase: 'foundation', state: 'next' }, { key: 'b', phase: 'foundation', state: 'available' }] },
        { key: 'planning', label: 'P', tasks: [{ key: 'c', phase: 'planning', state: 'overdue' }] }
      ],
      overdue: [{ key: 'c', phase: 'planning', state: 'overdue' }],
      hidden: [{ key: 'h', phase: 'planning', state: 'hidden' }]
    })
  it('moves a done task to the end of its phase', () => {
    const out = applyTask(plan(), task('a', { state: 'done', doneBy: 'user' }))
    expect(out.phases[0].tasks.map(t => t.key)).toEqual(['b', 'a'])
  })
  it('takes a hidden task out of the phase and into the hidden list', () => {
    const out = applyTask(plan(), task('b', { state: 'hidden' }))
    expect(out.phases[0].tasks.map(t => t.key)).toEqual(['a'])
    expect(out.hidden.map(t => t.key)).toEqual(['h', 'b'])
  })
  it('restores a hidden task into its phase', () => {
    const out = applyTask(plan(), task('h', { phase: 'planning', state: 'available' }))
    expect(out.hidden).toEqual([])
    expect(out.phases[1].tasks.map(t => t.key)).toEqual(['c', 'h'])
  })
  it('drops a task from the overdue list once it is no longer overdue', () => {
    const out = applyTask(plan(), task('c', { phase: 'planning', state: 'upcoming' }))
    expect(out.overdue).toEqual([])
  })
})

describe('plan helpers', () => {
  it('normalizes missing pieces', () => {
    const p = normalizePlan({})
    expect(p).toMatchObject({ mode: 'normal', phases: [], overdue: [], hidden: [], custom: [] })
    expect(planIsEmpty(p)).toBe(true)
    expect(normalizeTask({ key: 'x' }).blockedBy).toEqual([])
  })
  it('indexes titles of visible and hidden tasks', () => {
    const p = normalizePlan({ phases: [{ key: 'foundation', tasks: [{ key: 'a', title: 'A' }] }], hidden: [{ key: 'h', title: 'H' }] })
    expect(titleIndex(p)).toEqual({ a: 'A', h: 'H' })
  })
  it('validates a custom task with the contract codes', () => {
    expect(validateCustomTask({ title: ' ', notes: '', dueDate: '' })).toEqual({ title: 'required' })
    expect(validateCustomTask({ title: 'x'.repeat(121) })).toEqual({ title: 'too_long' })
    expect(validateCustomTask({ title: 'ok', notes: 'n'.repeat(501), dueDate: '1/2/2027' })).toEqual({ notes: 'too_long', dueDate: 'invalid_date' })
    expect(validateCustomTask({ title: 'ok', notes: 'n', dueDate: '2027-03-01' })).toEqual({})
  })
  it('maps API field errors (snake_case) to form fields', () => {
    expect(apiFieldErrors({ errors: { title: ['required'], due_date: ['invalid_date'] } })).toEqual({ title: 'required', dueDate: 'invalid_date' })
    expect(apiFieldErrors(undefined)).toEqual({})
  })
})
