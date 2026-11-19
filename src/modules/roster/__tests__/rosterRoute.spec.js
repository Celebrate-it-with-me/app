import { describe, it, expect, vi } from 'vitest'
import routes from '../routes/roster.route'

vi.mock('@/modules/roster/views/RosterView.vue', () => ({ default: { name: 'RosterViewStub' } }))

describe('roster routes', () => {
  const guests = routes.find(r => r.name === 'guests')

  it('serves the guest list only to signed-in users who may view guests', () => {
    expect(guests.path).toBe('/dashboard/guests')
    expect(guests.meta).toMatchObject({ requiresAuth: true, requiredPermission: ['view_guests'], module: 'guests' })
  })

  it('loads the view lazily', async () => {
    const view = await guests.component()
    expect(view.default.name).toBe('RosterViewStub')
  })

  it('keeps the old confirmations link alive as the pending tab', () => {
    const old = routes.find(r => r.name === 'rsvp')
    expect(old.path).toBe('/dashboard/rsvp')
    expect(old.redirect).toEqual({ name: 'guests', query: { status: 'pending' } })
  })
})
