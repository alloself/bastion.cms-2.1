import { createApp } from 'vue'

import { App, registerPlugins } from './app'

const mountAdminApp = () => {
    const app = createApp(App)

    registerPlugins(app)

    app.mount('#admin-app')
}

window.addEventListener('DOMContentLoaded', mountAdminApp)
