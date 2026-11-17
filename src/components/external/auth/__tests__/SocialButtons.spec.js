import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import SocialButtons from '../SocialButtons.vue'

let wrapper
async function open(url = '/sign-in') {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/sign-in', component: SocialButtons }] })
  await router.push(url)
  await router.isReady()
  wrapper = mount(SocialButtons, { global: { plugins: [i18n, router] } })
}

beforeEach(() => {
  setLocale('es')
  vi.stubEnv('VITE_API_URL', 'http://api/')
  vi.stubGlobal('location', { href: '' })
})
afterEach(() => {
  wrapper?.unmount()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('SocialButtons', () => {
  it('shows Google and Facebook by default', async () => {
    await open()
    expect(wrapper.findAll('button').map(b => b.text())).toEqual(['Google', 'Facebook'])
  })
  it('shows only the providers in VITE_SOCIAL_PROVIDERS', async () => {
    vi.stubEnv('VITE_SOCIAL_PROVIDERS', 'google')
    await open()
    expect(wrapper.findAll('button').map(b => b.text())).toEqual(['Google'])
  })
  it('renders nothing when no known provider is enabled', async () => {
    vi.stubEnv('VITE_SOCIAL_PROVIDERS', 'twitter')
    await open()
    expect(wrapper.find('button').exists()).toBe(false)
  })
  it('sends an internal redirect to the API', async () => {
    await open('/sign-in?redirect=/events/9')
    await wrapper.find('[data-provider="facebook"]').trigger('click')
    expect(window.location.href).toBe('http://api/oauth/facebook/redirect?redirect=%2Fevents%2F9')
  })
  it('drops an external redirect', async () => {
    await open('/sign-in?redirect=//evil.com')
    await wrapper.find('[data-provider="google"]').trigger('click')
    expect(window.location.href).toBe('http://api/oauth/google/redirect')
  })
  it('disables the buttons when asked', async () => {
    await open()
    await wrapper.setProps({ disabled: true })
    expect(wrapper.findAll('button').every(b => b.attributes('disabled') !== undefined)).toBe(true)
  })
})
