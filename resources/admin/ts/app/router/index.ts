import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { guards, setRouterForGuards } from "./guards";
import { useScreenStore } from "@admin/ts/features/screen";

const router = createRouter({
    history: createWebHistory("/admin"),
    routes,
});

setRouterForGuards(router);
guards.forEach(({ handler }) => router.beforeEach(handler));

router.afterEach((to) => {
    const screenStore = useScreenStore();
    screenStore.setActiveScreenTabRoute(to);
});

export default router;
