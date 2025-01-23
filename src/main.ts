import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import "./style.css"
import 'vue-final-modal/style.css'
import { registerPlugin } from '@/plugins/index.js'
import { createPinia } from 'pinia'
import router from '@/router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

let app = createApp(App)

// registerPlugin(app);

const pinia = createPinia();

app.use(pinia.use(piniaPluginPersistedstate)).use(router)

app.mount('#app')
