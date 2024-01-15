import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import "./style.css"
import 'vue-final-modal/style.css'
import { registerPlugin } from '@/plugins/index.js'

let app = createApp(App)

registerPlugin(app);

app.mount('#app')
