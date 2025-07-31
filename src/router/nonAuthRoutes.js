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
    path: '',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Home'
    }
  },
  {
    path: '/sign-up',
    name: 'sign-up',
    component: SignUpView,
    meta: {
      title: 'Sign up'
    }
  },
  {
    path: '/event/:id/invite',
    name: 'invite-accept',
    component: () => import('@/views/external/InviteAcceptView.vue'),
    meta: {
      title: 'Accept Invite',
      requiresAuth: false
    }
  },
  {
    path: '/confirm-email',
    name: 'confirm-email',
    component: ConfirmEmailView,
    meta: {
      title: 'Confirm Email'
    }
  },
  {
    path: '/sign-in',
    name: 'sign-in',
    component: SignInView,
    meta: {
      title: 'Sign up'
    }
  },
  {
    path: '/terms',
    name: 'terms',
    component: TermsView,
    meta: {
      title: 'Terms of Service'
    }
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: PrivacyView,
    meta: {
      title: 'Privacy Policy'
    }
  },
  {
    path: '/cookies',
    name: 'cookies',
    component: CookiesView,
    meta: {
      title: 'Cookie Policy'
    }
  },
  {
    path: '/help',
    name: 'help',
    component: HelpView,
    meta: {
      title: 'Help Center'
    }
  }
]

export { nonAuthRoutes }
