import { describe, it, expect, vi, beforeEach } from 'vitest'

const userStore = { token: '', logOut: vi.fn() }
const impersonation = { active: false, token: 'tok', finish: vi.fn() }
const router = { push: vi.fn(), replace: vi.fn(), currentRoute: { value: { name: 'dashboard', fullPath: '/dashboard' } } }
const toast = vi.fn()

vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => userStore }))
vi.mock('@/stores/useNotificationStore', () => ({ useNotificationStore: () => ({}) }))
vi.mock('@/modules/impersonation/stores/useImpersonationStore', () => ({ useImpersonationStore: () => impersonation }))
vi.mock('@/ui', () => ({ useToast: () => ({ toast }) }))
vi.mock('@/router', () => ({ default: router }))

const { onError } = await import('../axios')

describe('axios during a support session', () => {
  beforeEach(() => {
    userStore.logOut.mockReset().mockResolvedValue()
    router.push.mockReset().mockResolvedValue()
    router.replace.mockReset().mockResolvedValue()
    impersonation.finish.mockReset()
    impersonation.active = true
    toast.mockReset()
    router.currentRoute.value = { name: 'dashboard', fullPath: '/dashboard' }
  })

  it('warns kindly on impersonation_blocked and keeps the session (no /403, no logout)', async () => {
    const error = { response: { status: 403, data: { code: 'impersonation_blocked' } } }
    await expect(onError(error)).rejects.toBe(error)
    expect(toast).toHaveBeenCalledTimes(1)
    expect(toast.mock.calls[0][0].title).toMatch(/support session|sesión de soporte/i)
    expect(router.push).not.toHaveBeenCalled()
    expect(userStore.logOut).not.toHaveBeenCalled()
    expect(impersonation.finish).not.toHaveBeenCalled()
  })

  it('ends the session and shows the ended screen on 401, without going to sign-in', async () => {
    const error = { response: { status: 401, data: { code: 'impersonation_ended' } } }
    await expect(onError(error)).rejects.toBe(error)
    expect(impersonation.finish).toHaveBeenCalledTimes(1)
    expect(router.replace).toHaveBeenCalledWith({ name: 'impersonation-ended' })
    expect(userStore.logOut).not.toHaveBeenCalled()
    expect(router.push).not.toHaveBeenCalled()
  })

  it('keeps the normal 401 behaviour when there is no support session', async () => {
    impersonation.active = false
    await expect(onError({ response: { status: 401, data: {} } })).rejects.toBeTruthy()
    expect(impersonation.finish).not.toHaveBeenCalled()
    expect(userStore.logOut).toHaveBeenCalledTimes(1)
    expect(router.push).toHaveBeenCalledWith({ name: 'sign-in', query: { redirect: '/dashboard' } })
  })
})
