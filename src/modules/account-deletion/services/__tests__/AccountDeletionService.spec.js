import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const api = vi.hoisted(() => ({ get: vi.fn(), delete: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: api }))

import AccountDeletionService from '../AccountDeletionService'

describe('AccountDeletionService', () => {
  beforeEach(() => {
    api.get.mockReset()
    api.delete.mockReset()
    vi.stubEnv('VITE_ACCOUNT_DELETION_MOCK', '') // a local .env.local may turn the mock on
  })
  afterEach(() => vi.unstubAllEnvs())

  it('reads the preview from the contract path', async () => {
    api.get.mockResolvedValue({ data: { data: {} } })
    await AccountDeletionService.preview()
    expect(api.get).toHaveBeenCalledWith('account/deletion-preview')
  })

  it('sends DELETE account with snake_case body and the password only when given', async () => {
    api.delete.mockResolvedValue({})
    await AccountDeletionService.destroy({ email: 'a@b.c', currentPassword: 'secret' })
    expect(api.delete).toHaveBeenLastCalledWith('account', { data: { email: 'a@b.c', current_password: 'secret' } })
    await AccountDeletionService.destroy({ email: 'a@b.c', currentPassword: '' })
    expect(api.delete).toHaveBeenLastCalledWith('account', { data: { email: 'a@b.c' } })
  })

  it('does not touch the network when the mock is on', async () => {
    vi.stubEnv('VITE_ACCOUNT_DELETION_MOCK', '1')
    const response = await AccountDeletionService.preview()
    expect(response.data.data.archiveDays).toBe(30)
    expect(api.get).not.toHaveBeenCalled()
  })
})
