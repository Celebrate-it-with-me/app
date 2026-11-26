import { describe, it, expect, vi } from 'vitest'
import { permissionRedirect, requiredPermissions } from '../permissionGuard'

// The route table imports the user store (logout route), which imports the router: mocked to read the table alone.
vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => ({}) }))
const { authRoutes } = await import('../authRoutes')

// The event roles of the API seeder (RolesAndPermissionSeeder, fix/inicio-api-hardening): what each role holds.
const EVENT_PERMISSIONS = [
  'view_events', 'view_event', 'create_event', 'edit_event', 'delete_event',
  'view_guests', 'create_guest', 'edit_guest', 'delete_guest', 'view_rsvp', 'manage_rsvp',
  'view_menus', 'view_menu', 'create_menu', 'edit_menu', 'add_menu_item', 'edit_menu_item', 'delete_menu_item',
  'view_event_locations', 'create_event_locations', 'edit_event_locations',
  'view_gallery', 'upload_photo', 'delete_photo', 'view_sweet_memories',
  'view_suggested_music', 'add_song', 'delete_song', 'manage_playlist',
  'view_save_the_date', 'view_event_comments', 'view_budget', 'manage_collaborators',
  'view_profile', 'view_preferences', 'view_security', 'view_danger_zone'
]
const ROLES = {
  owner: EVENT_PERMISSIONS,
  editor: EVENT_PERMISSIONS.filter(p => !['delete_event', 'manage_collaborators', 'view_danger_zone'].includes(p)),
  viewer: [
    'view_events', 'view_event', 'view_guests', 'view_rsvp', 'view_menus', 'view_menu', 'view_event_locations', 'view_gallery',
    'view_sweet_memories', 'view_suggested_music', 'view_save_the_date', 'view_event_comments', 'view_profile', 'view_preferences', 'view_security'
  ]
}

/** A stand-in for useEventsStore with the permissions of `role` on event 1 (names, as the API sends them). */
function store(role, { loaded = true, eventId = 1, loadResult } = {}) {
  const s = {
    activeEvent: eventId ? { id: eventId, userRole: role } : null,
    eventPermissions: loaded ? [...ROLES[role]] : null,
    permissionsEventId: loaded ? eventId : null,
    hasPermission: name => (s.eventPermissions ?? []).some(p => (typeof p === 'string' ? p : p.name) === name),
    loadEventPermissions: vi.fn(async id => {
      if (loadResult === 'fail') return { status: 500 }
      s.eventPermissions = [...ROLES[role]]
      s.permissionsEventId = id
      return { status: 200 }
    })
  }
  return s
}
const to = (requiredPermission, extra = {}) => ({ meta: { requiredPermission, ...extra.meta }, params: extra.params ?? {} })

describe('requiredPermissions', () => {
  it('reads a list, a single name or nothing', () => {
    expect(requiredPermissions(to(['view_budget']))).toEqual(['view_budget'])
    expect(requiredPermissions(to('view_guests'))).toEqual(['view_guests'])
    expect(requiredPermissions(to([]))).toEqual([])
    expect(requiredPermissions({ meta: {} })).toEqual([])
    expect(requiredPermissions(to(['', null]))).toEqual([])
  })
})

describe('permissionRedirect', () => {
  it('sends a viewer away from the budget, back to the Inicio', async () => {
    expect(await permissionRedirect(to(['view_budget']), store('viewer'))).toEqual({ name: 'dashboard' })
  })
  it('lets owners and editors into the budget', async () => {
    expect(await permissionRedirect(to(['view_budget']), store('owner'))).toBeNull()
    expect(await permissionRedirect(to(['view_budget']), store('editor'))).toBeNull()
  })
  it('accepts the `{ name }` shape of older payloads', async () => {
    const s = store('editor')
    s.eventPermissions = [{ name: 'view_budget' }]
    expect(await permissionRedirect(to(['view_budget']), s)).toBeNull()
  })
  it('needs every permission of the list', async () => {
    expect(await permissionRedirect(to(['view_guests', 'view_budget']), store('viewer'))).toEqual({ name: 'dashboard' })
  })
  it('lets routes without permissions and pages without an active event through', async () => {
    expect(await permissionRedirect(to([]), store('viewer'))).toBeNull()
    expect(await permissionRedirect(to(['view_profile']), store('viewer', { eventId: null }))).toBeNull()
  })
  it('never decides with another event\'s list: reads this event\'s first (owner of A, viewer of B)', async () => {
    const s = store('viewer')
    s.permissionsEventId = 99 // still the list of the previous event
    s.eventPermissions = [...ROLES.owner]
    expect(await permissionRedirect(to(['view_budget']), s)).toEqual({ name: 'dashboard' })
    expect(s.loadEventPermissions).toHaveBeenCalledWith(1)
  })
  it('owners do not wait for the list', async () => {
    const s = store('owner', { loaded: false })
    expect(await permissionRedirect(to(['view_budget']), s)).toBeNull()
    expect(s.loadEventPermissions).not.toHaveBeenCalled()
  })
  it('opens the route when the list cannot be read: the API still refuses', async () => {
    const s = store('viewer', { loaded: false, loadResult: 'fail' })
    expect(await permissionRedirect(to(['view_budget']), s)).toBeNull()
  })
  it('does not judge a route about another event with the active event\'s permissions', async () => {
    const meta = { eventParam: 'id' }
    expect(await permissionRedirect(to(['edit_event'], { meta, params: { id: '5' } }), store('viewer'))).toBeNull()
    expect(await permissionRedirect(to(['edit_event'], { meta, params: { id: '1' } }), store('viewer'))).toEqual({ name: 'dashboard' })
  })
})

describe('every route that declares requiredPermission', () => {
  const flat = routes => routes.flatMap(r => [r, ...flat(r.children ?? [])])
  const declared = flat(authRoutes).filter(r => r.meta && 'requiredPermission' in r.meta)
  // What each role may open (the rest sends them to the Inicio). Changing this table is a product decision.
  const DENIED = {
    owner: [],
    editor: [],
    viewer: ['padrinos', 'budget', 'create-menus', 'edit-menus', 'edit-event']
  }
  it('is covered by this table', () => expect(declared.length).toBeGreaterThan(20))
  for (const role of Object.keys(ROLES)) {
    it(`opens for a ${role} exactly what the role allows`, async () => {
      const denied = []
      for (const route of declared) {
        const result = await permissionRedirect({ name: route.name, meta: route.meta, params: { id: '1' } }, store(role))
        if (result) denied.push(route.name)
      }
      expect(denied.sort()).toEqual([...DENIED[role]].sort())
    })
  }
})
