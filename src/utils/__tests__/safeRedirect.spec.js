import { describe, it, expect } from 'vitest'
import { safeRedirect } from '../safeRedirect'

describe('safeRedirect', () => {
  it('keeps an ordinary in-app path with its query', () => {
    expect(safeRedirect('/dashboard/events?tab=1')).toBe('/dashboard/events?tab=1')
  })
  it('drops sign-in and the other auth pages', () => {
    expect(safeRedirect('/sign-in')).toBeUndefined()
    expect(safeRedirect('/confirm-reset?confirm=x')).toBeUndefined()
    expect(safeRedirect('/forgot-password')).toBeUndefined()
  })
  it('unwraps a nested sign-in redirect to the real target', () => {
    expect(safeRedirect('/sign-in?redirect=/sign-in?redirect=/dashboard')).toBe('/dashboard')
    expect(safeRedirect('/sign-in?redirect=%2Fsign-in%3Fredirect%3D%2Fsign-in')).toBeUndefined()
  })
  it('rejects anything that is not a same-origin path', () => {
    expect(safeRedirect('//evil.com')).toBeUndefined()
    expect(safeRedirect('https://evil.com')).toBeUndefined()
    expect(safeRedirect(undefined)).toBeUndefined()
  })
})
