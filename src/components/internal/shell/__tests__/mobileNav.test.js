import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { buildNavSections, buildMobileNav, isActivePath, activeTabKey } from '../navModules'
import AppBottomNav from '../AppBottomNav.vue'

const mod = (key, section, order, state = 'active') => ({ key, section, order, state })
const MODULES = [
  mod('guests', 'guests', 10),
  mod('save_the_date', 'guests', 30),
  mod('timeline', 'organization', 10),
  mod('locations', 'organization', 20),
  mod('budget', 'organization', 40),
  mod('menus', 'extras', 10, 'locked'),
  mod('seating', 'extras', 20, 'locked')
]
const tabsFor = (modules, eventId = 7) => buildMobileNav(buildNavSections(modules), eventId)
const keys = items => items.map(i => i.key)

describe('buildMobileNav', () => {
  it('draws Home, Tu invitación, Invitados, Organización and Más, in that order', () => {
    const tabs = tabsFor(MODULES)
    expect(keys(tabs)).toEqual(['home', 'invitation', 'guests', 'organization', 'more'])
    expect(tabs.map(t => t.kind)).toEqual(['link', 'link', 'link', 'sheet', 'sheet'])
  })

  it('sends "Tu invitación" to the invitation editor', () => {
    const invitation = tabsFor(MODULES, 7)[1]
    expect(invitation.to).toBe('/dashboard/invitation')
    expect(invitation.routeNames).toEqual(['invitation-editor'])
  })

  it('leaves "Tu invitación" out while there is no active event', () => {
    expect(keys(tabsFor(MODULES, null))).toEqual(['home', 'guests', 'organization', 'more'])
  })

  it('puts the whole Organización section in its sheet, locked ones included', () => {
    const organization = tabsFor([...MODULES, mod('dress_code', 'organization', 30, 'locked')]).find(t => t.key === 'organization')
    expect(keys(organization.items)).toEqual(['timeline', 'locations', 'dress_code', 'budget'])
    expect(organization.items.find(i => i.key === 'dress_code').state).toBe('locked')
  })

  it('puts the rest under Más, locked extras with their padlock state and unlock address', () => {
    const more = tabsFor(MODULES).find(t => t.key === 'more')
    expect(keys(more.items)).toEqual(['save_the_date', 'menus']) // seating is deferred: no menu draws it (ORG-017)
    expect(more.items.filter(i => i.state === 'locked').map(i => i.to)).toEqual(['/dashboard/unlock/menus'])
  })

  it('never draws a module the admin switched off', () => {
    const tabs = tabsFor(MODULES.filter(m => !['timeline', 'menus', 'save_the_date'].includes(m.key)))
    const all = tabs.flatMap(t => t.items ?? [t])
    expect(keys(all)).not.toContain('timeline')
    expect(keys(all)).not.toContain('menus')
    expect(keys(all)).not.toContain('save_the_date')
  })

  it('drops the Organización tab when the section is empty, and the Guests tab when guests are off', () => {
    const tabs = tabsFor([mod('menus', 'extras', 10, 'locked')])
    expect(keys(tabs)).toEqual(['home', 'invitation', 'more'])
  })
})

describe('isActivePath', () => {
  it('matches the screen and its children, but Home only exactly', () => {
    expect(isActivePath('/dashboard/guests', '/dashboard/guests')).toBe(true)
    expect(isActivePath('/dashboard/guests/12', '/dashboard/guests')).toBe(true)
    expect(isActivePath('/dashboard/guests-x', '/dashboard/guests')).toBe(false)
    expect(isActivePath('/dashboard/guests', '/dashboard')).toBe(false)
    expect(isActivePath('/dashboard', '/dashboard')).toBe(true)
  })
})

describe('activeTabKey', () => {
  const sections = buildNavSections(MODULES)
  const tabs = buildMobileNav(sections, 7)
  const keyOf = (path, routeName = null) => activeTabKey(path, tabs, sections, routeName)

  it.each([
    ['/dashboard', 'home'],
    ['/dashboard/plan', 'home'],
    ['/dashboard/start', 'home'],
    ['/dashboard/invitation', 'invitation'],
    ['/dashboard/guests', 'guests'],
    ['/dashboard/guests/12', 'guests'],
    ['/dashboard/rsvp', 'guests'],
    ['/dashboard/save-the-date', 'guests'],
    ['/dashboard/events/7/invitations', 'guests'],
    ['/dashboard/timeline', 'organization'],
    ['/dashboard/locations', 'organization'],
    ['/dashboard/budget', 'organization'],
    ['/dashboard/unlock/budget', 'organization'],
    ['/dashboard/unlock/guests', 'guests'],
    ['/dashboard/unlock/menus', 'more'],
    ['/dashboard/unlock/unknown', 'more'],
    ['/dashboard/menus', 'more'],
    ['/dashboard/menus/create', 'more'],
    ['/dashboard/collaborators', 'more'],
    ['/dashboard/events', 'more'],
    ['/dashboard/events/create', 'more'],
    ['/dashboard/events/7/edit', 'more'],
    ['/dashboard/events/7/unlock', 'more'],
    ['/settings/profile', 'more'],
    ['/settings/purchases', 'more']
  ])('%s lights %s', (path, key) => {
    expect(keyOf(path)).toBe(key)
  })

  it('lights "Tu invitación" by route name too', () => {
    expect(keyOf('/somewhere', 'invitation-editor')).toBe('invitation')
  })

  it('files the guests section under Más when the Guests tab is not there', () => {
    const noGuests = buildNavSections(MODULES.filter(m => m.key !== 'guests' && m.key !== 'save_the_date'))
    const noGuestsTabs = buildMobileNav(noGuests, 7)
    expect(activeTabKey('/dashboard/guests', noGuestsTabs, noGuests)).toBe('more')
  })

  it('has no Organización tab to light when the section is empty', () => {
    const lone = buildNavSections([mod('menus', 'extras', 10, 'locked')])
    expect(activeTabKey('/dashboard/timeline', buildMobileNav(lone, 7), lone)).toBe('more')
  })
})

describe('AppBottomNav', () => {
  let wrapper
  const makeRouter = () =>
    createRouter({
      history: createMemoryHistory(),
      routes: ['/dashboard', '/dashboard/guests', '/dashboard/timeline', '/dashboard/save-the-date', '/dashboard/collaborators', '/settings/profile', '/dashboard/unlock/:module'].map(path => ({
        path,
        component: { template: '<div />' }
      })).concat({ path: '/dashboard/invitation', name: 'invitation-editor', component: { template: '<div />' } })
    })

  async function setup(path, { userRole = 'viewer', permissions = [] } = {}) {
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    const events = useEventsStore()
    events.activeEvent = { id: 7, userRole, modules: MODULES }
    events.eventPermissions = permissions.map(name => ({ name }))
    const router = makeRouter()
    await router.push(path)
    await router.isReady()
    wrapper = mount(AppBottomNav, { global: { plugins: [i18n, pinia, router] }, attachTo: document.body })
    return { router }
  }

  beforeEach(() => setLocale('es'))
  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('never breaks a tab label in the middle of a word', async () => {
    await setup('/dashboard')
    expect(wrapper.html()).not.toContain('break-words')
  })

  it('shows the five tabs with their labels', async () => {
    await setup('/dashboard')
    const labels = wrapper.findAll('li').map(li => li.text())
    expect(labels).toEqual(['Inicio', 'Tu invitación', 'Invitados', 'Organización', 'Más'])
  })

  it('marks the current screen with aria-current and no other tab', async () => {
    await setup('/dashboard/guests')
    expect(wrapper.get('[data-testid=tab-guests]').attributes('aria-current')).toBe('page')
    expect(wrapper.get('[data-testid=tab-home]').attributes('aria-current')).toBeUndefined()
  })

  it('marks "Tu invitación" active on the editor', async () => {
    await setup('/dashboard/invitation')
    expect(wrapper.get('[data-testid=tab-invitation]').attributes('aria-current')).toBe('page')
  })

  it('highlights Organización while on one of its screens, without calling it the current page', async () => {
    await setup('/dashboard/timeline')
    expect(wrapper.get('[data-testid=tab-organization]').classes()).toContain('text-rose-800')
    expect(wrapper.get('[data-testid=tab-home]').classes()).not.toContain('text-rose-800')
  })

  it('lights Invitados on Guarda la fecha and Más on Colaboradores and the account', async () => {
    await setup('/dashboard/save-the-date')
    expect(wrapper.get('[data-testid=tab-guests]').attributes('aria-current')).toBe('page')
    expect(wrapper.get('[data-testid=tab-more]').classes()).not.toContain('text-rose-800')
    wrapper.unmount()
    for (const path of ['/dashboard/collaborators', '/settings/profile']) {
      await setup(path)
      expect(wrapper.get('[data-testid=tab-more]').classes()).toContain('text-rose-800')
      expect(wrapper.get('[data-testid=tab-guests]').attributes('aria-current')).toBeUndefined()
      wrapper.unmount()
    }
  })

  it('opens the Más sheet with the rest of the modules, locked ones with a padlock', async () => {
    await setup('/dashboard')
    await wrapper.get('[data-testid=tab-more]').trigger('click')
    await flushPromises()
    const sheet = document.body.querySelector('[data-testid=sheet-items]')
    expect(sheet.textContent).toContain('Guarda la fecha')
    expect(sheet.textContent).toContain('Menú')
    expect(sheet.textContent).not.toContain('Programa del día')
    expect(document.body.querySelector('[data-testid=sheet-menus] [aria-label=Premium]')).not.toBeNull()
    expect(document.body.querySelector('[data-testid=sheet-save_the_date] [aria-label=Premium]')).toBeNull()
  })

  it('opens the Organización sheet with its section', async () => {
    await setup('/dashboard', { permissions: ['view_budget'] })
    await wrapper.get('[data-testid=tab-organization]').trigger('click')
    await flushPromises()
    const sheet = document.body.querySelector('[data-testid=sheet-items]')
    expect(sheet.textContent).toContain('Programa del día')
    expect(sheet.textContent).toContain('Presupuesto')
    expect(sheet.textContent).not.toContain('Guarda la fecha')
  })

  it('leaves Presupuesto out of the sheet for a viewer without view_budget', async () => {
    await setup('/dashboard')
    await wrapper.get('[data-testid=tab-organization]').trigger('click')
    await flushPromises()
    expect(document.body.querySelector('[data-testid=sheet-items]').textContent).not.toContain('Presupuesto')
  })

  it('closes the sheet when the route changes', async () => {
    const { router } = await setup('/dashboard')
    await wrapper.get('[data-testid=tab-more]').trigger('click')
    await flushPromises()
    expect(document.body.querySelector('[data-testid=sheet-items]')).not.toBeNull()
    await router.push('/dashboard/save-the-date')
    await flushPromises()
    expect(document.body.querySelector('[data-testid=sheet-items]')).toBeNull()
  })

  it('offers Colaboradores only to who can manage them', async () => {
    await setup('/dashboard', { userRole: 'viewer' })
    await wrapper.get('[data-testid=tab-more]').trigger('click')
    await flushPromises()
    expect(document.body.querySelector('[data-testid=sheet-collaborators]')).toBeNull()
    wrapper.unmount()
    document.body.innerHTML = ''

    await setup('/dashboard', { userRole: 'owner' })
    await wrapper.get('[data-testid=tab-more]').trigger('click')
    await flushPromises()
    expect(document.body.querySelector('[data-testid=sheet-collaborators]')).not.toBeNull()
  })

  it('has the navigation landmark and leaves room for the home indicator', async () => {
    await setup('/dashboard')
    const nav = wrapper.get('nav')
    expect(nav.attributes('aria-label')).toBe('Secciones del evento')
    expect(nav.html()).toContain('env(safe-area-inset-bottom)')
    expect(nav.classes()).toContain('lg:hidden')
  })
})
