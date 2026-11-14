import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { canManage, isFreePlan, normalizeCollaborator, rowActions, sortCollaborators, emailError } from '../utils/collaborators'

const api = vi.hoisted(() => ({
  loadCollaborators: vi.fn(),
  inviteCollaborator: vi.fn(),
  removeCollaborator: vi.fn(),
  changeRole: vi.fn(),
  resendInvite: vi.fn(),
  cancelInvite: vi.fn()
}))
vi.mock('@/services/CollaboratorsService', () => ({ default: api }))

import CollaboratorsView from '../views/CollaboratorsView.vue'

const LIST = [
  { id: 3, type: 'invite', email: 'pending@x.com', role: 'viewer', status: 'pending' },
  { id: 2, type: 'member', user_id: 22, name: 'Lucía Planner', email: 'lucia@x.com', role: 'editor', avatar_url: '' },
  { id: 1, type: 'member', user_id: 11, name: 'Marisol', email: 'marisol@x.com', role: 'owner' }
]

describe('collaborator helpers', () => {
  it('normalizes both key styles and falls back safely', () => {
    expect(normalizeCollaborator({ id: 2, user_id: 22, name: 'L', email: 'l@x.com', role: 'editor', avatar_url: 'a' })).toMatchObject({
      key: 'member-2', userId: 22, avatarUrl: 'a', role: 'editor', status: 'active'
    })
    expect(normalizeCollaborator({ id: 3, type: 'invite', email: 'p@x.com', role: 'god' })).toMatchObject({ key: 'invite-3', name: 'p@x.com', role: 'viewer', status: 'pending' })
  })

  it('sorts owner, members, then invitations', () => {
    expect(sortCollaborators(LIST.map(normalizeCollaborator)).map(r => r.key)).toEqual(['member-1', 'member-2', 'invite-3'])
  })

  it('gives the owner no actions and each row the right ones', () => {
    expect(rowActions({ role: 'owner', type: 'member' })).toEqual([])
    expect(rowActions({ role: 'editor', type: 'member' })).toEqual(['makeViewer', 'remove'])
    expect(rowActions({ role: 'viewer', type: 'member' })).toEqual(['makeEditor', 'remove'])
    expect(rowActions({ role: 'viewer', type: 'invite' })).toEqual(['resend', 'cancel'])
  })

  it('lets the owner or a holder of the permission manage; nobody else', () => {
    expect(canManage({ userRole: 'owner' }, () => false)).toBe(true)
    expect(canManage({ userRole: 'editor' }, p => p === 'manage_collaborators')).toBe(true)
    expect(canManage({ userRole: 'editor' }, () => false)).toBe(false)
  })

  it('detects the free plan from locked modules only', () => {
    expect(isFreePlan({ modules: [{ state: 'locked' }] })).toBe(true)
    expect(isFreePlan({ modules: [{ state: 'active' }] })).toBe(false)
    expect(isFreePlan({})).toBe(false)
  })

  it('validates the email', () => {
    expect(emailError('')).toBe('required')
    expect(emailError('nope')).toBe('invalid')
    expect(emailError(' a@b.co ')).toBe('')
  })
})

describe('CollaboratorsView', () => {
  let wrapper
  const body = () => document.body

  async function setup({ userRole = 'owner', modules = [], permissions = [] } = {}) {
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    const events = useEventsStore()
    events.activeEvent = { id: 7, userRole, modules }
    events.eventPermissions = permissions.map(name => ({ name }))
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }, { path: '/dashboard/collaborators', name: 'collaborators', component: { template: '<div />' } }]
    })
    await router.push('/')
    wrapper = mount(CollaboratorsView, { global: { plugins: [i18n, pinia, router] }, attachTo: document.body })
    await flushPromises()
  }

  beforeEach(() => {
    setLocale('es')
    Object.values(api).forEach(fn => fn.mockReset())
    api.loadCollaborators.mockResolvedValue({ data: { data: LIST } })
  })
  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('lists the people with their role and the invitation status', async () => {
    await setup()
    expect(wrapper.text()).toContain('Marisol')
    expect(wrapper.text()).toContain('Dueña')
    expect(wrapper.text()).toContain('Editor')
    expect(wrapper.text()).toContain('pending@x.com')
    expect(wrapper.text()).toContain('Pendiente')
    expect(wrapper.findAll('li[data-testid^=collaborator-]').map(li => li.attributes('data-testid'))).toEqual([
      'collaborator-member-1', 'collaborator-member-2', 'collaborator-invite-3'
    ])
  })

  it('shows an actions menu on every row but the owner, only to managers', async () => {
    await setup()
    expect(wrapper.findAll('button[aria-label^="Acciones para"]')).toHaveLength(2)
    wrapper.unmount()
    await setup({ userRole: 'viewer' })
    expect(wrapper.findAll('button[aria-label^="Acciones para"]')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('Invitar')
  })

  it('tells the free plan that only the owner is in, without blocking the invite button', async () => {
    await setup({ modules: [{ key: 'menus', state: 'locked' }] })
    expect(wrapper.get('[data-testid=free-plan-note]').text()).toContain('En el plan gratis solo tiene acceso la dueña')
    expect(wrapper.text()).toContain('Invitar')
    wrapper.unmount()
    await setup({ modules: [{ key: 'menus', state: 'active' }] })
    expect(wrapper.find('[data-testid=free-plan-note]').exists()).toBe(false)
  })

  it('shows the empty state', async () => {
    api.loadCollaborators.mockResolvedValue({ data: { data: [] } })
    await setup()
    expect(wrapper.text()).toContain('Aún no hay colaboradores')
  })

  it('shows an error with a retry that reloads', async () => {
    api.loadCollaborators.mockRejectedValueOnce(new Error('boom'))
    await setup()
    expect(wrapper.text()).toContain('No pudimos cargar los colaboradores')
    const retry = wrapper.findAll('button').find(b => b.text() === 'Reintentar')
    await retry.trigger('click')
    await flushPromises()
    expect(api.loadCollaborators).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('Lucía Planner')
  })

  it('validates the email before inviting, then invites with the chosen role', async () => {
    api.inviteCollaborator.mockResolvedValue({ status: 200 })
    await setup()
    await wrapper.findAll('button').find(b => b.text().includes('Invitar')).trigger('click')
    await flushPromises()
    const form = body().querySelector('#invite-collaborator')
    form.dispatchEvent(new Event('submit', { cancelable: true }))
    await flushPromises()
    expect(body().textContent).toContain('Escribe un correo.')
    expect(api.inviteCollaborator).not.toHaveBeenCalled()

    const input = body().querySelector('input[type=email]')
    input.value = 'nueva@x.com'
    input.dispatchEvent(new Event('input'))
    await flushPromises()
    form.dispatchEvent(new Event('submit', { cancelable: true }))
    await flushPromises()
    expect(api.inviteCollaborator).toHaveBeenCalledWith({ eventId: 7, email: 'nueva@x.com', role: 'editor' })
  })

  it('asks for confirmation before removing access, and removes on confirm', async () => {
    api.removeCollaborator.mockResolvedValue({})
    await setup()
    const row = wrapper.get('[data-testid=collaborator-member-2]')
    await row.get('button').trigger('click')
    await flushPromises()
    const remove = [...body().querySelectorAll('[role=menuitem]')].find(i => i.textContent.includes('Quitar acceso'))
    remove.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    remove.dispatchEvent(new Event('pointerup', { bubbles: true }))
    await flushPromises()
    expect(api.removeCollaborator).not.toHaveBeenCalled()
    expect(body().textContent).toContain('¿Quitar el acceso de Lucía Planner?')
    body().querySelector('[data-testid=confirm-action]').click()
    await flushPromises()
    expect(api.removeCollaborator).toHaveBeenCalledWith({ eventId: 7, userId: 22 })
  })
})
