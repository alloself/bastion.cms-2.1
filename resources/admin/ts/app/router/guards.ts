import type { RouteLocationNormalized, Router } from "vue-router";
import {
    ensureAuthUserLoaded,
    resolveLoginRouteGuard,
    resolveProtectedRouteGuard,
} from "@admin/ts/features/auth";

let routerInstance: Router | null = null;

export const setRouterForGuards = (router: Router) => {
    routerInstance = router;
};

const isSafeRedirectPath = (value: unknown): value is string => {
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
    if (!routerInstance) {
        return true;
    }

    return routerInstance.resolve(value).matched.length > 0;
};

export const guards = [
    {
        handler: async () => {
            await ensureAuthUserLoaded();
            return true;
        },
    },
    {
        handler: async (to: RouteLocationNormalized) => {
            return resolveLoginRouteGuard(to, isSafeRedirectPath);
        },
    },
    {
        handler: async (to: RouteLocationNormalized) => {
            return resolveProtectedRouteGuard(to);
        },
    },
];
