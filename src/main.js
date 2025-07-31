import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import 'vue-final-modal/style.css'
import { createPinia } from 'pinia'
import router from '@/router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { SpectrumDirective } from '@/directives/SpectrumDirective'
// import 'spectrum-vanilla/dist/spectrum.css'
import 'spectrum-vanilla/dist/spectrum-dark.css'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import VueApexCharts from 'vue3-apexcharts'

const app = createApp(App)

// registerPlugin(app);

const pinia = createPinia()

app.directive('colorpicker', SpectrumDirective)
app.use(pinia.use(piniaPluginPersistedstate)).use(router)
app.use(FloatingVue)
app.use(VueApexCharts)

app.mount('#app')
