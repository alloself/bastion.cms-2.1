import { PiniaColada } from '@pinia/colada'
import { PiniaColadaCachePersister } from '@pinia/colada-plugin-cache-persister'
import { createPinia } from 'pinia'
import type { App } from 'vue'

import router from '@/ts/app/router'

import vuetify from './vuetify'

export const installPlugins = (app: App) => {
    app.use(createPinia())
    app.use(PiniaColada, {
        plugins: [PiniaColadaCachePersister()],
    })
    app.use(router)
    app.use(vuetify)
}
