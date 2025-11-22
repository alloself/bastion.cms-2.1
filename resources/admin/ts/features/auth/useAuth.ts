import { computed } from "vue";
import { useUserStore } from "@admin/ts/entities/user";
import type { LoginFormValues } from "@admin/ts/shared/forms/login";
import type { RouteLocationNormalized, RouteLocationRaw } from "vue-router";
import { useRoute, useRouter } from "vue-router";
import { routeNames } from "@admin/ts/shared/router/routeNames";
import { useNotificationsStore } from "@admin/ts/features/notifications";
import { isAxiosError } from "axios";

let isAuthUserLoaded = false;

export const ensureAuthUserLoaded = async () => {
    if (isAuthUserLoaded) {
        return;
    }
    const userStore = useUserStore();
    try {
        await userStore.getUser();
    } finally {
        isAuthUserLoaded = true;
    }
};

export const isUserAuthenticated = () => {
    const userStore = useUserStore();
    return userStore.isAuthenticated;
};

export const resolveLoginRouteGuard = (
    to: RouteLocationNormalized,
    isSafeRedirectPath: (value: unknown) => value is string
): true | RouteLocationRaw | string => {
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

export const resolveProtectedRouteGuard = (
    to: RouteLocationNormalized
): true | RouteLocationRaw => {
    if (to.meta?.requiresAuth !== true) {
        return true;
    }
    if (isUserAuthenticated()) {
        return true;
    }
    return { name: routeNames.Login, query: { redirect: to.fullPath } };
};

export const useAuth = () => {
    const userStore = useUserStore();
    const router = useRouter();
    const route = useRoute();
    const notificationsStore = useNotificationsStore();

    const isAuthenticated = computed(() => {
        return userStore.isAuthenticated;
    });

    const login = async (values: LoginFormValues) => {
        try {
            await userStore.login(values);
            const redirectQuery = route.query.redirect;
            const redirectTo =
                typeof redirectQuery === "string" ? redirectQuery : null;
            if (redirectTo) {
                await router.push(redirectTo);
                return;
            }
            await router.push({ name: routeNames.Authenticated });
        } catch (error: unknown) {
            if (isAxiosError(error) && error.response?.status === 401) {
                notificationsStore.pushNotification({
                    content: "Неверный логин или пароль",
                    color: "error",
                });
                return Promise.reject(error);
            }
            return Promise.reject(error);
        }
    };

    const logout = async () => {
        try {
            await userStore.logout();
        } finally {
            await router.push({ name: routeNames.Login });
        }
    };

    return {
        user: userStore.user,
        isAuthenticated,
        getUser: userStore.getUser,
        login,
        logout,
    };
};


