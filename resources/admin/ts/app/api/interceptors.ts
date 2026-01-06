import { isAxiosError, type AxiosError } from "axios";
import router from "@/ts/app/router";
import { useAuthStore } from "@/ts/features/auth";
import { useNotificationsStore } from "@/ts/features/notifications";
import { routeNames } from "@/ts/shared";

export const handleAuthError = async (error: AxiosError) => {
    const authStore = useAuthStore();

    if (error.response?.status === 401 || error.response?.status === 403) {
        if (authStore.user) {
            await authStore.logout();
        }
        router.push({ name: routeNames.Login });
        return Promise.reject(error);
    }

    return Promise.reject(error);
};

export const handleUnprocessableEntityError = async (error: AxiosError) => {
    const notificationsStore = useNotificationsStore();

    if (
        error.response?.status === 422 &&
        isAxiosError<AxiosError<{ message: string }>>(error)
    ) {
        const content = error.response.data.message;
        notificationsStore.pushNotification({
            content,
            color: "error",
        });
        return Promise.reject(error);
    }

    return Promise.reject(error);
};
