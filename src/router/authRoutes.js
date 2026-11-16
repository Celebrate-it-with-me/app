import { useUserStore } from '@/stores/useUserStore'
import commentsRoutes from '@/modules/comments/routes/comment.routes'
import suggestedMusicRoutes from '@/modules/suggested-music/routes/suggestedMusic.routes'
import sweetMemoriesRoutes from '@/modules/sweet-memories/routes/sweetMemories.routes'
import budgetRoutes from '@/modules/budget/routes/budget.routes'
import padrinosRoutes from '@/modules/padrinos/routes/padrinos.route'
import locationsRoutes from '@/modules/locations/routes/locations.route'
import dressCodeRoutes from '@/modules/dress-code/routes/dressCode.route'
import saveTheDateRoutes from '@/modules/save-the-date/routes/saveTheDate.route'
import timelineRoutes from '@/modules/timeline/routes/timeline.route'
import invitationEditorRoutes from '@/modules/invitation-editor/routes/invitationEditor.route'
import errorsRoutes from '@/modules/errors/routes/errors.route'
import rosterRoutes from '@/modules/roster/routes/roster.route'
import menusRoutes from '@/modules/menus/routes/menus.routes'
import eventsRoutes from '@/modules/events/routes/events.routes'
import paymentsRoutes from '@/modules/payments/routes/payments.route'
import purchasesRoutes from '@/modules/purchases/routes/purchases.route'
import seatingRoutes from '@/modules/seating/routes/seating.route'
import onboardingRoutes from '@/modules/onboarding/routes/onboarding.route'
import collaboratorsRoutes from '@/modules/collaborators/routes/collaborators.route'
import assistantRoutes from '@/modules/assistant/routes/assistant.route'

const authRoutes = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/internal/dashboard/Dashboard.vue'),
    meta: {
      title: 'Dashboard',
      requiresAuth: true
      // requiredPermission: ['view_dashboard'],
    }
  },
  {
    path: '/settings',
    component: () => import('@/components/internal/layout/AccountLayout.vue'),
    children: [
      {
        path: 'profile',
        name: 'settings-profile',
        component: () => import('@/views/internal/settings/SettingsProfile.vue'),
        meta: {
          titleKey: 'titles.profile',
          requiresAuth: true,
          requiredPermission: ['view_profile']
        }
      },
      {
        path: 'preferences',
        name: 'settings-preferences',
        component: () => import('@/views/internal/settings/SettingsPreferences.vue'),
        meta: {
          titleKey: 'titles.preferences',
          requiresAuth: true,
          requiredPermission: ['view_preferences']
        }
      },
      {
        path: 'security',
        name: 'settings-security',
        component: () => import('@/views/internal/settings/SettingsSecurity.vue'),
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
  ...invitationEditorRoutes,
  ...paymentsRoutes,
  ...purchasesRoutes,
  {
    path: '/dashboard/unlock/:module',
    name: 'unlock',
    component: () => import('@/views/internal/unlock/UnlockView.vue'),
    meta: { titleKey: 'titles.unlock', requiresAuth: true }
  },
  ...errorsRoutes,
  ...rosterRoutes,
  ...menusRoutes,
  ...eventsRoutes,
  ...seatingRoutes,
  ...onboardingRoutes,
  ...assistantRoutes,
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
