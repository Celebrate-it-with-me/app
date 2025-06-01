// Import Pinia
import { createPinia } from 'pinia'
// Import Pinia Logger
import PiniaLogger from 'pinia-logger'
// Import Router
import router from '@/router/index.js'
// Import Locales
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import Notifications from '@kyvg/vue3-notification'

// Register Plugin Function
export function registerPlugin(app) {
  const pinia = createPinia()

  // Use Pinia Logger
  pinia.use(
    PiniaLogger({
      expanded: true,
      disabled: import.meta.env.PROD
    })
  )

  // pinia.use(piniaPluginPersistedstate);

  console.log('Hydrated state:', localStorage.getItem('user'))

  // Use Vue Final Modal, Router and Pinia middleware in Vue App
  app
    //.use(i18n)
    //.use(createVfm())
    .use(router)
    .use(pinia.use(piniaPluginPersistedstate))
    .use(Notifications)
}
