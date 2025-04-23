import DashboardView from '../views/authenticated/DashboardView.vue'
import { useUserStore } from '@/stores/useUserStore'
import EventsView from '@/views/internal/events/EventsView.vue'
import SaveTheDate from '../components/authenticated/save-the-date/SaveTheDate.vue'
import MyEvents from '../components/authenticated/events/MyEvents.vue'
import EventGuests from '../components/authenticated/guests/EventGuests.vue'
import CWMRsvp from '../components/authenticated/rsvp/CWMRsvp.vue'
import CwmSweetMemories from '@/components/authenticated/sweet-memories/CWMSweetMemories.vue'
import CWMSeatAccommodation from '../components/authenticated/seat-accommodation/CWMSeatAccommodation.vue'
import CWMPreview from '../components/authenticated/preview/CWMPreview.vue'
import CWMBudget from '../components/authenticated/budget/CWMBudget.vue'
import CWMAnalytics from '../components/authenticated/analytics/CWMAnalytics.vue'
import CWMSuggestMusic from '../components/authenticated/suggest-music/CWMSuggestMusic.vue'
import CWMBackgroundMusic from '../components/authenticated/background-music/CWMBackgroundMusic.vue'
import CWMEventComments from '../components/authenticated/event-comments/CWMEventComments.vue'
import ComponentsPlayground from '@/views/components-playground/ComponentsPlayground.vue'
import CreateEventsView from '@/views/internal/events/CreateEventsView.vue'
import { useEventsStore } from '@/stores/useEventsStore'
import SettingsLayout from '@/components/internal/layout/SettingsLayout.vue'
import SettingsProfile from '@/views/internal/settings/SettingsProfile.vue'
import SettingsPreferences from '@/views/internal/settings/SettingsPreferences.vue'
import SettingsSecurity from '@/views/internal/settings/SettingsSecurity.vue'
import SettingsDangerZone from '@/views/internal/settings/SettingsDangerZone.vue'
import CreateGuestView from '@/views/internal/guests/CreateGuestView.vue'

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
    path: '/dashboard/events',
    name: 'events',
    component: EventsView,
    meta: {
      title: 'My CwmEvents'
    },
  },
  {
    path: '/dashboard/events/create',
    name: 'create-events',
    component: CreateEventsView,
    meta: {
      title: 'Create Event'
    },
  },
  {
    path: '/dashboard/events/edit/:id',
    name: 'edit-event',
    component: CreateEventsView,
    meta: {
      title: 'Edit Event'
    },
  },
  {
    path: '/settings',
    component: SettingsLayout,
    children: [
      { path: 'profile', name: 'settings-profile', component: SettingsProfile, meta: { title: 'Profile' } },
      { path: 'preferences', name: 'settings-preferences', component: SettingsPreferences, meta: { title: 'Preferences' } },
      { path: 'security', name: 'settings-security', component: SettingsSecurity, meta: { title: 'Security' } },
      { path: 'danger-zone', name: 'settings-danger-zone', component: SettingsDangerZone, meta: { title: 'Danger Zone' } },
    ]
  },
  /*{
    path: 'dashboard/guests',
    name: 'guests',
    component: EventGuests,
    meta: {
      title: 'Events Guests'
    },
  },*/
  {
    path: '/dashboard/guests/create',
    name: 'create-guest',
    component: CreateGuestView,
    meta: {
      title: 'Create Guest'
    },
  },

      /*children: [
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
        path: 'sweet-memories',
        name: 'sweet-memories',
        component: CwmSweetMemories,
        meta: {
          title: 'Sweet Memories'
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
        path: 'background-music',
        name: 'background-music',
        component: CWMBackgroundMusic,
        meta: {
          title: 'Background Music'
        }
      },
      {
        path: 'event-comments',
        name: 'event-comments',
        component: CWMEventComments,
        meta: {
          title: 'Background Music'
        }
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: CWMAnalytics,
        meta: {
          title: 'Event Previous'
        }
      },
      {
        path: 'playground',
        name: 'playground',
        component: ComponentsPlayground,
        meta: {
          title: 'Components Playground'
        }
      },
      {
        path: 'events',
        name: 'events',
        component: EventsView,
        meta: {
          title: 'My Events'
        }
      }
    ]*/
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
