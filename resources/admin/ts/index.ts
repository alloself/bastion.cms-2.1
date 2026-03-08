import { createApp } from 'vue'
import { App } from './app'

const mountAdminApp = async () => {
    const app = createApp(App)

    app.mount('#admin-app')
}

window.addEventListener('DOMContentLoaded', mountAdminApp)
