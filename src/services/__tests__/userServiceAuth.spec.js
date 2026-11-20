import { describe, it, expect, vi, beforeEach } from 'vitest'

const api = { get: vi.fn(), post: vi.fn() }
vi.mock('../axios', () => ({ CWM_API: api }))
const { default: UserService } = await import('../UserService')

describe('UserService reset password', () => {
  beforeEach(() => {
    api.get.mockReset().mockResolvedValue({})
    api.post.mockReset().mockResolvedValue({ status: 200 })
  })

  it('sends the reset token with the new password', async () => {
    await UserService.changePassword({ email: 'a@b.co', token: 'tok', password: 'Secret123', passwordConfirmation: 'Secret123' })
    expect(api.post).toHaveBeenCalledWith('reset-password', {
      email: 'a@b.co', token: 'tok', password: 'Secret123', password_confirmation: 'Secret123'
    })
  })

  it('posts to the server logout', async () => {
    await UserService.logOut()
    expect(api.post).toHaveBeenCalledWith('logout')
  })
  it('checks a trusted reset link with the entire url and the csrf cookie', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.quinvite.com/')
    const link = 'https://api.quinvite.com/api/v1/app/check-password-link?user=1&token=t&signature=s'
    await UserService.checkResetLink(link)
    expect(api.get).toHaveBeenCalledTimes(1)
    expect(api.post).toHaveBeenCalledWith(link)
  })

  it('does not touch the network for a link pointing at another host', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.quinvite.com/')
    const res = await UserService.checkResetLink('https://evil.com/api/v1/app/check-password-link?token=t')
    expect(res.status).toBe(400)
    expect(api.get).not.toHaveBeenCalled()
    expect(api.post).not.toHaveBeenCalled()
  })
})
