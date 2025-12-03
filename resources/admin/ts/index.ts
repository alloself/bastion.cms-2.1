import { createApp } from "vue";
import { installPlugins } from "@admin/ts/shared/plugins";

import App from "@admin/ts/app/App.vue";
import { configureClient, getCSRFToken } from "@admin/ts/shared/api/client";
import {
    handleAuthError,
    handleUnprocessableEntityError,
} from "@admin/ts/app/api/interceptors";

const bootstrapAdminApp = async () => {
    const container = document.getElementById("admin-app");
    if (!container) {
        return;
    }

    await getCSRFToken();

    configureClient({
        error: [handleAuthError, handleUnprocessableEntityError],
    });

    const app = createApp(App);

    installPlugins(app);

    app.mount(container);
};

window.addEventListener("DOMContentLoaded", bootstrapAdminApp);
