import {
  LayoutDashboard,
  Sparkles,
  Users,
  CheckSquare,
  AlarmClock,
  CalendarClock,
  MapPin,
  Shirt,
  Wallet,
  HeartHandshake,
  ChefHat,
  NotebookPen,
  Music,
  Camera,
  MessageCircle,
  Briefcase,
  Ellipsis
} from 'lucide-vue-next'

/** Sections of the menu, in order. `main` has no title. The API sends each module's section. */
export const SECTIONS = ['main', 'guests', 'organization', 'extras']

/**
 * How the app DRAWS each module: its screen, icon and text.
 *
 * Which modules exist, in which section and order, and who can use them is not decided here: it comes
 * from the module catalog in the database (`event.modules`, sent by the API), so the admin can switch
 * a module on or off without a deploy. A module the API sends that is missing here, or that has no
 * screen yet (`to: null`), is simply not drawn: nobody can expose a link that leads nowhere.
 */
export const MODULE_VIEWS = {
  invitation: { to: '/dashboard/invitation', icon: Sparkles, labelKey: 'app.nav.invitation' },
  guests: { to: '/dashboard/guests', icon: Users, labelKey: 'app.nav.guests', primary: true },
  rsvp: { to: null, icon: CheckSquare, labelKey: 'app.nav.rsvp' }, // a tab of the guest list now
  save_the_date: { to: '/dashboard/save-the-date', icon: AlarmClock, labelKey: 'app.nav.saveTheDate' },
  timeline: { to: '/dashboard/timeline', icon: CalendarClock, labelKey: 'app.nav.timeline' },
  locations: { to: '/dashboard/locations', icon: MapPin, labelKey: 'app.nav.locations' },
  dress_code: { to: '/dashboard/dress-code', icon: Shirt, labelKey: 'app.nav.dressCode' },
  // Money: only for people with `view_budget` (owners and editors; owner decision 2026-11-26).
  budget: { to: '/dashboard/budget', icon: Wallet, labelKey: 'app.nav.budget', primary: true, permission: 'view_budget' },
  padrinos: { to: '/dashboard/padrinos', icon: HeartHandshake, labelKey: 'app.nav.padrinos', permission: 'view_budget' },
  menus: { to: '/dashboard/menus', icon: ChefHat, labelKey: 'app.nav.menus' },
  // `deferred`: the module is frozen until after the launch (decision 2026-11-18), so no menu draws it; the route and the screen stay.
  seating: { to: '/dashboard/seating', icon: NotebookPen, labelKey: 'app.nav.seating', deferred: true },
  suggested_music: { to: '/dashboard/suggested-music', icon: Music, labelKey: 'app.nav.music' },
  memories: { to: '/dashboard/memories', icon: Camera, labelKey: 'app.nav.memories' },
  comments: { to: '/dashboard/event-comments', icon: MessageCircle, labelKey: 'app.nav.comments' },
  // No screen of its own: sending lives in the guest list. Listed so the "pass to premium" screen can name it.
  whatsapp: { to: null, icon: MessageCircle, labelKey: 'app.nav.whatsapp' },
  // A control key, not a menu entry (the screen sits under Organization elsewhere): it only gives the unlock screen a name.
  collaborators: { to: null, icon: Users, labelKey: 'app.nav.collaborators' }
}

/** The home screen is always there; it is not a module. */
export const HOME_ITEM = {
  key: 'home',
  to: '/dashboard',
  icon: LayoutDashboard,
  labelKey: 'app.nav.home',
  section: 'main',
  order: 0,
  state: 'active',
  primary: true
}

/**
 * "Tu invitación": the editor and the template selector. It is not gated by the module catalog (the catalog row
 * `invitation` starts switched off and the phone's bottom bar always draws this entry): without it the desktop sidebar would
 * have no way into the screen. If the catalog does send `invitation` as active, its own row wins.
 */
export const INVITATION_ITEM = {
  key: 'invitation',
  to: '/dashboard/invitation',
  icon: Sparkles,
  labelKey: 'app.nav.invitation',
  section: 'main',
  order: 0.6,
  state: 'active',
  primary: false
}

/** Where a locked module leads: the "pass to premium" screen, never the module itself. */
export const unlockPath = key => `/dashboard/unlock/${key}`

/**
 * Turn the modules the API sent for an event into menu sections.
 * Returns `[{ section, items: [{ key, to, icon, labelKey, section, order, state, primary }] }]`,
 * leaving out empty sections. Without modules (no event yet) only Home is shown.
 */
/**
 * `can(permission)` says whether the person holds an event permission; entries that need one she lacks are left out.
 */
export function buildNavSections(modules, { can = () => true } = {}) {
  const drawn = (modules ?? [])
    .map(module => {
      const view = MODULE_VIEWS[module.key]
      if (!view?.to || view.deferred) return null
      if (view.permission && !can(view.permission)) return null
      const locked = module.state === 'locked'
      return {
        key: module.key,
        to: locked ? unlockPath(module.key) : view.to,
        icon: view.icon,
        labelKey: view.labelKey,
        section: module.section,
        order: module.order ?? 0,
        state: locked ? 'locked' : 'active',
        // Only usable modules go in the phone's bottom bar.
        primary: !!view.primary && !locked
      }
    })
    .filter(item => item && SECTIONS.includes(item.section))

  const withModules = Array.isArray(modules) && modules.length
  const withInvitation = withModules && !drawn.some(item => item.key === 'invitation') ? [INVITATION_ITEM] : []
  const all = [HOME_ITEM, ...withInvitation, ...drawn].sort(
    (a, b) => SECTIONS.indexOf(a.section) - SECTIONS.indexOf(b.section) || a.order - b.order
  )

  return SECTIONS.map(section => ({ section, items: all.filter(item => item.section === section) })).filter(
    group => group.items.length
  )
}

/**
 * The phone's bottom bar, built from the same sections as the sidebar (one source of truth).
 *
 * Tabs: Home, "Tu invitación", Guests, "Organización" and "Más".
 * - "Tu invitación" leads to the invitation editor. It needs an event, so it is always drawn when there is one; the catalog's
 *   own `invitation` module (sidebar) is not repeated in the "Más" sheet.
 *   Publishing still lives on the event screen (`edit-event`), reached from the editor's "Publicar".
 * - Guests is a plain link and only shows while the module is on and usable.
 * - "Organización" opens a sheet with the whole section (locked ones with their padlock).
 * - "Más" opens a sheet with everything else: what is left of the guests section and the extras.
 * Modules the admin switched off never arrive here, so they are never drawn.
 */
export function buildMobileNav(sections, eventId = null) {
  const items = sections.flatMap(group => group.items)
  const guests = items.find(item => item.key === 'guests' && item.state === 'active') ?? null
  const organization = items.filter(item => item.section === 'organization')
  const more = items.filter(
    item => item.key !== 'home' && item.key !== 'invitation' && item !== guests && item.section !== 'organization'
  )
  const home = items.find(item => item.key === 'home')

  const tabs = [{ key: 'home', kind: 'link', to: home.to, icon: home.icon, labelKey: home.labelKey }]
  if (eventId) {
    tabs.push({
      key: 'invitation',
      kind: 'link',
      to: '/dashboard/invitation',
      routeNames: ['invitation-editor'],
      icon: MODULE_VIEWS.invitation.icon,
      labelKey: MODULE_VIEWS.invitation.labelKey
    })
  }
  if (guests) tabs.push({ key: 'guests', kind: 'link', to: guests.to, icon: guests.icon, labelKey: guests.labelKey })
  if (organization.length) {
    tabs.push({ key: 'organization', kind: 'sheet', icon: Briefcase, labelKey: 'app.groups.organization', items: organization })
  }
  tabs.push({ key: 'more', kind: 'sheet', icon: Ellipsis, labelKey: 'app.nav.more', items: more })
  return tabs
}

/** Whether `path` is the destination `to` (a path string) or inside it. Route objects never match by path. */
export function isActivePath(path, to) {
  if (typeof to !== 'string') return false
  return path === to || (to !== '/dashboard' && path.startsWith(to + '/'))
}

const HOME_PATHS = ['/dashboard/plan', '/dashboard/start']
const GUEST_PATHS = ['/dashboard/guests', '/dashboard/rsvp']
const INVITATIONS_SEND = /^\/dashboard\/events\/[^/]+\/invitations(\/|$)/
const UNLOCK = /^\/dashboard\/unlock\/([^/]+)/

/**
 * Which tab of the phone's bottom bar is lit for a route. Every route inside the panel lights exactly one tab:
 * - Home: `/dashboard` and the plan/start screens. "Tu invitación": the editor.
 * - Guests (when its tab exists): the guest list, RSVP and everything the catalog files under the guests section
 *   (Save the date, messaging), plus the invitation sending screen.
 * - "Organización": its own items. An `unlock/:module` screen takes the tab of the section of that module.
 * - Anything else (menus, music, memories, collaborators, settings, events, ...) is under "Más".
 */
export function activeTabKey(path, tabs, sections = [], routeName = null) {
  const has = key => tabs.some(tab => tab.key === key)
  const items = sections.flatMap(group => group.items)

  const unlocked = UNLOCK.exec(path)
  const target = unlocked ? items.find(item => item.key === unlocked[1]) : null
  const section = target ? (target.key === 'guests' ? 'guests' : target.section) : null

  if (has('home') && (path === '/dashboard' || HOME_PATHS.some(to => isActivePath(path, to)))) return 'home'

  const invitation = tabs.find(tab => tab.key === 'invitation')
  if (invitation && (invitation.routeNames?.includes(routeName) || isActivePath(path, invitation.to))) return 'invitation'

  if (has('guests')) {
    const inGuests = items.some(item => item.section === 'guests' && isActivePath(path, item.to))
    if (inGuests || section === 'guests' || INVITATIONS_SEND.test(path) || GUEST_PATHS.some(to => isActivePath(path, to))) {
      return 'guests'
    }
  }

  const organization = tabs.find(tab => tab.key === 'organization')
  if (organization && (section === 'organization' || organization.items.some(item => isActivePath(path, item.to)))) {
    return 'organization'
  }

  return 'more'
}
