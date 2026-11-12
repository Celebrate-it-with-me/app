import { describe, it, expect } from 'vitest'
import { moduleRedirect } from '../moduleGuard'

const event = { modules: [{ key: 'rsvp', state: 'active' }, { key: 'menus', state: 'locked' }] }

describe('moduleRedirect', () => {
  it('lets an active module through', () => expect(moduleRedirect(event, 'rsvp')).toBeNull())
  it('sends a locked module to the unlock screen, also when typed in the address bar', () => {
    expect(moduleRedirect(event, 'menus')).toBe('/dashboard/unlock/menus')
  })
  it('sends a module the admin switched off (not in the list) back home', () => {
    expect(moduleRedirect(event, 'timeline')).toBe('/dashboard')
  })
  it('makes no decision for routes that are not modules, or without module data', () => {
    expect(moduleRedirect(event, undefined)).toBeNull()
    expect(moduleRedirect(null, 'rsvp')).toBeNull()
    expect(moduleRedirect({}, 'rsvp')).toBeNull()
  })
})
