import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { guards } from "./guards";
import { isValidRedirectPath } from "@/ts/shared/helpers";

const router = createRouter({
    history: createWebHistory("/admin"),
    routes,
});

export const isSafeRedirectPath = (value: unknown): value is string => {
    if (!isValidRedirectPath(value)) {
        return false;
    }
    return router.resolve(value).matched.length > 0;
};

guards.forEach(({ handler }) => router.beforeEach(handler));

export default router;
