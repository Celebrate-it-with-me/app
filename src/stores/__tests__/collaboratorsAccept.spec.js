import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const post = vi.hoisted(() => vi.fn())
vi.mock('@/services/axios', () => ({ CWM_API: { post } }))

const { default: CollaboratorsService } = await import('@/services/CollaboratorsService')
const { useCollaboratorsStore } = await import('../useCollaboratorsStore')

const invite = { id: 2, token: 'tok', email: 'a@b.co', event: { id: 7 } }
const refusal = (status, data = {}) => Object.assign(new Error('x'), { response: { status, data } })

describe('accept invitation', () => {
  beforeEach(() => {
    post.mockReset()
    localStorage.clear()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('service', () => {
    it('sends the link token in the body', async () => {
      post.mockResolvedValue({ status: 200 })
      await CollaboratorsService.acceptInvitation({ id: 2, eventId: 7, token: 'tok' })
      expect(post).toHaveBeenCalledWith('event/7/collaborators/invite/2/accept', { token: 'tok' })
    })

    it('keeps the empty body when there is no token', async () => {
      post.mockResolvedValue({ status: 200 })
      await CollaboratorsService.acceptInvitation({ id: 2, eventId: 7 })
      expect(post).toHaveBeenCalledWith('event/7/collaborators/invite/2/accept', undefined)
    })
  })

  describe('store', () => {
    beforeEach(() => setActivePinia(createPinia()))

    it('accepts, forwards the token and clears the pending invitation', async () => {
      localStorage.setItem('pending_invitations', JSON.stringify([{ token: 'tok' }, { token: 'other' }]))
      post.mockResolvedValue({ status: 200, data: {} })
      const store = useCollaboratorsStore()
      expect(await store.acceptInvitation(invite)).toBe(true)
      expect(post.mock.calls[0][1]).toEqual({ token: 'tok' })
      expect(JSON.parse(localStorage.getItem('pending_invitations'))).toEqual([{ token: 'other' }])
      expect(store.acceptError).toBeNull()
    })

    it('flags email_not_verified on the 403', async () => {
      post.mockRejectedValue(refusal(403, { code: 'email_not_verified' }))
      const store = useCollaboratorsStore()
      expect(await store.acceptInvitation(invite)).toBe(false)
      expect(store.acceptError).toBe('email_not_verified')
    })

    it('flags not_found on the 404', async () => {
      post.mockRejectedValue(refusal(404))
      const store = useCollaboratorsStore()
      expect(await store.acceptInvitation(invite)).toBe(false)
      expect(store.acceptError).toBe('not_found')
    })

    it('flags unknown on other failures and non-200 answers, and resets on success', async () => {
      const store = useCollaboratorsStore()
      post.mockRejectedValue(new Error('network'))
      expect(await store.acceptInvitation(invite)).toBe(false)
      expect(store.acceptError).toBe('unknown')
      post.mockResolvedValue({ status: 202, data: {} })
      expect(await store.acceptInvitation(invite)).toBe(false)
      expect(store.acceptError).toBe('unknown')
      post.mockResolvedValue({ status: 200, data: {} })
      expect(await store.acceptInvitation(invite)).toBe(true)
      expect(store.acceptError).toBeNull()
    })
  })
})
