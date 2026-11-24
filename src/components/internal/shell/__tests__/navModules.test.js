import { describe, it, expect } from 'vitest'
import { buildNavSections, MODULE_VIEWS, unlockPath, SECTIONS } from '../navModules'

const mod = (key, section, order, state = 'active') => ({ key, section, order, state })

describe('buildNavSections', () => {
  const modules = [
    mod('guests', 'guests', 10),
    mod('rsvp', 'guests', 20),
    mod('save_the_date', 'guests', 30),
    mod('timeline', 'organization', 10),
    mod('budget', 'organization', 40),
    mod('menus', 'extras', 10, 'locked'),
    mod('seating', 'extras', 20, 'locked')
  ]

  it('always starts with Home, alone in the untitled section', () => {
    const [first] = buildNavSections(modules)
    expect(first.section).toBe('main')
    expect(first.items.map(i => i.key)).toEqual(['home', 'invitation'])
  })

  it('does not draw the deferred seating module anywhere, but keeps its view for the unlock screen (ORG-017)', () => {
    const keys = buildNavSections(modules).flatMap(s => s.items.map(i => i.key))
    expect(keys).not.toContain('seating')
    expect(MODULE_VIEWS.seating.to).toBe('/dashboard/seating')
  })

  it('does not draw "Mi plan" anywhere: it lives in the floating guide, the route stays', () => {
    const keys = buildNavSections(modules).flatMap(s => s.items.map(i => i.key))
    expect(keys).not.toContain('plan')
  })

  it('draws "Tu invitación" even though the catalog row starts switched off, and does not repeat it when the catalog sends it', () => {
    const own = buildNavSections(modules)[0].items.find(i => i.key === 'invitation')
    expect(own).toMatchObject({ to: '/dashboard/invitation', state: 'active' })
    const withCatalog = buildNavSections([...modules, mod('invitation', 'main', 10)])[0].items.filter(i => i.key === 'invitation')
    expect(withCatalog).toHaveLength(1)
  })

  it('groups by section in menu order, and by the order the API gave inside each one', () => {
    const sections = buildNavSections([mod('budget', 'organization', 40), mod('timeline', 'organization', 10), mod('rsvp', 'guests', 20), mod('guests', 'guests', 10)])
    expect(sections.map(s => s.section)).toEqual(['main', 'guests', 'organization'])
    // Confirmations are a tab of the guest list: the `rsvp` module is not drawn.
    expect(sections[1].items.map(i => i.key)).toEqual(['guests'])
    expect(sections[2].items.map(i => i.key)).toEqual(['timeline', 'budget'])
  })

  it('shows a locked module with its padlock state and points it at the unlock screen', () => {
    const extras = buildNavSections(modules).find(s => s.section === 'extras')
    expect(extras.items.every(i => i.state === 'locked')).toBe(true)
    expect(extras.items[0].to).toBe(unlockPath('menus'))
    expect(extras.items[0].primary).toBe(false)
  })

  it('leaves a module out when the API does not send it (the admin switched it off)', () => {
    const keys = buildNavSections(modules.filter(m => m.key !== 'timeline')).flatMap(s => s.items.map(i => i.key))
    expect(keys).not.toContain('timeline')
  })

  it('does not draw a module that has no screen yet, or that the app does not know', () => {
    const keys = buildNavSections([mod('rsvp', 'main', 10), mod('brand_new', 'extras', 1), mod('guests', 'guests', 10)]).flatMap(s => s.items.map(i => i.key))
    expect(keys).toEqual(['home', 'invitation', 'guests'])
  })

  it('ignores a module in a section the menu does not know', () => {
    const keys = buildNavSections([mod('guests', 'secret', 1)]).flatMap(s => s.items.map(i => i.key))
    expect(keys).toEqual(['home', 'invitation'])
  })

  it('without modules (no event) shows only Home', () => {
    expect(buildNavSections(undefined).flatMap(s => s.items.map(i => i.key))).toEqual(['home'])
    expect(buildNavSections([]).flatMap(s => s.items.map(i => i.key))).toEqual(['home'])
  })

  it('marks as primary (phone bottom bar) only usable modules', () => {
    const primary = buildNavSections([...modules, mod('guests', 'guests', 10)]).flatMap(s => s.items).filter(i => i.primary).map(i => i.key)
    expect(primary).toEqual(expect.arrayContaining(['home', 'guests', 'budget']))
    expect(primary).not.toContain('menus')
  })
})

describe('the catalog the app knows how to draw', () => {
  it('has a text key and an icon for every module', () => {
    for (const [key, view] of Object.entries(MODULE_VIEWS)) {
      expect(view.labelKey, key).toMatch(/^app\.nav\./)
      expect(view.icon, key).toBeTruthy()
    }
  })
  it('uses the sections the API sends', () => expect(SECTIONS).toEqual(['main', 'guests', 'organization', 'extras']))
})
