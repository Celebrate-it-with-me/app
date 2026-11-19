import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'

const mocks = vi.hoisted(() => ({ refreshUser: vi.fn(), getPreferences: vi.fn(), get: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: { get: mocks.get } }))
vi.mock('@/stores/useUserStore', () => ({
  useUserStore: () => ({ refreshUser: mocks.refreshUser, getPreferences: mocks.getPreferences, setPreferences: vi.fn() })
}))
import SocialCallbackView from '../SocialCallbackView.vue'

let wrapper
let router
async function open(query) {
  setActivePinia(createPinia())
  const page = { template: '<div />' }
  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/auth/social/callback', component: SocialCallbackView },
      { path: '/sign-in', name: 'sign-in', component: page },
      { path: '/dashboard', name: 'dashboard', component: page },
      { path: '/forgot-password', component: page },
      { path: '/events/:id', component: page },
      { path: '/account-suspended', name: 'account-suspended', component: page }
    ]
  })
  await router.push(`/auth/social/callback?${query}`)
  await router.isReady()
  wrapper = mount(SocialCallbackView, { global: { plugins: [i18n, router] } })
  await flushPromises()
}

beforeEach(() => {
  setLocale('es')
  mocks.get.mockReset().mockResolvedValue({})
  mocks.refreshUser.mockReset().mockResolvedValue({ status: 200 })
  mocks.getPreferences.mockReset().mockResolvedValue({ status: 200, data: { data: {} } })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  wrapper?.unmount()
  vi.restoreAllMocks()
})

describe('SocialCallbackView', () => {
  it('goes to the dashboard on success', async () => {
    await open('status=ok&provider=google')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })
  it('goes to an internal redirect on success', async () => {
    await open('status=ok&provider=facebook&redirect=/events/4')
    expect(router.currentRoute.value.path).toBe('/events/4')
  })
  it.each(['//evil.com', 'https://evil.com', '/\\evil.com'])('ignores the external redirect %s', async value => {
    await open(`status=ok&provider=google&redirect=${encodeURIComponent(value)}`)
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })
  it('sends a suspended account to its screen', async () => {
    await open('status=error&reason=account_suspended&provider=google')
    expect(router.currentRoute.value.name).toBe('account-suspended')
  })
  it('explains a cancellation neutrally, without an alert', async () => {
    await open('status=error&reason=access_denied&provider=facebook')
    expect(wrapper.text()).toContain('Cancelaste el inicio de sesión')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Volver a iniciar sesión')
  })
  it('asks the user to sign in with her password on account_exists, with the provider capitalized', async () => {
    await open('status=error&reason=account_exists&provider=facebook')
    expect(wrapper.find('[role="alert"]').text()).toContain('Facebook')
    expect(wrapper.text()).toContain('inicia sesión con tu contraseña')
    expect(wrapper.find('a[href="/forgot-password"]').exists()).toBe(true)
  })
  it('explains email_required', async () => {
    await open('status=error&reason=email_required&provider=facebook')
    expect(wrapper.text()).toContain('Necesitamos tu correo')
  })
  it('falls back to the generic message for an unknown reason', async () => {
    await open('status=error&reason=weird&provider=google')
    expect(wrapper.text()).toContain('No pudimos entrar con Google')
  })
  it('shows the generic error when status is missing', async () => {
    await open('provider=google')
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })
  it('keeps an internal redirect in the way back to sign-in and drops an external one', async () => {
    await open('status=error&reason=oauth_failed&provider=google&redirect=/events/4')
    expect(wrapper.find('a[href="/sign-in?redirect=/events/4"]').exists()).toBe(true)
    wrapper.unmount()
    await open('status=error&reason=oauth_failed&provider=google&redirect=//evil.com')
    expect(wrapper.find('a[href="/sign-in"]').exists()).toBe(true)
  })
  it('shows an error when the session cannot be opened', async () => {
    mocks.refreshUser.mockRejectedValue(new Error('401'))
    await open('status=ok&provider=google')
    expect(wrapper.text()).toContain('No pudimos iniciar la sesión')
  })
  it('shows a friendly rate-limit screen with the wait hint and the way back (reason from the API)', async () => {
    await open('status=error&reason=rate_limited&provider=google')
    expect(wrapper.text()).toContain('Demasiados intentos')
    expect(wrapper.text()).toContain('Espera un momento')
    expect(wrapper.text()).toContain('Google')
    expect(wrapper.find('a[href="/sign-in"]').text()).toContain('Volver a iniciar sesión')
  })
  it('shows the same screen when opening the session answers 429', async () => {
    mocks.refreshUser.mockRejectedValue({ response: { status: 429 } })
    await open('status=ok&provider=facebook&redirect=/events/4')
    expect(wrapper.text()).toContain('Demasiados intentos')
    expect(wrapper.text()).toContain('Facebook')
    expect(wrapper.find('a[href="/sign-in?redirect=/events/4"]').exists()).toBe(true)
  })
  it('speaks English on the rate-limit screen', async () => {
    setLocale('en')
    await open('status=error&reason=rate_limited&provider=google')
    expect(wrapper.text()).toContain('Too many attempts')
    expect(wrapper.text()).toContain('Wait a moment')
    expect(wrapper.text()).toContain('Back to sign in')
  })
  it('speaks English', async () => {
    setLocale('en')
    await open('status=error&reason=access_denied&provider=google')
    expect(wrapper.text()).toContain('You cancelled the sign-in')
    expect(wrapper.text()).toContain('Back to sign in')
  })
})
