import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Options from './Options.vue'
import i18nPlugin from '../plugins/i18n.js'
import { initI18n } from '../utils/i18n.js'
import './style.css'

initI18n().then(() => {
  const pinia = createPinia()
  const app = createApp(Options)

  app.use(pinia)
  app.use(i18nPlugin)
  app.mount('#app')
})