import { createApp } from "vue";

import App from "@/ts/app/App.vue";
import {
    configureClient,
    getCSRFToken,
    installPlugins,
    handleAuthError,
    handleUnprocessableEntityError,
} from "@/ts/shared";

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
