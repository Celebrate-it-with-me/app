import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const calls = []
const api = {
  get: vi.fn(async url => {
    calls.push(`GET ${url}`)
    if (url.startsWith('user/hydrate')) return { status: 200, data: { events: [], activeEvent: null, userPermissions: [], menus: [], menuGuests: [], comments: [], eventTypes: [], eventPlans: [] } }
    return { status: 200, data: {} }
  }),
  post: vi.fn(async url => {
    calls.push(`POST ${url}`)
    return { status: 200, data: { user: { id: 7, name: 'A', email: 'a@b.co' } } }
  })
}
vi.mock('@/services/axios', () => ({ CWM_API: api }))

const { useUserStore } = await import('@/stores/useUserStore')
const { useHydrationStore } = await import('@/stores/useHydrationStore')
const { useAuthStore } = await import('@/stores/useAuthStore')
const { authGuard } = await import('../authGuard')

const login = async userStore => {
  await userStore.login({ email: 'a@b.co', password: 'password', remember: false, device: 'x', hcaptcha_token: 't' })
  userStore.initUserData({ name: 'A', email: 'a@b.co', userId: 7, lastLogin: null, activeEvent: null, justLogin: true })
}

describe('login after sign out', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    calls.length = 0
    const pinia = createPinia().use(piniaPluginPersistedstate)
    createApp({}).use(pinia)
    setActivePinia(pinia)
  })

  it('hydrates and enters the dashboard again after a sign out', async () => {
    const userStore = useUserStore()
    const hydration = useHydrationStore()
    const auth = useAuthStore()
    const dashboard = { meta: { requiresAuth: true }, fullPath: '/dashboard' }

    await login(userStore)
    expect(await authGuard(dashboard)).toBeUndefined()
    expect(hydration.isHydrated).toBe(true)
    expect(auth.isReady).toBe(true)
    await Promise.resolve()
    expect(JSON.parse(sessionStorage.getItem('auth-ready')).isReady).toBe(true)

    await userStore.signOut()
    expect(userStore.isAuthenticated).toBe(false)
    expect(hydration.isHydrated).toBe(false)
    expect(auth.isReady).toBe(false)
    await Promise.resolve()
    expect(JSON.parse(sessionStorage.getItem('auth-ready')).isReady).toBe(false)

    calls.length = 0
    await login(userStore)
    expect(await authGuard(dashboard)).toBeUndefined()
    expect(calls).toContain('GET /auth/ready')
  })
})
