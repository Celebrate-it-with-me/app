import { computed } from 'vue'
import {
  LayoutDashboard,
  Calendar,
  ChefHat,
  Wallet,
  MapPin,
  NotebookPen,
  Users,
  CheckSquare,
  AlarmClock,
  MessageCircle,
  Shirt,
  Camera,
  Music
} from 'lucide-vue-next'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

/**
 * Navigation of the organizer app. One source for the sidebar, the bottom bar and the "Más" sheet.
 * `feature` gates the item on the active event's enabled features (same rule as before).
 * Labels are i18n keys under `app.nav`.
 */
const ITEMS = [
  { key: 'home', to: '/dashboard', icon: LayoutDashboard, group: 'event', primary: true },
  { key: 'events', to: '/dashboard/events', icon: Calendar, group: 'event' },
  { key: 'guests', to: '/dashboard/guests', icon: Users, group: 'guests', primary: true },
  { key: 'rsvp', to: '/dashboard/rsvp', icon: CheckSquare, group: 'guests', feature: 'rsvp', primary: true },
  { key: 'budget', to: '/dashboard/budget', icon: Wallet, group: 'planning', feature: 'budget', primary: true },
  { key: 'locations', to: '/dashboard/locations', icon: MapPin, group: 'planning', feature: 'location' },
  { key: 'menus', to: '/dashboard/menus', icon: ChefHat, group: 'planning', feature: 'menu' },
  { key: 'seating', to: '/dashboard/seating', icon: NotebookPen, group: 'planning', feature: 'seatsAccommodation' },
  { key: 'saveTheDate', to: '/dashboard/save-the-date', icon: AlarmClock, group: 'guests', feature: 'saveTheDate' },
  { key: 'comments', to: '/dashboard/event-comments', icon: MessageCircle, group: 'guests', feature: 'eventComments' },
  { key: 'dressCode', to: '/dashboard/dress-code', icon: Shirt, group: 'experience', feature: 'dressCode' },
  { key: 'memories', to: '/dashboard/memories', icon: Camera, group: 'experience', feature: 'sweetMemories' },
  { key: 'music', to: '/dashboard/suggested-music', icon: Music, group: 'experience', feature: 'music' }
]

export const NAV_GROUPS = ['event', 'planning', 'guests', 'experience']

export function useAppNav() {
  const eventsStore = useEventsStore()

  const items = computed(() => {
    const event = eventsStore.activeEvent
    const features = event?.eventFeatures ?? []
    const enabled = name => features.some(f => f.name === name && f.isActive)
    // Without an active event only the event-level entries make sense.
    if (!event) return ITEMS.filter(item => item.group === 'event')
    return ITEMS.filter(item => !item.feature || enabled(item.feature))
  })

  const primary = computed(() => items.value.filter(item => item.primary).slice(0, 4))
  const secondary = computed(() => items.value.filter(item => !item.primary))
  const byGroup = computed(() =>
    NAV_GROUPS.map(group => ({ group, items: items.value.filter(item => item.group === group) })).filter(
      g => g.items.length
    )
  )

  return { items, primary, secondary, byGroup }
}
