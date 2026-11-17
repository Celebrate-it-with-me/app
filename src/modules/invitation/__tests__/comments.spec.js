import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'

const { listComments, postComment } = vi.hoisted(() => ({ listComments: vi.fn(), postComment: vi.fn() }))
vi.mock('@/services/PublicEvents/InvitationService', () => ({ default: { listComments, postComment } }))

import i18n from '@/locales/i18n'
import { INVITATION_KEY } from '../composables/useInvitation'
import InvitationComments from '../components/InvitationComments.vue'

const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: 'es' })

const item = (id, extra = {}) => ({ id, author: `Autor ${id}`, comment: `Mensaje ${id}`, isPinned: false, createdAt: '2026-11-01T10:00:00Z', ...extra })
const page = (data, meta = {}) => ({ data: { data, meta: { currentPage: 1, lastPage: 1, total: data.length, ...meta } } })
const sectionData = (extra = {}) => ({ heading: 'Deja unos saludos', subHeading: null, buttonText: 'Enviar', maxLength: 500, canWrite: true, ...extra })

function mountComments({ data = sectionData(), props = {}, preview = false } = {}) {
  return mount(InvitationComments, {
    props: { section: { type: 'comments', title: null, text: null, settings: {}, data }, ...props },
    global: { provide: { [INVITATION_KEY]: { invitation: ref({ locale: 'es' }), tt, slug: () => 'xv', code: () => 'AB1234', preview } } }
  })
}

const failWith = (status, body = {}) => Promise.reject({ response: { status, data: body } })

beforeEach(() => {
  listComments.mockReset()
  postComment.mockReset()
})

describe('InvitationComments', () => {
  it('loads the first page and shows messages as text, never HTML', async () => {
    listComments.mockResolvedValue(page([item(1, { comment: '<b>hola</b>' }), item(2, { isPinned: true })]))
    const wrapper = mountComments()
    await flushPromises()
    expect(listComments).toHaveBeenCalledWith({ slug: 'xv', code: 'AB1234', page: 1 })
    expect(wrapper.text()).toContain('<b>hola</b>')
    expect(wrapper.find('b').exists()).toBe(false)
    expect(wrapper.text()).toContain(tt('comments.pinned'))
  })

  it('shows the empty state', async () => {
    listComments.mockResolvedValue(page([]))
    const wrapper = mountComments()
    await flushPromises()
    expect(wrapper.text()).toContain(tt('comments.empty'))
  })

  it('shows a skeleton while loading and a retry on error', async () => {
    listComments.mockReturnValueOnce(new Promise(() => {}))
    const loading = mountComments()
    await flushPromises()
    expect(loading.find('[role="status"]').exists()).toBe(true)

    listComments.mockImplementationOnce(() => failWith(500)).mockResolvedValueOnce(page([item(1)]))
    const wrapper = mountComments()
    await flushPromises()
    expect(wrapper.text()).toContain(tt('comments.loadError'))
    await wrapper.findAll('button').find(b => b.text() === tt('retry')).trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Mensaje 1')
  })

  it('paginates with "show more" and skips duplicates', async () => {
    listComments
      .mockResolvedValueOnce(page([item(1), item(2)], { currentPage: 1, lastPage: 2, total: 3 }))
      .mockResolvedValueOnce(page([item(2), item(3)], { currentPage: 2, lastPage: 2, total: 3 }))
    const wrapper = mountComments()
    await flushPromises()
    await wrapper.findAll('button').find(b => b.text() === tt('comments.more')).trigger('click')
    await flushPromises()
    expect(listComments).toHaveBeenLastCalledWith({ slug: 'xv', code: 'AB1234', page: 2 })
    expect(wrapper.findAll('.inv-comments__item')).toHaveLength(3)
    expect(wrapper.text()).not.toContain(tt('comments.more'))
  })

  it('caps the visible messages with max', async () => {
    listComments.mockResolvedValue(page([item(1), item(2), item(3)]))
    const wrapper = mountComments({ props: { max: 2 } })
    await flushPromises()
    expect(wrapper.findAll('.inv-comments__item')).toHaveLength(2)
    await wrapper.findAll('button').find(b => b.text() === tt('comments.more')).trigger('click')
    expect(wrapper.findAll('.inv-comments__item')).toHaveLength(3)
  })

  it('posts a trimmed comment and puts it after the pinned ones', async () => {
    listComments.mockResolvedValue(page([item(1, { isPinned: true }), item(2)]))
    postComment.mockResolvedValue({ data: { data: item(9, { comment: 'Felicidades' }) } })
    const wrapper = mountComments()
    await flushPromises()
    await wrapper.get('textarea').setValue('  Felicidades  ')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(postComment).toHaveBeenCalledWith({ slug: 'xv', code: 'AB1234', comment: 'Felicidades' })
    const authors = wrapper.findAll('.inv-comments__item').map(li => li.text())
    expect(authors[1]).toContain('Felicidades')
    expect(wrapper.text()).toContain(tt('comments.thanks'))
    expect(wrapper.get('textarea').element.value).toBe('')
  })

  it('counts characters, blocks an empty or over-limit message and never calls the API', async () => {
    listComments.mockResolvedValue(page([]))
    const wrapper = mountComments()
    await flushPromises()
    const send = wrapper.get('button[type="submit"]')
    expect(send.attributes('disabled')).toBeDefined()
    await wrapper.get('textarea').setValue('x'.repeat(501))
    expect(wrapper.text()).toContain('501/500')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
    await wrapper.get('form').trigger('submit')
    expect(postComment).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain(tt('comments.errors.too_long'))
  })

  it.each([
    [429, { code: 'too_many_attempts' }, 'too_many_attempts'],
    [403, { code: 'module_locked' }, 'module_locked'],
    [409, { code: 'comments_full' }, 'comments_full'],
    [422, { errors: { comment: ['too_long'] } }, 'too_long'],
    [500, {}, 'generic']
  ])('maps a %i answer to a readable message and keeps the draft', async (status, body, key) => {
    listComments.mockResolvedValue(page([]))
    postComment.mockImplementation(() => failWith(status, body))
    const wrapper = mountComments()
    await flushPromises()
    await wrapper.get('textarea').setValue('Hola')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe(tt(`comments.errors.${key}`))
    expect(wrapper.get('textarea').element.value).toBe('Hola')
  })

  it('is read only when the section says so', async () => {
    listComments.mockResolvedValue(page([item(1)]))
    const wrapper = mountComments({ data: sectionData({ canWrite: false }) })
    await flushPromises()
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain(tt('comments.readOnly'))
    expect(wrapper.text()).toContain('Mensaje 1')
  })

  it('does not call the API in the admin preview', async () => {
    const wrapper = mountComments({ preview: true })
    await flushPromises()
    expect(listComments).not.toHaveBeenCalled()
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
  })
})
