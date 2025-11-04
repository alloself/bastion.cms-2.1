import { useUserStore } from "@admin/ts/entities/user";
import type { RouteLocationNormalized, Router } from "vue-router";
import { routeNames } from "@admin/ts/app/router/routeNames";

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

let authChecked = false;

export const guards = [
    {
        handler: async () => {
            if (authChecked) return true;
            const userStore = useUserStore();
            try {
                await userStore.getUser();
            } finally {
                authChecked = true;
            }
            return true;
        },
    },
    {
        handler: async (to: RouteLocationNormalized) => {
            const userStore = useUserStore();

            if (to?.name !== routeNames.Login) {
                return true;
            }

            if (userStore.isAuthenticated) {
                const redirect = to.query?.redirect;
                if (isSafeRedirectPath(redirect)) return redirect;
                return { name: routeNames.Authenticated };
            }

            return true;
        },
    },
    {
        handler: async (to: RouteLocationNormalized) => {
            if (to?.meta?.requiresAuth !== true) {
                return true;
            }

            const userStore = useUserStore();

            if (userStore.isAuthenticated) {
                return true;
            }

            return { name: routeNames.Login, query: { redirect: to.fullPath } };
        },
    },
];
