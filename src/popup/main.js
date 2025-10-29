import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import i18nPlugin from '../plugins/i18n.js'
import './style.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(i18nPlugin)
app.mount('#app')
