import { useQueryCache } from '@pinia/colada'
import { createApp } from 'vue'

import { App, registerPlugins } from '@/ts/app'
import router from '@/ts/app/router'
import { setupGuards } from '@/ts/app/router/guards'
import { authErrorHandler } from '@/ts/features/auth/api/interceptors'
import { configureClient, getCSRFToken } from '@/ts/shared/api'

const mountAdminApp = async () => {
    await getCSRFToken()

    const app = createApp(App)
    registerPlugins(app)

    const queryCache = useQueryCache()

    configureClient({
        error: [authErrorHandler(router, queryCache)],
    })

    setupGuards(queryCache, router)

    app.mount('#admin-app')
}

window.addEventListener('DOMContentLoaded', mountAdminApp)
