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
})
