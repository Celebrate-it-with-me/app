import DashboardView from '../views/DashboardView.vue'
import EventsView from '../views/EventsView.vue'
import { useUserStore } from '../stores/useUserStore'
import SaveTheDate from '../components/authenticated/save-the-date/SaveTheDate.vue'
import MyEvents from '../components/authenticated/events/MyEvents.vue'
import EventGuests from '../components/authenticated/guests/EventGuests.vue'
import EventGuestList from '../components/authenticated/guests/EventGuestList.vue'

const authRoutes = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      title: 'Events Dashboard'
    }
  },
  {
    path: '/dashboard',
    name: 'events',
    component: EventsView,
    meta: {
      title: 'My Events'
    },
    children: [
      {
        path: 'events',
        name: 'event-handle',
        component: MyEvents,
        meta: {
          title: 'Events'
        }
      },
      {
        path: 'guests',
        name: 'event-guests',
        component: EventGuests,
        meta: {
          title: 'Events Guests'
        },
      },
      {
        path: 'save-the-date',
        name: 'save-the-date',
        component: SaveTheDate,
        meta: {
          title: 'Save the date'
        }
      }
    ]
  },
  {
    path: '/logout',
    name: 'logout',
    beforeEnter: async (to, from, next) => {
      const user = useUserStore()
      await user.logOut()
      await next({ name: 'sign-in' })
    }
  }
]


export { authRoutes }
