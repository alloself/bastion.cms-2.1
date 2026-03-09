import type { App } from 'vue'
import { PiniaColada } from '@pinia/colada'
import { createPinia } from 'pinia'
import type { QueryCache } from '@pinia/colada'
import type { Router } from 'vue-router'
import router from '../router'
import vuetify from './vuetify'

export const registerPlugins = (app: App) => {
    app.use(vuetify)
    app.use(createPinia())
    app.use(PiniaColada)
    app.use(router)
}
