import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'

const userStore = { isAuthenticated: false, logOut: vi.fn() }
const hydrationStore = { isHydrated: false, reset: vi.fn(), hydrateAll: vi.fn() }
const eventsStore = { activeEvent: null }

vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => userStore }))
vi.mock('@/stores/useHydrationStore', () => ({ useHydrationStore: () => hydrationStore }))
vi.mock('@/modules/events/stores/useEventsStore', () => ({ useEventsStore: () => eventsStore }))

const { authGuard } = await import('../authGuard')

const route = (meta = {}, fullPath = '/dashboard') => ({ meta, fullPath })

describe('authGuard', () => {
  beforeEach(() => {
    userStore.isAuthenticated = false
    userStore.logOut.mockReset()
    hydrationStore.isHydrated = false
    hydrationStore.reset.mockReset()
    hydrationStore.hydrateAll.mockReset().mockResolvedValue()
    eventsStore.activeEvent = null
    document.title = ''
  })

  it('lets public routes through and sets the document title', async () => {
    expect(await authGuard(route({ title: 'Sign in' }))).toBeUndefined()
    expect(document.title).toBe('Sign in · Quinvite')

    await authGuard(route())
    expect(document.title).toBe('Quinvite')
  })

  it('redirects anonymous users to sign-in keeping the target', async () => {
    const result = await authGuard(route({ requiresAuth: true }, '/events/3'))

    expect(result).toEqual({ name: 'sign-in', query: { redirect: '/events/3' } })
    expect(hydrationStore.reset).toHaveBeenCalled()
    expect(hydrationStore.hydrateAll).not.toHaveBeenCalled()
  })

  it('hydrates the app once for authenticated users', async () => {
    userStore.isAuthenticated = true

    expect(await authGuard(route({ requiresAuth: true }))).toBeUndefined()
    expect(hydrationStore.hydrateAll).toHaveBeenCalledTimes(1)
  })

  it('does not hydrate again when it is already hydrated', async () => {
    userStore.isAuthenticated = true
    hydrationStore.isHydrated = true

    expect(await authGuard(route({ requiresAuth: true }))).toBeUndefined()
    expect(hydrationStore.hydrateAll).not.toHaveBeenCalled()
  })

  it('logs out and redirects when hydration fails', async () => {
    userStore.isAuthenticated = true
    hydrationStore.hydrateAll.mockRejectedValue(new Error('boom'))
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await authGuard(route({ requiresAuth: true }, '/guests'))

    expect(result).toEqual({ name: 'sign-in', query: { redirect: '/guests' } })
    expect(userStore.logOut).toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe('authGuard inside a real vue-router 5 router', () => {
  const makeRouter = () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/sign-in', name: 'sign-in', component: { template: '<i/>' }, meta: { title: 'Sign in' } },
        { path: '/dashboard', name: 'dashboard', component: { template: '<i/>' }, meta: { requiresAuth: true } },
        { path: '/logout', name: 'logout', beforeEnter: async () => ({ name: 'sign-in' }), component: { template: '<i/>' } }
      ]
    })
    router.beforeEach(authGuard)
    return router
  }

  beforeEach(() => {
    userStore.isAuthenticated = false
    hydrationStore.isHydrated = false
    hydrationStore.hydrateAll.mockReset().mockResolvedValue()
  })

  it('redirects to sign-in with the redirect query', async () => {
    const router = makeRouter()
    await router.push('/dashboard')

    expect(router.currentRoute.value.name).toBe('sign-in')
    expect(router.currentRoute.value.query.redirect).toBe('/dashboard')
  })

  it('opens protected routes for authenticated users', async () => {
    userStore.isAuthenticated = true
    const router = makeRouter()
    await router.push('/dashboard')

    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('supports a beforeEnter that returns a redirect (logout route)', async () => {
    const router = makeRouter()
    await router.push('/logout')

    expect(router.currentRoute.value.name).toBe('sign-in')
  })
})

describe('authGuard with modules', () => {
  beforeEach(() => {
    userStore.isAuthenticated = true
    hydrationStore.isHydrated = true
    eventsStore.activeEvent = { modules: [{ key: 'rsvp', state: 'active' }, { key: 'menus', state: 'locked' }] }
  })

  it('opens a module the event\'s plan includes', async () => {
    expect(await authGuard(route({ requiresAuth: true, moduleKey: 'rsvp' }, '/dashboard/rsvp'))).toBeUndefined()
  })

  it('sends a locked module to the unlock screen, even when its address is typed', async () => {
    expect(await authGuard(route({ requiresAuth: true, moduleKey: 'menus' }, '/dashboard/menus'))).toBe('/dashboard/unlock/menus')
  })

  it('sends a module the admin switched off back home', async () => {
    expect(await authGuard(route({ requiresAuth: true, moduleKey: 'timeline' }, '/dashboard/timeline'))).toBe('/dashboard')
  })

  it('does not look at modules on routes that are not modules', async () => {
    eventsStore.activeEvent = { modules: [] }
    expect(await authGuard(route({ requiresAuth: true }, '/dashboard/events'))).toBeUndefined()
  })
})
