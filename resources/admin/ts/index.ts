import { createApp } from "vue";
import { installPlugins } from "@admin/ts/shared/plugins";

import App from "@admin/ts/app/App.vue";
import { getCSRFToken } from "./shared/api/client";

const bootstrapAdminApp = async () => {
    const container = document.getElementById("admin-app");
    if (!container) return;

    await getCSRFToken();

    const app = createApp(App);

    installPlugins(app);

    app.mount(container);
};

window.addEventListener("DOMContentLoaded", bootstrapAdminApp);
