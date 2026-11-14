import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { UiAvatar } from '@/ui'
import { resolveAvatarUrl } from '@/utils/avatar'

describe('UiAvatar', () => {
  it('shows initials as a labelled image role when there is no photo', () => {
    const wrapper = mount(UiAvatar, { props: { name: 'María Fernández' } })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toBe('MF')
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('María Fernández')
  })

  it('shows the photo, lazy and cropped round, with its alt', () => {
    const wrapper = mount(UiAvatar, { props: { name: 'María', src: 'https://x.test/a.jpg', alt: 'Foto de perfil de María' } })
    const img = wrapper.get('img')
    expect(img.attributes('alt')).toBe('Foto de perfil de María')
    expect(img.attributes('loading')).toBe('lazy')
    expect(img.classes()).toContain('rounded-full')
    expect(img.classes()).toContain('object-cover')
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('falls back to the name as alt and to initials when the photo fails', async () => {
    const wrapper = mount(UiAvatar, { props: { name: 'María', src: 'https://x.test/a.jpg' } })
    expect(wrapper.get('img').attributes('alt')).toBe('María')
    await wrapper.get('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toBe('M')
  })
})

describe('resolveAvatarUrl', () => {
  it('keeps real addresses, undoes the storage prefix on social photos, and drops junk', () => {
    expect(resolveAvatarUrl('http://dev.api.cwm.com/storage/avatars/a.png')).toBe('http://dev.api.cwm.com/storage/avatars/a.png')
    expect(resolveAvatarUrl('http://dev.api.cwm.com/storage/https://lh3.googleusercontent.com/a=s96')).toBe('https://lh3.googleusercontent.com/a=s96')
    expect(resolveAvatarUrl('')).toBe('')
    expect(resolveAvatarUrl(null)).toBe('')
    expect(resolveAvatarUrl('javascript:alert(1)')).toBe('')
  })
})
