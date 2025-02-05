import DashboardView from '../views/DashboardView.vue'
import EventsView from '../views/EventsView.vue'
import { useUserStore } from '../stores/useUserStore'
import SaveTheDate from '../components/authenticated/save-the-date/SaveTheDate.vue'
import MyEvents from '../components/authenticated/events/MyEvents.vue'
import EventGuests from '../components/authenticated/guests/EventGuests.vue'
import CWMRsvp from '../components/authenticated/rsvp/CWMRsvp.vue'
import CWMGallery from '../components/authenticated/gallery/CWMGallery.vue'
import CWMSeatAccommodation from '../components/authenticated/seat-accommodation/CWMSeatAccommodation.vue'
import CWMPreview from '../components/authenticated/preview/CWMPreview.vue'
import CWMBudget from '../components/authenticated/budget/CWMBudget.vue'
import CWMAnalytics from '../components/authenticated/analytics/CWMAnalytics.vue'
import CWMSuggestMusic from '../components/authenticated/suggest-music/CWMSuggestMusic.vue'

const authRoutes = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      title: 'CwmEvents Dashboard'
    }
  },
  {
    path: '/dashboard',
    name: 'events',
    component: EventsView,
    meta: {
      title: 'My CwmEvents'
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
          title: 'CwmEvents Guests'
        },
      },
      {
        path: 'save-the-date',
        name: 'save-the-date',
        component: SaveTheDate,
        meta: {
          title: 'Save the date'
        }
      },
      {
        path: 'rsvp',
        name: 'rsvp',
        component: CWMRsvp,
        meta: {
          title: 'RSVP Creator'
        }
      },
      {
        path: 'gallery',
        name: 'gallery',
        component: CWMGallery,
        meta: {
          title: 'Art Gallery'
        }
      },
      {
        path: 'seats-accommodation',
        name: 'seats-accommodation',
        component: CWMSeatAccommodation,
        meta: {
          title: 'Seat Accommodation'
        }
      },
      {
        path: 'preview',
        name: 'preview',
        component: CWMPreview,
        meta: {
          title: 'Event Previous'
        }
      },
      {
        path: 'budget',
        name: 'budget',
        component: CWMBudget,
        meta: {
          title: 'Event Previous'
        }
      },
      {
        path: 'suggest-music',
        name: 'suggest-music',
        component: CWMSuggestMusic,
        meta: {
          title: 'Suggest Music'
        }
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: CWMAnalytics,
        meta: {
          title: 'Event Previous'
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
