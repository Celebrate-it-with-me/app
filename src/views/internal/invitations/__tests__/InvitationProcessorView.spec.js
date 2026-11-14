import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import es from '@/locales/es'
import en from '@/locales/en'

const push = vi.fn()
const collaborators = { acceptInvitation: vi.fn() }
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
})
