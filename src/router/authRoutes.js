import DashboardView from '../views/internal/dashboard/Dashboard.vue'
import { useUserStore } from '@/stores/useUserStore'
import CSweetMemories from '@/components/authenticated/sweet-memories/CSweetMemories.vue'
import SettingsLayout from '@/components/internal/layout/SettingsLayout.vue'
import SettingsProfile from '@/views/internal/settings/SettingsProfile.vue'
import SettingsPreferences from '@/views/internal/settings/SettingsPreferences.vue'
import SettingsSecurity from '@/views/internal/settings/SettingsSecurity.vue'
import SettingsDangerZone from '@/views/internal/settings/SettingsDangerZone.vue'
import CWMAnalytics from '@/components/authenticated/analytics/CWMAnalytics.vue'
import CWMBackgroundMusic from '@/components/authenticated/background-music/CWMBackgroundMusic.vue'
import commentsRoutes from '@/modules/comments/routes/comment.routes'
import suggestedMusicRoutes from '@/modules/suggested-music/routes/suggestedMusic.routes'
import sweetMemoriesRoutes from '@/modules/sweet-memories/routes/sweetMemories.routes'
import budgetRoutes from '@/modules/budget/routes/budget.routes'
import locationsRoutes from '@/modules/locations/routes/locations.route'
import dressCodeRoutes from '@/modules/dress-code/routes/dressCode.route'
import saveTheDateRoutes from '@/modules/save-the-date/routes/saveTheDate.route'
import timelineRoutes from '@/modules/timeline/routes/timeline.route'
import errorsRoutes from '@/modules/errors/routes/errors.route'
import rsvpRoutes from '@/modules/rsvp/routes/rsvp.route'
import menusRoutes from '@/modules/menus/routes/menus.routes'
import guestsRoutes from '@/modules/guests/routes/guests.routes'
import eventsRoutes from '@/modules/events/routes/events.routes'
import seatingRoutes from '@/modules/seating/routes/seating.route'

const authRoutes = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      title: 'Dashboard',
      requiresAuth: true
      // requiredPermission: ['view_dashboard'],
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
          requiredPermission: ['view_profile']
        }
      },
      {
        path: 'preferences',
        name: 'settings-preferences',
        component: SettingsPreferences,
        meta: {
          title: 'Preferences',
          requiresAuth: true,
          requiredPermission: ['view_preferences']
        }
      },
      {
        path: 'security',
        name: 'settings-security',
        component: SettingsSecurity,
        meta: {
          title: 'Security',
          requiresAuth: true,
          requiredPermission: ['view_security']
        }
      },
      {
        path: 'danger-zone',
        name: 'settings-danger-zone',
        component: SettingsDangerZone,
        meta: {
          title: 'Danger Zone',
          requiresAuth: true,
          requiredPermission: ['view_danger_zone']
        }
      }
    ]
  },
  {
    path: '/dashboard/sweet-memories',
    name: 'sweet-memories',
    component: CSweetMemories,
    meta: {
      title: 'Sweet Memories',
      requiresAuth: true,
      requiredPermission: ['view_sweet_memories']
    }
  },
  {
    path: '/dashboard/analytics',
    name: 'analytics-dashboard',
    component: CWMAnalytics,
    meta: {
      title: 'Event Analytics',
      requiresAuth: true,
      requiredPermission: []
    }
  },
  {
    path: '/dashboard/events/:id/invitations',
    name: 'invitations-processor',
    component: () => import('@/views/internal/invitations/InvitationProcessorView.vue'),
    meta: {
      title: 'Invitations Processor',
      requiresAuth: true,
      requiredPermission: []
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
  ...commentsRoutes,
  ...suggestedMusicRoutes,
  ...sweetMemoriesRoutes,
  ...budgetRoutes,
  ...locationsRoutes,
  ...dressCodeRoutes,
  ...saveTheDateRoutes,
  ...timelineRoutes,
  ...errorsRoutes,
  ...rsvpRoutes,
  ...menusRoutes,
  ...guestsRoutes,
  ...eventsRoutes,
  ...seatingRoutes,
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
