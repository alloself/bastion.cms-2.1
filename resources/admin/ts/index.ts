import { createApp } from 'vue';
import { installPlugins } from '@admin/ts/shared/plugins';

import App from '@admin/ts/app/App.vue';

const bootstrapAdminApp = () => {
    const container = document.getElementById('admin-app');
    if (!container) return;
    const app = createApp(App);


    installPlugins(app);

    app.mount(container);
};

bootstrapAdminApp();


