// Bootstraps public site with Vue, PrimeVue and mounts if container exists.
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import App from './App.vue';

function bootstrapSiteApp(): void {
    const container = document.getElementById('site-app');
    if (!container) return;

    const app = createApp(App);
    app.use(PrimeVue, {
        theme: {
            preset: Aura,
            options: {
                cssLayer: { name: 'primevue', order: 'theme, base, primevue' },
            },
        },
    });

    app.mount(container);
}

bootstrapSiteApp();


