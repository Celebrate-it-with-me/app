import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import es from '@/locales/es'
import en from '@/locales/en'

const push = vi.fn()
const collaborators = { acceptInvitation: vi.fn(), acceptError: null }
const hydration = { hydrateAll: vi.fn() }
vi.mock('vue-router', () => ({ useRoute: () => ({ params: { id: '7' } }), useRouter: () => ({ push }) }))
vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => ({ email: 'a@b.co' }) }))
vi.mock('@/stores/useCollaboratorsStore', () => ({ useCollaboratorsStore: () => collaborators }))
vi.mock('@/stores/useHydrationStore', () => ({ useHydrationStore: () => hydration }))
const { default: View } = await import('../InvitationProcessorView.vue')
const { resetAcceptOnce } = await import('../acceptOnce')

const mountView = (locale = 'es') => mount(View, {
  global: { plugins: [createI18n({ legacy: false, locale, messages: { es, en } })] }
})
const invite = { id: 2, token: 't', email: 'a@b.co', status: 'pending', event: { id: 7, event_name: 'Los XV de Valentina' } }

describe('InvitationProcessorView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    push.mockReset()
    resetAcceptOnce()
    collaborators.acceptInvitation.mockReset().mockResolvedValue(true)
    collaborators.acceptError = null
    hydration.hydrateAll.mockReset().mockResolvedValue()
    localStorage.setItem('pending_invitations', JSON.stringify([invite]))
  })

  it('accepts once, welcomes her in her language and goes to the events', async () => {
    const w = mountView()
    await flushPromises()
    expect(collaborators.acceptInvitation).toHaveBeenCalledTimes(1)
    expect(hydration.hydrateAll).toHaveBeenCalled()
    expect(w.text()).toContain('Listo: ya formas parte de "Los XV de Valentina"')
    expect(w.text()).not.toContain('There was an error')
    vi.advanceTimersByTime(2000)
    expect(push).toHaveBeenCalledWith('/dashboard/events')
  })

  it('speaks english', async () => {
    const w = mountView('en')
    await flushPromises()
    expect(w.text()).toContain('Welcome! You are now part of')
  })

  it('does not send a second POST if the view mounts twice', async () => {
    mountView()
    mountView()
    await flushPromises()
    expect(collaborators.acceptInvitation).toHaveBeenCalledTimes(1)
  })

  it('shows a translated error when the API refuses', async () => {
    collaborators.acceptInvitation.mockResolvedValue(false)
    const w = mountView()
    await flushPromises()
    expect(w.text()).toContain(es.invite.processError)
    expect(push).not.toHaveBeenCalled()
  })

  it('says so when no invitation matches', async () => {
    localStorage.setItem('pending_invitations', '[]')
    const w = mountView()
    await flushPromises()
    expect(w.text()).toContain(es.invite.noneValid)
    expect(collaborators.acceptInvitation).not.toHaveBeenCalled()
  })

  it('hands the invitation (with its link token) to the store', async () => {
    mountView()
    await flushPromises()
    expect(collaborators.acceptInvitation).toHaveBeenCalledWith(expect.objectContaining({ id: 2, token: 't' }))
  })

  it('explains the unverified email, not the generic error, and retries after verifying', async () => {
    collaborators.acceptInvitation.mockImplementation(async () => {
      collaborators.acceptError = 'email_not_verified'
      return false
    })
    const w = mountView()
    await flushPromises()
    expect(w.text()).toContain(es.invite.verifyEmail)
    expect(w.text()).not.toContain(es.invite.processError)
    expect(push).not.toHaveBeenCalled()

    collaborators.acceptInvitation.mockImplementation(async () => {
      collaborators.acceptError = null
      return true
    })
    await w.find('button').trigger('click')
    await flushPromises()
    expect(collaborators.acceptInvitation).toHaveBeenCalledTimes(2)
    expect(w.text()).toContain('Listo: ya formas parte')
    expect(w.text()).not.toContain(es.invite.verifyEmail)
  })

  it('shows the verify message in english', async () => {
    collaborators.acceptInvitation.mockImplementation(async () => {
      collaborators.acceptError = 'email_not_verified'
      return false
    })
    const w = mountView('en')
    await flushPromises()
    expect(w.text()).toContain(en.invite.verifyEmail)
  })

  it('keeps the generic error for a 404 and when the store throws', async () => {
    collaborators.acceptInvitation.mockImplementation(async () => {
      collaborators.acceptError = 'not_found'
      return false
    })
    let w = mountView()
    await flushPromises()
    expect(w.text()).toContain(es.invite.processError)
    expect(w.text()).not.toContain(es.invite.verifyEmail)
    resetAcceptOnce()
    collaborators.acceptInvitation.mockRejectedValue(new Error('boom'))
    w = mountView()
    await flushPromises()
    expect(w.text()).toContain(es.invite.processError)
  })
})
