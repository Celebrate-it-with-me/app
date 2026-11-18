import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import es from '@/locales/es'
import en from '@/locales/en'
import { nonAuthRoutes } from '@/router/nonAuthRoutes'
import DataDeletionView from '../DataDeletionView.vue'

const Stub = { template: '<div />' }

async function render(locale) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/privacy', component: Stub },
      { path: '/sign-in', component: Stub },
      { path: '/settings/security', component: Stub }
    ]
  })
  router.push('/privacy')
  await router.isReady()
  const i18n = createI18n({ legacy: false, locale, messages: { es, en } })
  const wrapper = mount(DataDeletionView, { global: { plugins: [router, i18n, pinia] } })
  await flushPromises()
  return wrapper
}

describe('data deletion route', () => {
  it('is registered and public', () => {
    const route = nonAuthRoutes.find((r) => r.path === '/data-deletion')
    expect(route).toBeTruthy()
    expect(route.meta.requiresAuth).toBe(false)
  })
})

describe('DataDeletionView', () => {
  it('renders in Spanish', async () => {
    const w = await render('es')
    expect(w.text()).toContain('Eliminación de datos')
    expect(w.text()).toContain('Si entraste con Facebook o Google')
    expect(w.text()).toContain('hola@quinvite.com')
    expect(w.findAll('ol li')).toHaveLength(3)
  })

  it('renders in English', async () => {
    const w = await render('en')
    expect(w.text()).toContain('Data deletion')
    expect(w.text()).toContain('If you signed in with Facebook or Google')
    expect(w.findAll('ol li')).toHaveLength(3)
  })

  it('links to sign-in without a session', async () => {
    const w = await render('es')
    expect(w.get('[data-testid="deletion-cta"]').attributes('href')).toBe('/sign-in')
  })
})
