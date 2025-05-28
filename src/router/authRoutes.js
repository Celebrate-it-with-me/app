import DashboardView from '../views/internal/dashboard/DashboardView.vue'
import { useUserStore } from '@/stores/useUserStore'
import EventsView from '@/views/internal/events/EventsView.vue'
import CSweetMemories from '@/components/authenticated/sweet-memories/CSweetMemories.vue'
import CSuggestMusic from '../components/authenticated/suggest-music/CSuggestMusic.vue'
import CEventComments from '../components/authenticated/event-comments/CEventComments.vue'
import CreateEventsView from '@/views/internal/events/CreateEventsView.vue'
import SettingsLayout from '@/components/internal/layout/SettingsLayout.vue'
import SettingsProfile from '@/views/internal/settings/SettingsProfile.vue'
import SettingsPreferences from '@/views/internal/settings/SettingsPreferences.vue'
import SettingsSecurity from '@/views/internal/settings/SettingsSecurity.vue'
import SettingsDangerZone from '@/views/internal/settings/SettingsDangerZone.vue'
import CreateGuestView from '@/views/internal/guests/CreateGuestView.vue'
import GuestsView from '@/views/internal/guests/GuestsView.vue'
import RsvpView from '@/views/internal/rsvp/RsvpView.vue'
import SaveTheDateView from '@/views/internal/save-the-date/SaveTheDateView.vue'
import CEventLocationsView from '@/views/internal/locations/CEventLocationsView.vue'
import CEventLocationsCreateView from '@/views/internal/locations/CEventLocationsCreateView.vue'
import MenusView from '@/views/internal/menus/MenusView.vue'
import CreateMenusView from '@/views/internal/menus/CreateMenusView.vue'
import ShowMenuView from '@/views/internal/menus/ShowMenuView.vue'
import EventDetailsView from '@/views/internal/events/EventDetailsView.vue'

const authRoutes = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      title: 'Dashboard',
      requiresAuth: true,
      // requiredPermission: ['view_dashboard'],
    }
  },
  {
    path: '/dashboard/events',
    name: 'events',
    component: EventsView,
    meta: {
      title: 'My CwmEvents',
      requiresAuth: true,
      requiredPermission: ['view_events'],
    }
  },
  {
    path: '/dashboard/events/create',
    name: 'create-events',
    component: CreateEventsView,
    meta: {
      title: 'Create Event',
      requiresAuth: true,
      requiredPermission: ['create_event'],
    }
  },
  {
    path: '/dashboard/events/:id/details',
    name: 'event-details',
    component: EventDetailsView,
    meta: {
      title: 'Event Details',
      requiresAuth: true,
      requiredPermission: ['view_event'],
    }
  },
  {
    path: '/dashboard/events/:id/edit',
    name: 'edit-event',
    component: CreateEventsView,
    meta: {
      title: 'Edit Event',
      requiresAuth: true,
      requiredPermission: ['edit_event'],
    }
  },
  {
    path: '/settings',
    component: SettingsLayout,
    children: [
      {
        path: 'profile',
        name: 'settings-profile',
        component: SettingsProfile,
        meta: {
          title: 'Profile',
          requiresAuth: true,
          requiredPermission: ['view_profile'],
        }
      },
      {
        path: 'preferences',
        name: 'settings-preferences',
        component: SettingsPreferences,
        meta: {
          title: 'Preferences',
          requiresAuth: true,
          requiredPermission: ['view_preferences'],
        }
      },
      {
        path: 'security',
        name: 'settings-security',
        component: SettingsSecurity,
        meta: {
          title: 'Security',
          requiresAuth: true,
          requiredPermission: ['view_security'],
        }
      },
      {
        path: 'danger-zone',
        name: 'settings-danger-zone',
        component: SettingsDangerZone,
        meta: {
          title: 'Danger Zone',
          requiresAuth: true,
          requiredPermission: ['view_danger_zone'],
        }
      }
    ]
  },
  {
    path: 'dashboard/guests',
    name: 'guests',
    component: GuestsView,
    meta: {
      title: 'Events Guests',
      requiresAuth: true,
      requiredPermission: ['view_guests'],
    }
  },
  {
    path: '/dashboard/guests/create',
    name: 'create-guest',
    component: CreateGuestView,
    meta: {
      title: 'Create Guest',
      requiresAuth: true,
      requiredPermission: ['create_guest'],
    }
  },
  {
    path: '/dashboard/rsvp',
    name: 'rsvp',
    component: RsvpView,
    meta: {
      title: 'RSVP',
      requiresAuth: true,
      requiredPermission: ['view_rsvp'],
    }
  },
  {
    path: '/dashboard/menus',
    name: 'menus',
    component: MenusView,
    meta: {
      title: 'Menus',
      requiresAuth: true,
      requiredPermission: ['view_menus'],
    }
  },
  {
    path: '/dashboard/menus/create',
    name: 'create-menus',
    component: CreateMenusView,
    meta: {
      title: 'Menus',
      requiresAuth: true,
      requiredPermission: ['create_menu'],
    }
  },
  {
    path: '/dashboard/menus/show/:id',
    name: 'show-menu',
    component: ShowMenuView,
    meta: {
      title: 'Show Menus',
      requiresAuth: true,
      requiredPermission: ['view_menu'],
    }
  },
  {
    path: '/dashboard/menus/edit/:id',
    name: 'edit-menus',
    component: CreateMenusView,
    meta: {
      title: 'Edit Menus',
      requiresAuth: true,
      requiredPermission: ['edit_menu'],
    }
  },
  {
    path: '/dashboard/save-the-date',
    name: 'save-the-date',
    component: SaveTheDateView,
    meta: {
      title: 'Save the date',
      requiresAuth: true,
      requiredPermission: ['view_save_the_date'],
    }
  },
  {
    path: '/dashboard/sweet-memories',
    name: 'sweet-memories',
    component: CSweetMemories,
    meta: {
      title: 'Sweet Memories',
      requiresAuth: true,
      requiredPermission: ['view_sweet_memories'],
    }
  },
  {
    path: '/dashboard/suggested-music',
    name: 'suggest-music',
    component: CSuggestMusic,
    meta: {
      title: 'Suggest Music',
      requiresAuth: true,
      requiredPermission: ['view_suggested_music'],
    }
  },
  {
    path: '/dashboard/event-comments',
    name: 'event-comments',
    component: CEventComments,
    meta: {
      title: 'Background Music',
      requiresAuth: true,
      requiredPermission: ['view_event_comments'],
    }
  },
  {
    path: '/dashboard/locations',
    name: 'locations',
    component: CEventLocationsView,
    meta: {
      title: 'Event Locations',
      requiresAuth: true,
      requiredPermission: ['view_event_locations'],
    }
  },
  {
    path: '/dashboard/locations/create',
    name: 'create-location',
    component: CEventLocationsCreateView,
    meta: {
      title: 'Create Location',
      requiresAuth: true,
      requiredPermission: ['create_event_locations'],
    }
  },
  {
    path: '/dashboard/locations/edit/:id',
    name: 'edit-location',
    component: CEventLocationsCreateView,
    meta: {
      title: 'Edit Location',
      requiresAuth: true,
      requiredPermission: ['edit_event_locations'],
    }
  },
  {
    path: '/dashboard/events/:id/invitations',
    name: 'invitations-processor',
    component: () => import('@/views/internal/invitations/InvitationProcessorView.vue'),
    meta: {
      title: 'Invitations Processor',
      requiresAuth: true,
      requiredPermission: [],
    }
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
        path: 'rsvp',
        name: 'rsvp',
        component: CWMRsvp,
        meta: {
          title: 'RSVP Creator'
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
        path: 'background-music',
        name: 'background-music',
        component: CWMBackgroundMusic,
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
