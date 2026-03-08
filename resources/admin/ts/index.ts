import { createApp } from 'vue'
import { App } from './app'
import { registerPlugins } from './app/plugins'

const mountAdminApp = async () => {
    const app = createApp(App)

    registerPlugins(app)

    app.mount('#admin-app')
}

window.addEventListener('DOMContentLoaded', mountAdminApp)
