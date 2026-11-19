import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'

const m = vi.hoisted(() => ({ login: vi.fn(), getPreferences: vi.fn(), get: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: { get: m.get, post: vi.fn() } }))
vi.mock('@/components/external/auth/useCaptcha', () => ({
  useCaptcha: () => ({ isReady: () => true, token: { value: 'tok' }, reset: vi.fn() })
}))
vi.mock('@/components/external/auth/SocialButtons.vue', () => ({ default: { template: '<div />' } }))

import SignInView from '../SignInView.vue'
import { useUserStore } from '@/stores/useUserStore'

async function submit(userPayload) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  const store = useUserStore()
  store.login = m.login.mockResolvedValue({ status: 200, data: { user: userPayload } })
  store.getPreferences = m.getPreferences.mockResolvedValue({ status: 500 })
  const page = { template: '<div />' }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/sign-in', name: 'sign-in', component: SignInView },
      { path: '/dashboard', component: page },
      { path: '/forgot-password', component: page },
      { path: '/sign-up', component: page }
    ]
  })
  await router.push('/sign-in')
  await router.isReady()
  const wrapper = mount(SignInView, { global: { plugins: [i18n, router, pinia] } })
  await wrapper.find('input[type=email]').setValue('a@b.co')
  await wrapper.find('input[type=password]').setValue('password1')
  await wrapper.find('form').trigger('submit')
  await vi.waitFor(() => expect(m.login).toHaveBeenCalled())
  await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/dashboard'))
  await flushPromises()
  return { store, router }
}

beforeEach(() => {
  setLocale('es')
  localStorage.clear()
  m.login.mockReset()
  m.getPreferences.mockReset()
})

describe('SignInView active event', () => {
  it('never stores an object as the active event id', async () => {
    const { store, router } = await submit({ id: 1, name: 'Ana', email: 'a@b.co', activeEvent: { id: 7 }, active_event: { id: 7 } })
    expect(store.activeEvent).toBeNull()
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('keeps the id the login payload carries', async () => {
    const { store } = await submit({ id: 1, name: 'Ana', email: 'a@b.co', last_active_event_id: 7 })
    expect(store.activeEvent).toBe(7)
  })
})
