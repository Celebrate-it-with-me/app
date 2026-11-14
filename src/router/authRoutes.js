import DashboardView from '../views/internal/dashboard/Dashboard.vue'
import { useUserStore } from '@/stores/useUserStore'
import AccountLayout from '@/components/internal/layout/AccountLayout.vue'
import SettingsProfile from '@/views/internal/settings/SettingsProfile.vue'
import SettingsPreferences from '@/views/internal/settings/SettingsPreferences.vue'
import SettingsSecurity from '@/views/internal/settings/SettingsSecurity.vue'
import commentsRoutes from '@/modules/comments/routes/comment.routes'
import suggestedMusicRoutes from '@/modules/suggested-music/routes/suggestedMusic.routes'
import sweetMemoriesRoutes from '@/modules/sweet-memories/routes/sweetMemories.routes'
import budgetRoutes from '@/modules/budget/routes/budget.routes'
import padrinosRoutes from '@/modules/padrinos/routes/padrinos.route'
import locationsRoutes from '@/modules/locations/routes/locations.route'
import dressCodeRoutes from '@/modules/dress-code/routes/dressCode.route'
import saveTheDateRoutes from '@/modules/save-the-date/routes/saveTheDate.route'
import timelineRoutes from '@/modules/timeline/routes/timeline.route'
import errorsRoutes from '@/modules/errors/routes/errors.route'
import rosterRoutes from '@/modules/roster/routes/roster.route'
import menusRoutes from '@/modules/menus/routes/menus.routes'
import eventsRoutes from '@/modules/events/routes/events.routes'
import paymentsRoutes from '@/modules/payments/routes/payments.route'
import UnlockView from '@/views/internal/unlock/UnlockView.vue'
import seatingRoutes from '@/modules/seating/routes/seating.route'
import onboardingRoutes from '@/modules/onboarding/routes/onboarding.route'
import collaboratorsRoutes from '@/modules/collaborators/routes/collaborators.route'

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
    component: AccountLayout,
    children: [
      {
        path: 'profile',
        name: 'settings-profile',
        component: SettingsProfile,
        meta: {
          titleKey: 'titles.profile',
          requiresAuth: true,
          requiredPermission: ['view_profile']
        }
      },
      {
        path: 'preferences',
        name: 'settings-preferences',
        component: SettingsPreferences,
        meta: {
          titleKey: 'titles.preferences',
          requiresAuth: true,
          requiredPermission: ['view_preferences']
        }
      },
      {
        path: 'security',
        name: 'settings-security',
        component: SettingsSecurity,
        meta: {
          titleKey: 'titles.security',
          requiresAuth: true,
          requiredPermission: ['view_security']
        }
      }
    ]
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
  ...commentsRoutes,
  ...suggestedMusicRoutes,
  ...sweetMemoriesRoutes,
  ...budgetRoutes,
  ...padrinosRoutes,
  ...collaboratorsRoutes,
  ...locationsRoutes,
  ...dressCodeRoutes,
  ...saveTheDateRoutes,
  ...timelineRoutes,
  ...paymentsRoutes,
  {
    path: '/dashboard/unlock/:module',
    name: 'unlock',
    component: UnlockView,
    meta: { titleKey: 'titles.unlock', requiresAuth: true }
  },
  ...errorsRoutes,
  ...rosterRoutes,
  ...menusRoutes,
  ...eventsRoutes,
  ...seatingRoutes,
  ...onboardingRoutes,
  {
    path: '/logout',
    name: 'logout',
    beforeEnter: async () => {
      const user = useUserStore()
      await user.logOut()
      return { name: 'sign-in' }
    }
  }
]

export { authRoutes }
