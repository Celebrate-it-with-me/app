import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import es from '@/locales/es'

const userStore = { isAuthenticated: false }
vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => userStore }))

const NotFoundView = (await import('../NotFoundView.vue')).default
const Stub = { template: '<div />' }

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: Stub },
      { path: '/dashboard', name: 'dashboard', component: Stub },
      { path: '/event/:id', name: 'event', component: Stub },
      { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView }
    ]
  })
}

async function render(path) {
  const router = makeRouter()
  router.push(path)
  await router.isReady()
  const i18n = createI18n({ legacy: false, locale: 'es', messages: { es } })
  const wrapper = mount(NotFoundView, { global: { plugins: [router, i18n] } })
  return { router, wrapper }
}

describe('catch-all route', () => {
  it('matches unknown paths, keeps the full path in params and leaves known routes alone', async () => {
    const router = makeRouter()
    await router.push('/nope/at/all')
    expect(router.currentRoute.value.name).toBe('not-found')
    expect(router.currentRoute.value.params.pathMatch).toEqual(['nope', 'at', 'all'])
    await router.push('/event/abc')
    expect(router.currentRoute.value.name).toBe('event')
    await router.push('/dashboard')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('is declared last in the real router and is public', async () => {
    const { default: router } = await import('@/router')
    const routes = router.getRoutes()
    const last = router.options.routes.at(-1)
    expect(last.path).toBe('/:pathMatch(.*)*')
    expect(last.meta.requiresAuth).toBe(false)
    expect(routes.at(-1).name).toBe('catch-all')
    expect(router.resolve('/definitely/unknown').name).toBe('catch-all')
    expect(router.resolve('/404').name).toBe('not-found')
    expect(router.resolve('/403').name).toBe('forbidden')
    expect(router.resolve('/event/5/invite').name).toBe('invite-accept')
    expect(router.resolve('/sign-in').name).toBe('sign-in')
    expect(router.resolve('/dashboard').name).toBe('dashboard')
  })
})

describe('NotFoundView', () => {
  beforeEach(() => {
    userStore.isAuthenticated = false
  })

  it('shows the copy and sends visitors to the public home', async () => {
    const { wrapper } = await render('/zzz')
    expect(wrapper.text()).toContain('No encontramos esta página')
    const link = wrapper.get('a')
    expect(link.text()).toBe('Volver al inicio')
    expect(link.attributes('href')).toBe('/')
  })

  it('sends signed-in users to the dashboard', async () => {
    userStore.isAuthenticated = true
    const { wrapper } = await render('/zzz')
    expect(wrapper.get('a').attributes('href')).toBe('/dashboard')
    await flushPromises()
  })
})
