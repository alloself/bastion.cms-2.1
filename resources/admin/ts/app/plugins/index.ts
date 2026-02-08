import { PiniaColada } from '@pinia/colada'
import { createPinia } from 'pinia'
import type { App } from 'vue'
import router from '@/ts/app/router'
import vuetify from './vuetify'

export const installPlugins = (app: App) => {
    app.use(createPinia())
    app.use(PiniaColada, {
        queryOptions: {
            staleTime: 5000,
        },
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
