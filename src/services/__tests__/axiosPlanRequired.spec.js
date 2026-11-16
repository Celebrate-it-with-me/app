import { describe, it, expect, vi, beforeEach } from 'vitest'

const router = { push: vi.fn(), currentRoute: { value: { name: 'sign-in', fullPath: '/sign-in?redirect=/sign-in?redirect=/dashboard' } } }
const logOut = vi.fn()

vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => ({ token: '', logOut }) }))
vi.mock('@/modules/impersonation/stores/useImpersonationStore', () => ({ useImpersonationStore: () => ({ active: false, finish: vi.fn() }) }))
vi.mock('@/router', () => ({ default: router }))
vi.mock('@/ui', () => ({ useToast: () => ({ toast: vi.fn() }) }))

const { onError } = await import('../axios')

describe('axios error handling for plan_required (invitation editor)', () => {
  beforeEach(() => {
    router.push.mockReset().mockResolvedValue()
    logOut.mockReset().mockResolvedValue()
    router.currentRoute.value = { name: 'sign-in', fullPath: '/sign-in?redirect=/sign-in?redirect=/dashboard' }
  })

  it('leaves a 403 plan_required / template_not_available to the editor: no forbidden page', async () => {
    for (const code of ['plan_required', 'template_not_available']) {
      const error = { config: { url: 'event/1/invitation' }, response: { status: 403, data: { message: 'x', code } } }
      await expect(onError(error)).rejects.toBe(error)
    }
    expect(router.push).not.toHaveBeenCalled()
  })
})
