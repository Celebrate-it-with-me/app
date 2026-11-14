import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const logOut = vi.fn()
vi.mock('@/services/UserService', () => ({ default: { logOut: (...a) => logOut(...a) } }))
const { useUserStore } = await import('../useUserStore')

describe('user store signOut', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    logOut.mockReset()
  })

  it('calls the server logout and clears local state', async () => {
    logOut.mockResolvedValue({ status: 200 })
    const store = useUserStore()
    store.initUserData({ name: 'A', email: 'a@b.co', userId: 1, lastLogin: null, activeEvent: null, justLogin: false })
    await store.signOut()
    expect(logOut).toHaveBeenCalledTimes(1)
    expect(store.isAuthenticated).toBeFalsy()
  })

  it('clears local state even when the server call fails', async () => {
    logOut.mockRejectedValue(new Error('401'))
    const store = useUserStore()
    store.initUserData({ name: 'A', email: 'a@b.co', userId: 1, lastLogin: null, activeEvent: null, justLogin: false })
    await expect(store.signOut()).resolves.toBeUndefined()
    expect(store.isAuthenticated).toBeFalsy()
  })
})
