import { describe, it, expect, vi, beforeEach } from 'vitest'

const api = vi.hoisted(() => ({ post: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: api }))

import UserService from '../UserService'

const sent = () => api.post.mock.calls[0][1]

beforeEach(() => {
  api.post.mockReset()
  api.post.mockResolvedValue({ status: 200 })
})

describe('UserService.updateProfile photo', () => {
  it('sends the new photo as `avatar`', async () => {
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' })
    await UserService.updateProfile({ name: 'Val', phone: '', avatar: file })
    expect(sent().get('avatar')).toBeInstanceOf(File)
    expect(sent().has('remove_avatar')).toBe(false)
  })
  it('asks to delete the photo with remove_avatar=1', async () => {
    await UserService.updateProfile({ name: 'Val', phone: '+13055550123', removeAvatar: true })
    expect(sent().get('remove_avatar')).toBe('1')
    expect(sent().has('avatar')).toBe(false)
  })
  it('sends neither when only name and phone change', async () => {
    await UserService.updateProfile({ name: 'Val', phone: '' })
    expect(sent().has('avatar')).toBe(false)
    expect(sent().has('remove_avatar')).toBe(false)
  })
})
