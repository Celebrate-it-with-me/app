import { describe, it, expect, vi, beforeEach } from 'vitest'

const toast = vi.fn()
const router = { push: vi.fn(), currentRoute: { value: { name: 'dashboard', fullPath: '/dashboard' } } }

vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => ({ token: '', logOut: vi.fn() }) }))
vi.mock('@/stores/useNotificationStore', () => ({ useNotificationStore: () => ({}) }))
vi.mock('@/router', () => ({ default: router }))
vi.mock('@/ui', () => ({ useToast: () => ({ toast }) }))

const { onError } = await import('../axios')
const { default: i18n } = await import('@/locales/i18n')

const locked = (url, module = 'menus') => ({ config: { url }, response: { status: 403, data: { code: 'module_locked', module } } })

describe('axios error handling for locked modules', () => {
  beforeEach(() => {
    toast.mockReset()
    router.push.mockReset().mockResolvedValue()
    i18n.global.locale.value = 'es'
  })

  it('shows the premium notice to the organizer and does not open the 403 page', async () => {
    const error = locked('event/5/menus')
    await expect(onError(error)).rejects.toBe(error)
    expect(toast).toHaveBeenCalledTimes(1)
    expect(toast.mock.calls[0][0]).toMatchObject({ tone: 'warning', title: 'Pasa a premium' })
    expect(toast.mock.calls[0][0].description).toContain('Menús')
    expect(router.push).not.toHaveBeenCalled()
  })

  it('uses the english text and a generic sentence for an unknown module', async () => {
    i18n.global.locale.value = 'en'
    await expect(onError(locked('event/5/x', 'mystery'))).rejects.toBeTruthy()
    expect(toast.mock.calls[0][0]).toMatchObject({ title: 'Go premium', description: 'This feature is part of the full event. Go premium to unlock it.' })
  })

  it('stays silent for guests on the public invitation and legacy template routes, without the 403 page', async () => {
    for (const url of ['template/event/14/comments', 'invitation/xv/VAL001/rsvp']) {
      await expect(onError(locked(url, 'comments'))).rejects.toBeTruthy()
    }
    expect(toast).not.toHaveBeenCalled()
    expect(router.push).not.toHaveBeenCalled()
  })

  it('keeps sending any other 403 to /403', async () => {
    await expect(onError({ config: { url: 'event/5' }, response: { status: 403, data: { code: 'other' } } })).rejects.toBeTruthy()
    expect(router.push).toHaveBeenCalledWith('/403')
    expect(toast).not.toHaveBeenCalled()
  })
})
