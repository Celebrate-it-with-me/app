import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  countdown,
  guideView,
  hasNewDot,
  isGuideHiddenRoute,
  isHelpOnlyRoute,
  getSeenKey,
  setSeenKey,
  wasWelcomed,
  markWelcomed,
  percentOf,
  toneFor
} from '../guideUtils'

const task = key => ({ key, title: key, state: 'next' })

describe('guideView', () => {
  it('uses the first step and the two after it', () => {
    const v = guideView({ mode: 'normal', steps: [task('a'), task('b'), task('c'), task('d')], allSet: false })
    expect(v.kind).toBe('task')
    expect(v.task.key).toBe('a')
    expect(v.after.map(s => s.key)).toEqual(['b', 'c'])
  })
  it('knows the calm, no-date and help-only states', () => {
    expect(guideView({ mode: 'normal', steps: [], allSet: true }).kind).toBe('allSet')
    expect(guideView({ mode: 'no_date', steps: [] }).kind).toBe('setDate')
    expect(guideView({ mode: 'unsupported', steps: [] }).kind).toBe('help')
    expect(guideView({ mode: 'normal', steps: [], allSet: false }).kind).toBe('help')
    expect(guideView(null).kind).toBe('help')
  })
})

describe('countdown, percent, tone, dot', () => {
  it('counts days under three months and months above', () => {
    expect(countdown({ daysLeft: 40 })).toEqual({ unit: 'days', n: 40 })
    expect(countdown({ daysLeft: 340, monthsLeft: 11.2 })).toEqual({ unit: 'months', n: 11 })
    expect(countdown({ daysLeft: 0 })).toBeNull()
    expect(countdown({ daysLeft: -3 })).toBeNull()
    expect(countdown(null)).toBeNull()
  })
  it('rounds the percent', () => {
    expect(percentOf({ ratio: 0.375 })).toBe(38)
    expect(percentOf(undefined)).toBe(0)
    expect(percentOf({ ratio: 3 })).toBe(100)
  })
  it('is sober for weddings and festive otherwise', () => {
    expect(toneFor('wedding')).toBe('wedding')
    expect(toneFor('quinceanera')).toBe('quince')
    expect(toneFor(undefined)).toBe('quince')
  })
  it('shows the dot only for a task she has not seen', () => {
    const view = { kind: 'task', task: task('a') }
    expect(hasNewDot(view, null)).toBe(true)
    expect(hasNewDot(view, 'a')).toBe(false)
    expect(hasNewDot(view, 'b')).toBe(true)
    expect(hasNewDot({ kind: 'allSet' }, null)).toBe(false)
  })
})

describe('browser memory', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.restoreAllMocks()
  })
  it('remembers the seen task per event, and the welcome once', () => {
    expect(getSeenKey(8)).toBeNull()
    setSeenKey(8, 'book_venue')
    expect(getSeenKey(8)).toBe('book_venue')
    expect(getSeenKey(9)).toBeNull()
    expect(wasWelcomed()).toBe(false)
    markWelcomed()
    expect(wasWelcomed()).toBe(true)
  })
  it('survives blocked storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(getSeenKey(8)).toBeNull()
    expect(setSeenKey(8, 'a')).toBe(false)
    expect(wasWelcomed()).toBe(false)
    expect(markWelcomed()).toBe(false)
  })
})

describe('isHelpOnlyRoute', () => {
  it('matches the Inicio only', () => {
    expect(isHelpOnlyRoute('/dashboard')).toBe(true)
    expect(isHelpOnlyRoute('/dashboard/')).toBe(true)
    expect(isHelpOnlyRoute('/dashboard/guests')).toBe(false)
    expect(isHelpOnlyRoute('/dashboards')).toBe(false)
    expect(isHelpOnlyRoute(undefined)).toBe(false)
  })
})

describe('isGuideHiddenRoute', () => {
  it('matches Mi cuenta and nothing else', () => {
    expect(isGuideHiddenRoute('/settings')).toBe(true)
    expect(isGuideHiddenRoute('/settings/profile')).toBe(true)
    expect(isGuideHiddenRoute('/settings/purchases')).toBe(true)
    expect(isGuideHiddenRoute('/settingsx')).toBe(false)
    expect(isGuideHiddenRoute('/dashboard/settings')).toBe(false)
    expect(isGuideHiddenRoute(undefined)).toBe(false)
  })
})
