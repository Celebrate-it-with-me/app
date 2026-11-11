import HomeView from '@/views/external/HomeView.vue'
import SignUpView from '@/views/external/SignUpView.vue'
import SignInView from '@/views/external/SignInView.vue'
import ConfirmEmailView from '@/views/external/ConfirmEmailView.vue'
import TermsView from '@/views/external/TermsView.vue'
import PrivacyView from '@/views/external/PrivacyView.vue'
import CookiesView from '@/views/external/CookiesView.vue'
import HelpView from '@/views/external/HelpView.vue'

const nonAuthRoutes = [
  {
    path: 'auth/social/callback',
    name: 'social-callback',
    component: () => import('@/views/external/SocialCallbackView.vue'),
    meta: {
      titleKey: 'titles.signIn',
      requiresAuth: false
    }
  },
  {
    path: '',
    name: 'home',
    component: HomeView,
    meta: {
      titleKey: 'titles.home'
    }
  },
  {
    path: '/sign-up',
    name: 'sign-up',
    component: SignUpView,
    meta: {
      titleKey: 'titles.signUp'
    }
  },
  {
    path: '/event/:id/invite',
    name: 'invite-accept',
    component: () => import('@/views/external/InviteAcceptView.vue'),
    meta: {
      titleKey: 'titles.invite',
      requiresAuth: false
    }
  },
  {
    path: '/confirm-email',
    name: 'confirm-email',
    component: ConfirmEmailView,
    meta: {
      titleKey: 'titles.confirmEmail'
    }
  },
  {
    path: '/sign-in',
    name: 'sign-in',
    component: SignInView,
    meta: {
      titleKey: 'titles.signIn'
    }
  },
  {
    path: '/terms',
    name: 'terms',
    component: TermsView,
    meta: {
      titleKey: 'titles.terms'
    }
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: PrivacyView,
    meta: {
      titleKey: 'titles.privacy'
    }
  },
  {
    path: '/cookies',
    name: 'cookies',
    component: CookiesView,
    meta: {
      titleKey: 'titles.cookies'
    }
  },
  {
    path: '/help',
    name: 'help',
    component: HelpView,
    meta: {
      titleKey: 'titles.help'
    }
  }
]

export { nonAuthRoutes }
