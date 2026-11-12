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
  MessageCircle
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
  invitation: { to: null, icon: Sparkles, labelKey: 'app.nav.invitation' }, // the editor is not built yet
  guests: { to: '/dashboard/guests', icon: Users, labelKey: 'app.nav.guests', primary: true },
  rsvp: { to: '/dashboard/rsvp', icon: CheckSquare, labelKey: 'app.nav.rsvp', primary: true },
  save_the_date: { to: '/dashboard/save-the-date', icon: AlarmClock, labelKey: 'app.nav.saveTheDate' },
  timeline: { to: '/dashboard/timeline', icon: CalendarClock, labelKey: 'app.nav.timeline' },
  locations: { to: '/dashboard/locations', icon: MapPin, labelKey: 'app.nav.locations' },
  dress_code: { to: '/dashboard/dress-code', icon: Shirt, labelKey: 'app.nav.dressCode' },
  budget: { to: '/dashboard/budget', icon: Wallet, labelKey: 'app.nav.budget', primary: true },
  padrinos: { to: null, icon: HeartHandshake, labelKey: 'app.nav.padrinos' }, // the module is not built yet
  menus: { to: '/dashboard/menus', icon: ChefHat, labelKey: 'app.nav.menus' },
  seating: { to: '/dashboard/seating', icon: NotebookPen, labelKey: 'app.nav.seating' },
  suggested_music: { to: '/dashboard/suggested-music', icon: Music, labelKey: 'app.nav.music' },
  memories: { to: '/dashboard/memories', icon: Camera, labelKey: 'app.nav.memories' },
  comments: { to: '/dashboard/event-comments', icon: MessageCircle, labelKey: 'app.nav.comments' }
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

/** Where a locked module leads: the "pass to premium" screen, never the module itself. */
export const unlockPath = key => `/dashboard/unlock/${key}`

/**
 * Turn the modules the API sent for an event into menu sections.
 * Returns `[{ section, items: [{ key, to, icon, labelKey, section, order, state, primary }] }]`,
 * leaving out empty sections. Without modules (no event yet) only Home is shown.
 */
export function buildNavSections(modules) {
  const drawn = (modules ?? [])
    .map(module => {
      const view = MODULE_VIEWS[module.key]
      if (!view?.to) return null
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

  const all = [HOME_ITEM, ...drawn].sort(
    (a, b) => SECTIONS.indexOf(a.section) - SECTIONS.indexOf(b.section) || a.order - b.order
  )

  return SECTIONS.map(section => ({ section, items: all.filter(item => item.section === section) })).filter(
    group => group.items.length
  )
}
