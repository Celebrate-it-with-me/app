import { describe, it, expect, vi, beforeEach } from 'vitest'

const logOut = vi.fn()
const push = vi.fn()
vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => ({ token: '', logOut }) }))
vi.mock('@/router', () => ({ default: { push, currentRoute: { value: { fullPath: '/sign-in' } } } }))
vi.mock('@/modules/impersonation/stores/useImpersonationStore', () => ({ useImpersonationStore: () => ({ active: false }) }))

const { onError } = await import('../axios')

const unauthorized = config => ({ config, response: { status: 401, data: { message: 'Unauthenticated.' }, headers: {} } })

describe('401 handling', () => {
  beforeEach(() => {
    logOut.mockReset()
    push.mockReset()
  })

  it('closes the local session and goes to sign-in on a regular 401', async () => {
    await expect(onError(unauthorized({ url: '/user' }))).rejects.toBeTruthy()
    expect(logOut).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('leaves the session alone when the request expects a 401 and retries (/auth/ready after login)', async () => {
    await expect(onError(unauthorized({ url: '/auth/ready', skipUnauthorizedHandler: true }))).rejects.toBeTruthy()
    expect(logOut).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })
})
