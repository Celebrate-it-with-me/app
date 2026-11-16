// Must stay first: in a support tab it switches persistence to this tab's sessionStorage before any store loads.
import '@/modules/impersonation/bootstrap'
import './assets/main.css'
import './assets/fonts/fonts.css'

import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { createPinia } from 'pinia'
import router from '@/router'
import { routeTitle } from '@/router/authGuard'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import i18n, { localeReady } from '@/locales/i18n'

const app = createApp(App)

// registerPlugin(app);

const pinia = createPinia()

app.use(pinia.use(piniaPluginPersistedstate)).use(router)
app.use(i18n)

// The active language is its own chunk; it downloads while the first route chunk does.
await localeReady
// The first guard may have run before the texts arrived: set the tab title again once both are ready.
router.isReady().then(() => {
  document.title = routeTitle(router.currentRoute.value)
})

app.mount('#app')
