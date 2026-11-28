import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import AccountLayout from '../AccountLayout.vue'

const page = { template: '<p data-testid="page">page</p>' }
const ROUTES = ['profile', 'preferences', 'purchases', 'security'].map(p => ({ path: `/settings/${p}`, component: page }))

async function mountLayout(path = '/settings/profile') {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/settings', component: AccountLayout, children: ROUTES.map(r => ({ ...r, path: r.path.replace('/settings/', '') })) }] })
  await router.push(path)
  const wrapper = mount({ template: '<router-view />' }, { global: { plugins: [i18n, pinia, router] } })
  await flushPromises()
  return wrapper
}

beforeEach(() => setLocale('es'))

describe('AccountLayout', () => {
  it('keeps the title and the subtitle', async () => {
    const wrapper = await mountLayout()
    expect(wrapper.find('h1').text()).toBe('Mi cuenta')
    expect(wrapper.text()).toContain('Tus datos, tus preferencias y tu contraseña.')
  })

  it('shows the four sections as a grid of four on phones, without any scroll container', async () => {
    const wrapper = await mountLayout()
    const nav = wrapper.find('nav')
    expect(nav.classes()).toEqual(expect.arrayContaining(['grid', 'grid-cols-4', 'w-full']))
    expect(nav.classes()).not.toContain('w-max')
    expect(wrapper.html()).not.toContain('overflow-x-auto')
    expect(nav.findAll('a').map(a => a.attributes('href'))).toEqual(['/settings/profile', '/settings/preferences', '/settings/purchases', '/settings/security'])
  })

  it('turns into the 200 px side list next to a 640 px column from 1024 px', async () => {
    const wrapper = await mountLayout()
    expect(wrapper.find('[data-testid=account-grid]').classes()).toContain('lg:grid-cols-[200px_minmax(0,640px)]')
    expect(wrapper.find('[data-testid=account-grid]').classes()).toContain('lg:gap-8')
    expect(wrapper.find('[data-testid=account-nav]').classes()).toEqual(expect.arrayContaining(['lg:sticky', 'lg:top-[88px]']))
    expect(wrapper.find('nav').classes()).toEqual(expect.arrayContaining(['lg:flex', 'lg:flex-col', 'lg:gap-0.5']))
  })

  it('marks the open section with aria-current and the rose pill from 1024 px', async () => {
    const wrapper = await mountLayout('/settings/purchases')
    const current = wrapper.find('a[aria-current=page]')
    expect(current.attributes('href')).toBe('/settings/purchases')
    expect(current.classes().join(' ')).toContain('lg:!bg-rose-50')
    expect(current.classes().join(' ')).toContain('lg:!text-rose-700')
  })

  it('swaps "Preferencias" for "Ajustes" under 400 px and keeps the full name for assistive tech', async () => {
    const wrapper = await mountLayout()
    const link = wrapper.findAll('a')[1]
    expect(link.attributes('aria-label')).toBe('Preferencias')
    const [short, full] = link.findAll('span')
    expect(short.text()).toBe('Ajustes')
    expect(short.classes()).toContain('min-[400px]:hidden')
    expect(full.text()).toBe('Preferencias')
    expect(full.classes()).toEqual(expect.arrayContaining(['hidden', 'min-[400px]:inline']))
  })

  it('is translated to English', async () => {
    setLocale('en')
    const wrapper = await mountLayout()
    expect(wrapper.findAll('a')[1].text()).toContain('Settings')
    expect(wrapper.findAll('a')[1].attributes('aria-label')).toBe('Preferences')
  })

  it('releases the assistant column that fab-safe rows keep free elsewhere', async () => {
    const wrapper = await mountLayout()
    expect(wrapper.find('[data-testid=account-grid]').element.children[1].className).toContain('[&_.fab-safe]:pr-0')
  })

  it('renders the page next to the navigation', async () => {
    const wrapper = await mountLayout()
    expect(wrapper.find('[data-testid=page]').exists()).toBe(true)
  })
})
