import type { RouteLocationNormalized } from "vue-router";
import { isSafeRedirectPath } from ".";
import { useAuthStore } from "@/ts/features/auth";
import { routeNames } from "@/ts/shared";

const isUserAuthenticated = () => {
    const authStore = useAuthStore();

    return authStore.user;
};

let isUserLoaded = false;
let userLoadPromise: Promise<void> | null = null;

export const resolveProtectedRouteGuard = (to: RouteLocationNormalized) => {
    if (to.meta?.requiresAuth !== true) {
        return true;
    }
    if (isUserAuthenticated()) {
        return true;
    }
    return { name: routeNames.Login, query: { redirect: to.fullPath } };
};

export const resolveLoginRouteGuard = (to: RouteLocationNormalized) => {
    if (to.name !== routeNames.Login) {
        return true;
    }
    if (!isUserAuthenticated()) {
        return true;
    }

    const redirectCandidate = to.query?.redirect;
    if (isSafeRedirectPath(redirectCandidate)) {
        return redirectCandidate;
    }

    return { name: routeNames.Authenticated };
};

export const ensureAuthUserLoaded = async () => {
    if (isUserLoaded) {
        return;
    }

    if (userLoadPromise) {
        return userLoadPromise;
    }

    const authStore = useAuthStore();

    userLoadPromise = authStore.getUser().finally(() => {
        isUserLoaded = true;
        userLoadPromise = null;
    });

    await userLoadPromise;
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
            return resolveLoginRouteGuard(to);
        },
    },
    {
        handler: async (to: RouteLocationNormalized) => {
            return resolveProtectedRouteGuard(to);
        },
    },
];
