// Bootstraps Admin Vue application with Vuetify and mounts if container exists.
import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

import App from './App.vue';

function bootstrapAdminApp(): void {
    const container = document.getElementById('admin-app');
    if (!container) return;

    const vuetify = createVuetify();

    const app = createApp(App);
    app.use(vuetify);
    app.mount(container);
}

bootstrapAdminApp();


