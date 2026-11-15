import { describe, it, expect, vi, beforeEach } from 'vitest'

const router = { push: vi.fn(), currentRoute: { value: { name: 'sign-in', fullPath: '/sign-in?redirect=/sign-in?redirect=/dashboard' } } }
const logOut = vi.fn()

vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => ({ token: '', logOut }) }))
vi.mock('@/modules/impersonation/stores/useImpersonationStore', () => ({ useImpersonationStore: () => ({ active: false, finish: vi.fn() }) }))
vi.mock('@/router', () => ({ default: router }))
vi.mock('@/ui', () => ({ useToast: () => ({ toast: vi.fn() }) }))

const { onError } = await import('../axios')

describe('axios error handling for signed links', () => {
  beforeEach(() => {
    router.push.mockReset().mockResolvedValue()
    logOut.mockReset().mockResolvedValue()
    router.currentRoute.value = { name: 'sign-in', fullPath: '/sign-in?redirect=/sign-in?redirect=/dashboard' }
  })

  it('leaves a 403 invalid_signed_link to the screen: no redirect', async () => {
    const error = { config: { url: 'check-password-link' }, response: { status: 403, data: { message: 'Invalid signature.', code: 'invalid_signed_link' } } }
    await expect(onError(error)).rejects.toBe(error)
    expect(router.push).not.toHaveBeenCalled()
  })

  it('still sends a plain 403 to the forbidden page', async () => {
    await expect(onError({ config: { url: 'x' }, response: { status: 403, data: {} } })).rejects.toBeTruthy()
    expect(router.push).toHaveBeenCalledWith('/403')
  })

  it('on 401 comes back to sign-in without nesting the redirect', async () => {
    await expect(onError({ config: { url: 'x' }, response: { status: 401, data: {} } })).rejects.toBeTruthy()
    expect(router.push).toHaveBeenCalledWith({ name: 'sign-in', query: { redirect: '/dashboard' } })
  })

  it('on 401 from sign-in itself sets no redirect', async () => {
    router.currentRoute.value = { name: 'sign-in', fullPath: '/sign-in' }
    await expect(onError({ config: { url: 'x' }, response: { status: 401, data: {} } })).rejects.toBeTruthy()
    expect(router.push).toHaveBeenCalledWith({ name: 'sign-in', query: {} })
  })
})
