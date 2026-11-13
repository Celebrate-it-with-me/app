import { describe, it, expect, vi, beforeEach } from 'vitest'

const userStore = { token: '', logOut: vi.fn() }
const router = { push: vi.fn(), currentRoute: { value: { name: 'dashboard', fullPath: '/dashboard' } } }

vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => userStore }))
vi.mock('@/stores/useNotificationStore', () => ({ useNotificationStore: () => ({}) }))
vi.mock('@/router', () => ({ default: router }))

const { onError } = await import('../axios')
const { suspendedState } = await import('@/utils/accountSuspended')

describe('axios error handling for suspended accounts', () => {
  beforeEach(() => {
    userStore.logOut.mockReset().mockResolvedValue()
    router.push.mockReset().mockResolvedValue()
    router.currentRoute.value = { name: 'dashboard', fullPath: '/dashboard' }
    suspendedState.supportEmail = ''
  })

  it('closes the local session and opens the suspended screen on account_suspended', async () => {
    const error = { response: { status: 403, data: { code: 'account_suspended', supportEmail: 'ayuda@quinvite.com' } } }
    await expect(onError(error)).rejects.toBe(error)
    expect(userStore.logOut).toHaveBeenCalledTimes(1)
    expect(router.push).toHaveBeenCalledWith({ name: 'account-suspended' })
    expect(router.push).not.toHaveBeenCalledWith('/403')
    expect(suspendedState.supportEmail).toBe('ayuda@quinvite.com')
  })

  it('does not navigate again when already on the suspended screen', async () => {
    router.currentRoute.value = { name: 'account-suspended', fullPath: '/account-suspended' }
    await expect(onError({ response: { status: 403, data: { code: 'account_suspended' } } })).rejects.toBeTruthy()
    expect(router.push).not.toHaveBeenCalled()
  })

  it('keeps sending any other 403 to /403 without closing the session', async () => {
    await expect(onError({ response: { status: 403, data: { message: 'Forbidden' } } })).rejects.toBeTruthy()
    expect(router.push).toHaveBeenCalledWith('/403')
    expect(userStore.logOut).not.toHaveBeenCalled()
  })
})
