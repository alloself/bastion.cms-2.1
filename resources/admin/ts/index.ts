import { createApp } from "vue";
import { installPlugins } from "@admin/ts/shared/plugins";

import App from "@admin/ts/app/App.vue";
import { getCSRFToken } from "./shared/api/client";
import { useUserStore } from "./entities/user";
import router from "./app/router";

const bootstrapAdminApp = async () => {
    const container = document.getElementById("admin-app");
    if (!container) return;

    await getCSRFToken();

    const app = createApp(App);

    installPlugins(app);

    const { getUser } = useUserStore();

    try {
        await getUser();
    } catch (error) {
        router.push({ name: "Login" });
    }

    app.mount(container);
};

bootstrapAdminApp();
