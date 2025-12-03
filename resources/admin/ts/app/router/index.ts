import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { guards, setRouterForGuards } from "./guards";

const router = createRouter({
    history: createWebHistory("/admin"),
    routes,
});

setRouterForGuards(router);
guards.forEach(({ handler }) => router.beforeEach(handler));

export default router;
