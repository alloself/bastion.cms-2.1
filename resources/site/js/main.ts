import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import App from './App.vue';
import { autoMountWidgets, registerWidget } from './widget-registry';

function bootstrapWidgets(): void {
    registerWidget('App', {
        component: App,
        setupApp(app) {
            app.use(PrimeVue, {
                theme: {
                    preset: Aura,
                    options: {
                        cssLayer: { name: 'primevue', order: 'theme, base, primevue' },
                    },
                },
            });
        },
    });

    autoMountWidgets();
}

document.addEventListener('DOMContentLoaded', () => {
    bootstrapWidgets();
});


