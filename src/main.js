// Must stay first: in a support tab it switches persistence to this tab's sessionStorage before any store loads.
import '@/modules/impersonation/bootstrap'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { createPinia } from 'pinia'
import router from '@/router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { SpectrumDirective } from '@/directives/SpectrumDirective'
// import 'spectrum-vanilla/dist/spectrum.css'
import 'spectrum-vanilla/dist/spectrum-dark.css'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import VueApexCharts from 'vue3-apexcharts'
import i18n from '@/locales/i18n'

const app = createApp(App)

// registerPlugin(app);

const pinia = createPinia()

app.directive('colorpicker', SpectrumDirective)
app.use(pinia.use(piniaPluginPersistedstate)).use(router)
app.use(i18n)
app.use(FloatingVue)
app.use(VueApexCharts)

app.mount('#app')
