import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { guards } from "./guards";

const router = createRouter({
    history: createWebHistory("/admin"),
    routes,
});

export const isSafeRedirectPath = (value: unknown): value is string => {
    if (typeof value !== "string") {
        return false;
    }
    if (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("//")
    ) {
        return false;
    }
    if (!value.startsWith("/")) {
        return false;
    }
    if (!router) {
        return true;
    }

    return router.resolve(value).matched.length > 0;
};

guards.forEach(({ handler }) => router.beforeEach(handler));

export default router;
