import type { App } from 'vue'
import { createPinia } from 'pinia'
import router from '../router'
import vuetify from './vuetify'

export const registerPlugins = (app: App) => {
  app.use(vuetify)
  app.use(createPinia())
  app.use(router)
}
