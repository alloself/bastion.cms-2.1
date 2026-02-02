import { PiniaColada } from '@pinia/colada'
import { PiniaColadaCachePersister } from '@pinia/colada-plugin-cache-persister'
import { createStore, del, get, set } from 'idb-keyval'
import { createPinia } from 'pinia'
import type { App } from 'vue'
import router from '@/ts/app/router'
import vuetify from './vuetify'

const coladaStore = createStore('pinia-colada-db', 'cache')

export const installPlugins = (app: App) => {
    app.use(createPinia())
    app.use(PiniaColada, {
        plugins: [
            // PiniaColadaCachePersister({
            //     storage: {
            //         getItem: async (key: string) => {
            //             const value = await get<string>(key, coladaStore)
            //             return value ?? null
            //         },
            //         setItem: (key: string, value: string) => set(key, value, coladaStore),
            //         removeItem: (key: string) => del(key, coladaStore),
            //     },
            // }),
        ],
    })
    app.use(router)
    app.use(vuetify)
}
