import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useUserStore } from '@/stores/useUserStore'
import { canManage, isCollaboratorsLocked, normalizeCollaborator, rowActions, sortCollaborators, emailError } from '../utils/collaborators'

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
  { id: 3, type: 'invite', email: 'pending@x.com', role: 'viewer', status: 'pending', sent_at: new Date(Date.now() - 3 * 86_400_000).toISOString() },
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

  it('detects the locked collaborators module, and no other', () => {
    expect(isCollaboratorsLocked({ modules: [{ key: 'collaborators', state: 'locked' }] })).toBe(true)
    expect(isCollaboratorsLocked({ modules: [{ key: 'menus', state: 'locked' }] })).toBe(false)
    expect(isCollaboratorsLocked({ modules: [{ key: 'collaborators', state: 'active' }] })).toBe(false)
    expect(isCollaboratorsLocked({})).toBe(false)
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

  async function setup({ userRole = 'owner', modules = [], permissions = [], list = null } = {}) {
    if (list) api.loadCollaborators.mockResolvedValue({ data: { data: list } })
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useUserStore().userId = 11
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

  describe('clarity polish', () => {
    const DECLINED = { id: 4, type: 'invite', email: 'no@x.com', role: 'editor', status: 'declined', declined_at: new Date(Date.now() - 86_400_000).toISOString() }

    it('splits people with access from sent invitations, each with its count', async () => {
      await setup({ list: [...LIST, DECLINED] })
      const members = wrapper.get('[data-testid=members-section]')
      const invites = wrapper.get('[data-testid=invites-section]')
      expect(members.text()).toContain('Con acceso · 2')
      expect(invites.text()).toContain('Invitaciones enviadas · 2')
      expect(members.findAll('li')).toHaveLength(2)
      expect(invites.findAll('li')).toHaveLength(2)
    })

    it('hides the invitations section when there are none', async () => {
      await setup({ list: LIST.filter(r => r.type === 'member') })
      expect(wrapper.find('[data-testid=invites-section]').exists()).toBe(false)
      expect(wrapper.find('[data-testid=members-section]').exists()).toBe(true)
    })

    it('marks only the signed-in person with the "Tú" chip', async () => {
      await setup()
      const chips = wrapper.findAll('[data-testid=me-chip]')
      expect(chips).toHaveLength(1)
      expect(chips[0].text()).toBe('Tú')
      expect(wrapper.get('[data-testid=collaborator-member-1]').find('[data-testid=me-chip]').exists()).toBe(true)
    })

    it('shows the Pendiente and Rechazada chips with their date', async () => {
      await setup({ list: [...LIST, DECLINED] })
      const pending = wrapper.get('[data-testid=collaborator-invite-3]')
      expect(pending.text()).toContain('Pendiente')
      expect(pending.get('[data-testid=invite-when]').text()).toBe('Enviada hace 3 días')
      const declined = wrapper.get('[data-testid=collaborator-invite-4]')
      expect(declined.text()).toContain('Rechazada')
      expect(declined.get('[data-testid=invite-when]').text()).toBe('hace 1 día')
    })

    it('shows no date when the API sends none', async () => {
      await setup({ list: [{ id: 5, type: 'invite', email: 'a@x.com', role: 'viewer', status: 'pending' }] })
      expect(wrapper.find('[data-testid=invite-when]').exists()).toBe(false)
    })

    it('shows a visible Reenviar button that resends, and none on members or for non-managers', async () => {
      api.resendInvite.mockResolvedValue({})
      await setup({ list: [...LIST, DECLINED] })
      expect(wrapper.findAll('[data-testid=resend-button]')).toHaveLength(2)
      expect(wrapper.get('[data-testid=collaborator-member-2]').find('[data-testid=resend-button]').exists()).toBe(false)
      await wrapper.get('[data-testid=collaborator-invite-3] [data-testid=resend-button]').trigger('click')
      await flushPromises()
      expect(api.resendInvite).toHaveBeenCalledWith({ eventId: 7, id: 3 })
      wrapper.unmount()
      await setup({ userRole: 'viewer' })
      expect(wrapper.find('[data-testid=resend-button]').exists()).toBe(false)
    })

    it('truncates long emails and keeps the full one in the title', async () => {
      const email = 'una.direccion.muy.larga.de.correo@dominio-extremadamente-largo.example.com'
      await setup({ list: [{ id: 6, type: 'invite', email, role: 'viewer', status: 'pending' }] })
      const name = wrapper.get('[data-testid=collaborator-invite-6] span.truncate')
      expect(name.attributes('title')).toBe(email)
    })

    it('explains each role in a collapsible list on the page and an open list in the invite dialog', async () => {
      await setup()
      const toggle = wrapper.get('[data-testid=role-help-toggle]')
      const list = wrapper.get('#role-help-list')
      expect(toggle.attributes('aria-expanded')).toBe('false')
      expect(list.classes()).toContain('hidden')
      await toggle.trigger('click')
      expect(toggle.attributes('aria-expanded')).toBe('true')
      expect(list.classes()).not.toContain('hidden')
      expect(list.text()).toContain('pero no el presupuesto')
      await wrapper.findAll('button').find(b => b.text().includes('Invitar')).trigger('click')
      await flushPromises()
      const dialogHelp = body().querySelector('[role=dialog] [data-testid=role-help-list]')
      expect(dialogHelp).not.toBeNull()
      expect(dialogHelp.textContent).toContain('Editor')
      expect(dialogHelp.textContent).toContain('Solo lectura')
      expect(dialogHelp.textContent).not.toContain('Dueña')
    })
  })

  it('shows an actions menu on every row but the owner, only to managers', async () => {
    await setup()
    expect(wrapper.findAll('button[aria-label^="Acciones para"]')).toHaveLength(2)
    wrapper.unmount()
    await setup({ userRole: 'viewer' })
    expect(wrapper.findAll('button[aria-label^="Acciones para"]')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('Invitar')
  })

  describe('when collaborators is locked', () => {
    const lockedModules = [{ key: 'collaborators', state: 'locked' }]

    it('shows the warm notice with the premium CTA, disables inviting and keeps the list', async () => {
      await setup({ modules: lockedModules })
      expect(wrapper.get('[data-testid=locked-note]').text()).toContain('Invitar colaboradoras es parte del evento completo')
      expect(wrapper.get('[data-testid=locked-cta]').attributes('href')).toBe('/dashboard/unlock/collaborators')
      expect(wrapper.text()).toContain('Lucía Planner')
      const invite = wrapper.findAll('button').find(b => b.text() === 'Invitar')
      expect(invite.attributes('disabled')).toBeDefined()
    })

    it('disables role change and resend but keeps remove and cancel', async () => {
      await setup({ modules: lockedModules })
      const open = async key => {
        await wrapper.get(`[data-testid=collaborator-${key}] button[aria-label^="Acciones para"]`).trigger('click')
        await flushPromises()
        const items = [...body().querySelectorAll('[role=menuitem]')]
        const state = Object.fromEntries(items.map(i => [i.textContent.trim(), i.hasAttribute('data-disabled')]))
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await flushPromises()
        return state
      }
      expect(await open('member-2')).toMatchObject({ 'Pasar a solo lectura': true, 'Quitar acceso': false })
      expect(await open('invite-3')).toMatchObject({ 'Reenviar invitación': true, 'Cancelar invitación': false })
    })

    it('locks the screen on a 403 module_locked without a second toast', async () => {
      api.inviteCollaborator.mockRejectedValue({ response: { status: 403, data: { code: 'module_locked', message: 'x' } } })
      await setup()
      expect(wrapper.find('[data-testid=locked-note]').exists()).toBe(false)
      await wrapper.findAll('button').find(b => b.text() === 'Invitar').trigger('click')
      await flushPromises()
      const input = body().querySelector('input[type=email]')
      input.value = 'nueva@x.com'
      input.dispatchEvent(new Event('input'))
      await flushPromises()
      body().querySelector('#invite-collaborator').dispatchEvent(new Event('submit', { cancelable: true }))
      await flushPromises()
      expect(wrapper.find('[data-testid=locked-note]').exists()).toBe(true)
      expect(body().textContent).not.toContain('No pudimos')
    })
  })

  it('shows no locked notice when collaborators is active', async () => {
    await setup({ modules: [{ key: 'collaborators', state: 'active' }, { key: 'menus', state: 'locked' }] })
    expect(wrapper.find('[data-testid=locked-note]').exists()).toBe(false)
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

  it('tells the organizer to wait when inviting is throttled (429)', async () => {
    api.inviteCollaborator.mockRejectedValue({ response: { status: 429, data: { message: 'Too Many Attempts.' } } })
    await setup()
    await wrapper.findAll('button').find(b => b.text().includes('Invitar')).trigger('click')
    await flushPromises()
    const input = body().querySelector('input[type=email]')
    input.value = 'nueva@x.com'
    input.dispatchEvent(new Event('input'))
    await flushPromises()
    body().querySelector('#invite-collaborator').dispatchEvent(new Event('submit', { cancelable: true }))
    await flushPromises()
    const titles = useToast().toasts.map(x => x.title)
    expect(titles.some(x => x.includes('Enviaste demasiadas invitaciones seguidas'))).toBe(true)
    expect(titles).not.toContain('Too Many Attempts.')
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

describe('CollaboratorsView: more flows', () => {
  let wrapper
  let router
  const body = () => document.body
  const toasts = () => useToast().toasts.map(x => `${x.tone}:${x.title}`)

  async function setup({ path = '/', event = { id: 7, userRole: 'owner', modules: [] } } = {}) {
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useUserStore().userId = 11
    const events = useEventsStore()
    events.activeEvent = event
    events.eventPermissions = []
    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }, { path: '/dashboard/collaborators', name: 'collaborators', component: { template: '<div />' } }]
    })
    await router.push(path)
    wrapper = mount(CollaboratorsView, { global: { plugins: [i18n, pinia, router] }, attachTo: document.body })
    await flushPromises()
  }
  const openMenu = async key => {
    await wrapper.get(`[data-testid=${key}]`).get('button').trigger('click')
    await flushPromises()
  }
  const choose = async text => {
    const item = [...body().querySelectorAll('[role=menuitem]')].find(i => i.textContent.includes(text))
    item.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    item.dispatchEvent(new Event('pointerup', { bubbles: true }))
    await flushPromises()
  }

  beforeEach(() => {
    setLocale('es')
    Object.values(api).forEach(fn => fn.mockReset())
    api.loadCollaborators.mockResolvedValue({ data: { data: LIST } })
    useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
  })
  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('loads nothing while there is no active event', async () => {
    await setup({ event: {} })
    expect(api.loadCollaborators).not.toHaveBeenCalled()
  })

  it('opens the invitation form from /invite and goes back to the plain list when it closes', async () => {
    await setup({ path: '/?invite=1' })
    expect(body().querySelector('#invite-collaborator')).not.toBeNull()
    body().querySelector('#invite-collaborator').closest('[role=dialog]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(body().querySelector('#invite-collaborator')).toBeNull()
    expect(router.currentRoute.value.name).toBe('collaborators')
  })

  it('changes a role from the row menu, both ways', async () => {
    api.changeRole.mockResolvedValue({})
    await setup()
    await openMenu('collaborator-member-2')
    await choose(i18n.global.t('app.collaborators.actions.makeViewer'))
    expect(api.changeRole).toHaveBeenLastCalledWith({ eventId: 7, userId: 22, role: 'viewer' })
    expect(toasts()).toContain(`success:${i18n.global.t('app.collaborators.roleChanged')}`)
  })

  it('promotes a view-only member to editor', async () => {
    api.changeRole.mockResolvedValue({})
    api.loadCollaborators.mockResolvedValue({ data: { data: [...LIST, { id: 4, type: 'member', user_id: 44, name: 'Pedro', email: 'pedro@x.com', role: 'viewer' }] } })
    await setup()
    await openMenu('collaborator-member-4')
    await choose(i18n.global.t('app.collaborators.actions.makeEditor'))
    expect(api.changeRole).toHaveBeenLastCalledWith({ eventId: 7, userId: 44, role: 'editor' })
  })

  it('shows the server message of a refused action, or a generic one for a server failure', async () => {
    api.changeRole.mockRejectedValueOnce({ response: { status: 422, data: { message: 'No puedes cambiar ese rol.' } } })
    await setup()
    await openMenu('collaborator-member-2')
    await choose(i18n.global.t('app.collaborators.actions.makeViewer'))
    expect(toasts()).toContain('danger:No puedes cambiar ese rol.')
    api.changeRole.mockRejectedValueOnce({ response: { status: 500, data: { message: 'SQLSTATE boom' } } })
    await openMenu('collaborator-member-2')
    await choose(i18n.global.t('app.collaborators.actions.makeViewer'))
    expect(toasts()).toContain(`danger:${i18n.global.t('app.collaborators.actionError')}`)
    expect(toasts().join()).not.toContain('SQLSTATE')
  })

  it('"Cancelar" in the confirmation keeps the person, and so does closing it', async () => {
    await setup()
    await openMenu('collaborator-member-2')
    await choose(i18n.global.t('app.collaborators.actions.remove'))
    expect(body().querySelector('[data-testid=confirm-action]')).not.toBeNull()
    ;[...body().querySelectorAll('[role=dialog] button')].find(b => b.textContent.trim() === i18n.global.t('app.collaborators.cancel')).click()
    await flushPromises()
    expect(body().querySelector('[data-testid=confirm-action]')).toBeNull()
    await openMenu('collaborator-member-2')
    await choose(i18n.global.t('app.collaborators.actions.remove'))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(body().querySelector('[data-testid=confirm-action]')).toBeNull()
    expect(api.removeCollaborator).not.toHaveBeenCalled()
  })
})
